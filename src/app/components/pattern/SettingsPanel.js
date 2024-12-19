// src/components/pattern/SettingsPanel.jsx
import React from 'react';
import { usePattern } from '@/contexts/PatternContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SettingsPanel = () => {
  const { state, dispatch } = usePattern();
  const { settings } = state;

  const handleSettingChange = (key, value) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { [key]: value }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="showGrid">Show Grid</Label>
            <Switch
              id="showGrid"
              checked={settings.showGrid}
              onCheckedChange={(checked) => handleSettingChange('showGrid', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showRowMarkers">Show Row Markers</Label>
            <Switch
              id="showRowMarkers"
              checked={settings.showRowMarkers}
              onCheckedChange={(checked) => handleSettingChange('showRowMarkers', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rowMarkerFrequency">Row Marker Frequency</Label>
            <Select
              value={settings.rowMarkerFrequency.toString()}
              onValueChange={(value) => handleSettingChange('rowMarkerFrequency', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Every 5 rows</SelectItem>
                <SelectItem value="10">Every 10 rows</SelectItem>
                <SelectItem value="20">Every 20 rows</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gridLineThickness">Grid Line Thickness</Label>
            <Select
              value={settings.gridLineThickness.toString()}
              onValueChange={(value) => handleSettingChange('gridLineThickness', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select thickness" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Thin</SelectItem>
                <SelectItem value="2">Medium</SelectItem>
                <SelectItem value="3">Thick</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Default Grid Size</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gridWidth">Width</Label>
                <Input
                  id="gridWidth"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.defaultGridSize.width}
                  onChange={(e) => handleSettingChange('defaultGridSize', {
                    ...settings.defaultGridSize,
                    width: parseInt(e.target.value)
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gridHeight">Height</Label>
                <Input
                  id="gridHeight"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.defaultGridSize.height}
                  onChange={(e) => handleSettingChange('defaultGridSize', {
                    ...settings.defaultGridSize,
                    height: parseInt(e.target.value)
                  })}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsPanel;