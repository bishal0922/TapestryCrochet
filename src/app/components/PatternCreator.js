// src/app/components/PatternCreator.js
'use client'

import React from 'react';
import { Upload } from 'lucide-react';
import { PatternProvider } from '@/contexts/PatternContext';
import { usePattern } from '@/contexts/PatternContext';
import MainLayout from '@/app/components/layout/MainLayout';
import PatternGrid from '@/app/components/pattern/PatternGrid';
import ColorPalette from '@/app/components/pattern/ColorPalette';
import ProgressTracker from '@/app/components/pattern/ProgressTracker';
import SettingsPanel from '@/app/components/pattern/SettingsPanel';
import PatternExport from '@/app/components/pattern/PatternExport';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { processImage } from '@/lib/imageProcessor';

const PatternCreatorContent = () => {
  const { state, dispatch } = usePattern();
  const { image, preview, gridDimensions, numColors } = state;

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      dispatch({ type: 'SET_IMAGE', payload: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch({ type: 'SET_PREVIEW', payload: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessImage = async () => {
    if (!image) return;

    try {
      const result = await processImage(image, gridDimensions, numColors);
      dispatch({ type: 'SET_PATTERN', payload: result.pattern });
      dispatch({ type: 'SET_COLOR_PALETTE', payload: result.colorPalette });
    } catch (error) {
      console.error('Failed to process image:', error);
    }
  };

  return (
    <MainLayout>
      {{
        leftSidebar: (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Image Upload Section */}
                  <div className="space-y-2">
                    <Label htmlFor="imageUpload">Upload Pattern Image</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="imageUpload"
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('imageUpload').click()}
                        className="w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Choose Image
                      </Button>
                    </div>
                    {preview && (
                      <img
                        src={preview}
                        alt="Pattern preview"
                        className="w-full h-40 object-contain"
                      />
                    )}
                  </div>

                  {/* Grid and Color Settings with Sliders */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="gridWidth">Width: {gridDimensions.width}</Label>
                        <span className="text-sm text-muted-foreground">20-100</span>
                      </div>
                      <input
                        id="gridWidth"
                        type="range"
                        min="20"
                        max="100"
                        value={gridDimensions.width}
                        onChange={(e) => dispatch({
                          type: 'SET_GRID_DIMENSIONS',
                          payload: {
                            ...gridDimensions,
                            width: parseInt(e.target.value)
                          }
                        })}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="gridHeight">Height: {gridDimensions.height}</Label>
                        <span className="text-sm text-muted-foreground">20-100</span>
                      </div>
                      <input
                        id="gridHeight"
                        type="range"
                        min="20"
                        max="100"
                        value={gridDimensions.height}
                        onChange={(e) => dispatch({
                          type: 'SET_GRID_DIMENSIONS',
                          payload: {
                            ...gridDimensions,
                            height: parseInt(e.target.value)
                          }
                        })}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="numColors">Number of Colors: {numColors}</Label>
                        <span className="text-sm text-muted-foreground">2-8</span>
                      </div>
                      <input
                        id="numColors"
                        type="range"
                        min="2"
                        max="8"
                        value={numColors}
                        onChange={(e) => dispatch({
                          type: 'SET_NUM_COLORS',
                          payload: parseInt(e.target.value)
                        })}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleProcessImage}
                    disabled={!image}
                    className="w-full"
                  >
                    Generate Pattern
                  </Button>
                </div>
              </CardContent>
            </Card>

            <ColorPalette />
            <PatternExport />
          </div>
        ),
        main: (
          <div className="h-full p-4">
            <PatternGrid />
          </div>
        ),
        rightSidebar: (
          <div className="space-y-6">
            <ProgressTracker />
            <SettingsPanel />
          </div>
        ),
      }}
    </MainLayout>
  );
};

const PatternCreator = () => {
  return (
    <PatternProvider>
      <PatternCreatorContent />
    </PatternProvider>
  );
};

export default PatternCreator;