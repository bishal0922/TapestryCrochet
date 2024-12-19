// src/components/pattern/ColorPalette.jsx
import React from 'react';
import { usePattern } from '@/contexts/PatternContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { hexToRgb } from '@/lib/colorUtils';
import { SUGGESTED_YARNS } from '@/lib/colorUtils';

const ColorPalette = () => {
  const { state, dispatch } = usePattern();
  const { colorPalette, pattern } = state;

  const handleColorChange = (index, newColor) => {
    const oldColor = index + 1;
    dispatch({
      type: 'UPDATE_COLOR',
      payload: { oldColor, newColor: oldColor }  // Keep same number, just update palette
    });

    const newPalette = [...colorPalette];
    newPalette[index] = newColor;
    dispatch({ type: 'SET_COLOR_PALETTE', payload: newPalette });
  };

  const calculateStitchCount = (colorIndex) => {
    if (!pattern) return 0;
    return pattern.flat().filter(cell => cell === colorIndex + 1).length;
  };

  const getYarnSuggestions = (hexColor) => {
    const rgb = hexToRgb(hexColor);
    if (!rgb) return [];
    
    // Find closest matching color category
    let minDistance = Infinity;
    let bestMatch = 'neutral';
    
    Object.entries(SUGGESTED_YARNS).forEach(([category, yarns]) => {
      const categoryColor = hexToRgb(yarns[0].color);
      const distance = Math.sqrt(
        Math.pow(rgb.r - categoryColor.r, 2) +
        Math.pow(rgb.g - categoryColor.g, 2) +
        Math.pow(rgb.b - categoryColor.b, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = category;
      }
    });
    
    return SUGGESTED_YARNS[bestMatch];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Color Palette</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {colorPalette.map((color, index) => {
          const stitchCount = calculateStitchCount(index);
          const suggestions = getYarnSuggestions(color);

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-4">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: color }}
                />
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  className="w-24"
                />
                <Label className="text-sm">
                  {stitchCount} stitches
                </Label>
              </div>
              {suggestions.length > 0 && (
                <div className="pl-12 space-y-1">
                  <Label className="text-sm text-muted-foreground">
                    Suggested Yarns:
                  </Label>
                  {suggestions.map((yarn, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: yarn.color }}
                      />
                      <span>{yarn.name}</span>
                      <span className="text-muted-foreground">
                        ({yarn.weight} weight, {yarn.fiber})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ColorPalette;