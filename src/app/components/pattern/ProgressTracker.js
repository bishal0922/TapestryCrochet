// src/components/pattern/ProgressTracker.jsx
import React from 'react';
import { usePattern } from '@/contexts/PatternContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronUp, ChevronDown, Check } from 'lucide-react';

const ProgressTracker = () => {
  const { state, dispatch } = usePattern();
  const { pattern, currentRow, completedRows, notes } = state;

  const handlePreviousRow = () => {
    dispatch({ 
      type: 'SET_CURRENT_ROW', 
      payload: Math.max(0, currentRow - 1) 
    });
  };

  const handleNextRow = () => {
    if (!pattern) return;
    dispatch({ 
      type: 'SET_CURRENT_ROW', 
      payload: Math.min(pattern.length - 1, currentRow + 1) 
    });
    dispatch({ 
      type: 'COMPLETE_ROW', 
      payload: currentRow 
    });
  };

  const handleNoteChange = (text) => {
    dispatch({
      type: 'UPDATE_NOTE',
      payload: { row: currentRow, text }
    });
  };

  const calculateProgress = () => {
    if (!pattern) return 0;
    return Math.round((completedRows.length / pattern.length) * 100);
  };

  const estimateTimeRemaining = () => {
    if (!pattern || completedRows.length === 0) return null;
    
    const averageTimePerRow = 5; // minutes (this could be calculated based on actual tracking)
    const remainingRows = pattern.length - completedRows.length;
    const remainingMinutes = remainingRows * averageTimePerRow;
    
    if (remainingMinutes < 60) return `${remainingMinutes} minutes`;
    if (remainingMinutes < 1440) return `${Math.round(remainingMinutes / 60)} hours`;
    return `${Math.round(remainingMinutes / 1440)} days`;
  };

  if (!pattern) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Progress Tracking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Row Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Current Row: {currentRow + 1}</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousRow}
                disabled={currentRow === 0}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextRow}
                disabled={currentRow === pattern.length - 1}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => dispatch({ type: 'COMPLETE_ROW', payload: currentRow })}
              disabled={completedRows.includes(currentRow)}
            >
              <Check className="mr-2 h-4 w-4" />
              Mark Row Complete
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress: {calculateProgress()}%</span>
            <span className="text-muted-foreground">
              {completedRows.length} / {pattern.length} rows
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
          {estimateTimeRemaining() && (
            <p className="text-sm text-muted-foreground">
              Estimated time remaining: {estimateTimeRemaining()}
            </p>
          )}
        </div>

        {/* Row Notes */}
        <div className="space-y-2">
          <Label htmlFor="rowNotes">Row Notes</Label>
          <Input
            id="rowNotes"
            as="textarea"
            rows={3}
            className="resize-none"
            placeholder="Add notes for this row..."
            value={notes[currentRow] || ''}
            onChange={(e) => handleNoteChange(e.target.value)}
          />
        </div>

        {/* Keyboard Shortcuts */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Keyboard shortcuts:</p>
          <ul className="space-y-1">
            <li>↑/↓ - Navigate rows</li>
            <li>Space - Mark row complete</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressTracker;