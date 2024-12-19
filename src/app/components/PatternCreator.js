"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Upload, 
  ZoomIn, 
  ZoomOut, 
  Save, 
  Download,
  Grid as GridIcon,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SUGGESTED_YARNS = {
  red: [
    { name: "Red Heart Super Saver", color: "#E41B17" },
    { name: "Lion Brand Vanna's Choice", color: "#C11B17" }
  ],
  blue: [
    { name: "Bernat Super Value", color: "#0000FF" },
    { name: "Caron Simply Soft", color: "#1589FF" }
  ],
  // Add more color suggestions
};

const PatternCreator = () => {
  // Theme
  const { theme, setTheme } = useTheme();

  // Core state
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [gridDimensions, setGridDimensions] = useState({ width: 20, height: 20 });
  const [numColors, setNumColors] = useState(4);
  const [pattern, setPattern] = useState(null);
  const [colorPalette, setColorPalette] = useState([]);
  const [yarnSuggestions, setYarnSuggestions] = useState([]);

  // UI state
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [showRowMarkers, setShowRowMarkers] = useState(true);
  const [currentRow, setCurrentRow] = useState(0);
  const [completedRows, setCompletedRows] = useState([]);
  const [colorStats, setColorStats] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [notes, setNotes] = useState({});

  // Load saved progress
  useEffect(() => {
    const savedProgress = localStorage.getItem('patternProgress');
    if (savedProgress) {
      const { completed, current, patternNotes } = JSON.parse(savedProgress);
      setCompletedRows(completed);
      setCurrentRow(current);
      setNotes(patternNotes || {});
    }
  }, []);

  // Save progress
  useEffect(() => {
    localStorage.setItem('patternProgress', JSON.stringify({
      completed: completedRows,
      current: currentRow,
      patternNotes: notes
    }));
  }, [completedRows, currentRow, notes]);

  // Zoom handling
  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prevZoom => Math.min(Math.max(prevZoom * delta, 0.1), 5));
    }
  }, []);

  // Image upload handling
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Process image with enhanced color detection
  const processImage = async () => {
    if (!image) return;

    const img = new Image();
    img.src = preview;
    await new Promise(resolve => img.onload = resolve);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = gridDimensions.width;
    canvas.height = gridDimensions.height;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = [];
    const colorMap = new Map();
    const uniqueColors = new Set();
    let colorIndex = 1;

    // Collect all unique colors first
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const colorKey = `${r},${g},${b}`;
      uniqueColors.add(colorKey);
    }

    // Convert colors to RGB objects for better processing
    const rgbColors = Array.from(uniqueColors).map(color => {
      const [r, g, b] = color.split(',').map(Number);
      return { r, g, b, original: color };
    });

    // K-means clustering to reduce colors
    const finalColors = kMeansColors(rgbColors, numColors);
    setColorPalette(finalColors.map(rgbToHex));

    // Map pixels to reduced color palette
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const colorKey = `${r},${g},${b}`;

      let nearestColor = findNearestColor({ r, g, b }, finalColors);
      let colorId = colorMap.get(nearestColor) || colorIndex;

      if (!colorMap.has(nearestColor)) {
        colorMap.set(nearestColor, colorIndex++);
        colorId = colorMap.get(nearestColor);
      }

      pixels.push(colorId);
    }

    // Create pattern grid
    const patternGrid = [];
    for (let y = 0; y < gridDimensions.height; y++) {
      const row = [];
      for (let x = 0; x < gridDimensions.width; x++) {
        row.push(pixels[y * gridDimensions.width + x]);
      }
      patternGrid.push(row);
    }

    setPattern(patternGrid);
    updateColorStats(patternGrid);
    suggestYarnColors(finalColors);
  };

  // Color processing utilities
  const kMeansColors = (colors, k) => {
    // Simple k-means implementation for color reduction
    let centroids = colors.slice(0, k);
    const maxIterations = 10;
    
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      // Assign points to nearest centroid
      const clusters = Array(k).fill().map(() => []);
      
      colors.forEach(color => {
        let minDist = Infinity;
        let closestCentroid = 0;
        
        centroids.forEach((centroid, i) => {
          const dist = colorDistance(color, centroid);
          if (dist < minDist) {
            minDist = dist;
            closestCentroid = i;
          }
        });
        
        clusters[closestCentroid].push(color);
      });
      
      // Update centroids
      const newCentroids = clusters.map(cluster => {
        if (cluster.length === 0) return centroids[0];
        return {
          r: Math.round(cluster.reduce((sum, c) => sum + c.r, 0) / cluster.length),
          g: Math.round(cluster.reduce((sum, c) => sum + c.g, 0) / cluster.length),
          b: Math.round(cluster.reduce((sum, c) => sum + c.b, 0) / cluster.length)
        };
      });
      
      centroids = newCentroids;
    }
    
    return centroids;
  };

  const colorDistance = (c1, c2) => {
    return Math.sqrt(
      Math.pow(c1.r - c2.r, 2) +
      Math.pow(c1.g - c2.g, 2) +
      Math.pow(c1.b - c2.b, 2)
    );
  };

  const findNearestColor = (color, palette) => {
    let minDist = Infinity;
    let nearest = palette[0];
    
    palette.forEach(c => {
      const dist = colorDistance(color, c);
      if (dist < minDist) {
        minDist = dist;
        nearest = c;
      }
    });
    
    return `${nearest.r},${nearest.g},${nearest.b}`;
  };

  const rgbToHex = (rgb) => {
    return '#' + [rgb.r, rgb.g, rgb.b]
      .map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('');
  };

  // Suggest yarn colors based on processed image
  const suggestYarnColors = (colors) => {
    const suggestions = colors.map(color => {
      const hex = rgbToHex(color);
      // Add your yarn suggestion logic here
      return SUGGESTED_YARNS[getBaseColor(color)] || [];
    });
    setYarnSuggestions(suggestions);
  };

  const getBaseColor = (rgb) => {
    // Simple logic to determine base color name
    const { r, g, b } = rgb;
    if (r > Math.max(g, b)) return 'red';
    if (b > Math.max(r, g)) return 'blue';
    // Add more color classifications
    return 'neutral';
  };

  // Update color statistics
  const updateColorStats = (grid) => {
    const stats = {};
    grid.forEach(row => {
      row.forEach(color => {
        stats[color] = (stats[color] || 0) + 1;
      });
    });
    setColorStats(stats);
  };

  // Pan functionality
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Export functions
  const exportPattern = (format) => {
    switch (format) {
      case 'pdf':
        // Implement PDF export
        break;
      case 'text':
        // Implement text export
        break;
      case 'chart':
        // Implement chart export
        break;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Upload Controls */}
      <div className="w-64 bg-card border-r p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Upload Pattern Image</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom(z => Math.max(z - 0.1, 0.1))}
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm">{Math.round(zoom * 100)}%</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom(z => Math.min(z + 0.1, 5))}
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowGrid(!showGrid)}
              title="Toggle Grid"
            >
              <GridIcon className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Download className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => exportPattern('pdf')}>
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportPattern('text')}>
                  Export Instructions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportPattern('chart')}>
                  Export Color Chart
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Pattern Display */}
        <div 
          className="w-full h-full overflow-hidden"
          onWheel={handleWheel}
        >
          {pattern ? (
            <div
              className="w-full h-full relative"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div
                className="absolute"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  transformOrigin: '0 0',
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}
              >
                <div className={`grid gap-px ${showGrid ? 'bg-gray-200' : 'gap-0'}`}>
                  {pattern.map((row, y) => (
                    <div
                      key={y}
                      className={`grid grid-flow-col gap-px ${
                        y === currentRow ? 'bg-yellow-100' : ''
                      } ${showGrid ? '' : 'gap-0'}`}
                    >
                      {row.map((cell, x) => (
                        <div
                          key={`${x}-${y}`}
                          className={`w-8 h-8 flex items-center justify-center ${
                            showGrid ? 'bg-white' : ''
                          }`}
                          style={{
                            backgroundColor: completedRows.includes(y)
                              ? '#e5e5e5'
                              : colorPalette[cell - 1] || 'white'
                          }}
                        >
                          {cell}
                          {showRowMarkers && y % 5 === 0 && x === 0 && (
                            <div className="absolute -left-6 text-sm text-gray-500">
                              {y + 1}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              Upload an image and generate a pattern to start
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Progress Panel */}
      <div className="w-64 bg-card border-l p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Progress</h2>
        {pattern ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Current Row: {currentRow + 1}</Label>
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={() => setCurrentRow(prev => Math.max(0, prev - 1))}
                  disabled={currentRow === 0}
                >
                  Previous Row
                </Button>
                <Button
                  onClick={() => {
                    setCurrentRow(prev => Math.min(pattern.length - 1, prev + 1));
                    setCompletedRows(prev => [...new Set([...prev, currentRow])]);
                  }}
                  disabled={currentRow === pattern.length - 1}
                >
                  Next Row
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Row Notes</Label>
              <Input
                as="textarea"
                rows={3}
                value={notes[currentRow] || ''}
                onChange={(e) => setNotes(prev => ({
                  ...prev,
                  [currentRow]: e.target.value
                }))}
                placeholder="Add notes for this row..."
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Color Statistics</Label>
              <div className="space-y-1">
                {Object.entries(colorStats).map(([color, count]) => (
                  <div key={color} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: colorPalette[parseInt(color) - 1] }}
                      />
                      <span>Color {color}:</span>
                    </div>
                    <span>{count} stitches</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Progress: {Math.round((completedRows.length / pattern.length) * 100)}%</Label>
              <div className="w-full bg-gray-200 rounded h-2">
                <div
                  className="bg-blue-600 h-full rounded"
                  style={{
                    width: `${(completedRows.length / pattern.length) * 100}%`
                  }}
                />
              </div>
            </div>

            {yarnSuggestions.length > 0 && (
              <div className="space-y-2">
                <Label>Suggested Yarns</Label>
                <div className="space-y-1">
                  {yarnSuggestions.map((suggestions, colorIndex) => (
                    <div key={colorIndex} className="space-y-1">
                      <span className="text-sm font-medium">Color {colorIndex + 1}:</span>
                      {suggestions.map((yarn, i) => (
                        <div key={i} className="flex items-center space-x-2 text-sm">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: yarn.color }}
                          />
                          <span>{yarn.name}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-500">
            Generate a pattern to see progress
          </div>
        )}
      </div>
    </div>
  );
};

export default PatternCreator;