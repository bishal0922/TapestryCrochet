// src/components/pattern/PatternGrid.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { usePattern } from '@/contexts/PatternContext';
import { cn } from '@/lib/utils';

const PatternGrid = () => {
  const { state, dispatch } = usePattern();
  const { pattern, colorPalette, currentRow, completedRows, settings } = state;
  
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const gridRef = useRef(null);

  // Handle zoom with mouse wheel
  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => Math.min(Math.max(prev * delta, 0.1), 5));
    }
  }, []);

  // Pan functionality
  const handleMouseDown = useCallback((e) => {
    if (e.button === 0) { // Left click only
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  }, [position]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          dispatch({ type: 'SET_CURRENT_ROW', payload: Math.max(0, currentRow - 1) });
          break;
        case 'ArrowDown':
          if (pattern) {
            dispatch({
              type: 'SET_CURRENT_ROW',
              payload: Math.min(pattern.length - 1, currentRow + 1)
            });
          }
          break;
        case 'Space':
          if (pattern) {
            dispatch({ type: 'COMPLETE_ROW', payload: currentRow });
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentRow, pattern, dispatch]);

  // Auto-scroll to current row
  useEffect(() => {
    if (gridRef.current && pattern) {
      const rowHeight = gridRef.current.clientHeight / pattern.length;
      const targetScroll = rowHeight * currentRow - gridRef.current.clientHeight / 2;
      gridRef.current.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
  }, [currentRow, pattern]);

  if (!pattern) return null;

  return (
    <div
      ref={gridRef}
      className="relative w-full h-full overflow-hidden"
      onWheel={handleWheel}
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
        <div className={cn(
          "grid gap-px",
          settings.showGrid ? "bg-gray-200 dark:bg-gray-700" : "gap-0"
        )}>
          {pattern.map((row, y) => (
            <div
              key={y}
              className={cn(
                "grid grid-flow-col gap-px",
                y === currentRow && "bg-yellow-100/50 dark:bg-yellow-900/30",
                y === currentRow - 1 && "bg-yellow-50/30 dark:bg-yellow-900/20",
                settings.showGrid ? "" : "gap-0"
              )}
            >
              {row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center text-xs",
                    settings.showGrid ? "bg-background" : "",
                    completedRows.includes(y) && "opacity-50"
                  )}
                  style={{
                    backgroundColor: colorPalette[cell - 1]
                  }}
                >
                  {cell}
                  {settings.showRowMarkers && 
                   y % settings.rowMarkerFrequency === 0 && 
                   x === 0 && (
                    <div className="absolute -left-6 text-sm text-muted-foreground">
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
  );
};

export default PatternGrid;