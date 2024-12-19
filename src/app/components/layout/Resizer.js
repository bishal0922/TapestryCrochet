import React from 'react';

const Resizer = ({ onResize, isVertical = true }) => {
  const handleMouseDown = (e) => {
    e.preventDefault();
    const startPos = isVertical ? e.clientX : e.clientY;
    const handleMouseMove = (e) => {
      const currentPos = isVertical ? e.clientX : e.clientY;
      const delta = currentPos - startPos;
      onResize(delta);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className={`${
        isVertical ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize'
      } bg-border hover:bg-primary/50 transition-colors`}
      onMouseDown={handleMouseDown}
    />
  );
};

export default Resizer;