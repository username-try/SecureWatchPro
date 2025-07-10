import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ROICoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ROISelectorProps {
  imageUrl: string;
  initialROI?: ROICoordinates;
  onROIChange?: (roi: ROICoordinates) => void;
  className?: string;
}

export function ROISelector({ imageUrl, initialROI, onROIChange, className }: ROISelectorProps) {
  const [roi, setROI] = useState<ROICoordinates>(
    initialROI || { x: 0.2, y: 0.2, width: 0.6, height: 0.6 }
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragMode, setDragMode] = useState<'move' | 'resize'>('move');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setDragStart({ x, y });
    setIsDragging(true);
    setDragMode('move');
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    if (dragMode === 'move') {
      const deltaX = x - dragStart.x;
      const deltaY = y - dragStart.y;

      const newROI = {
        x: Math.max(0, Math.min(1 - roi.width, roi.x + deltaX)),
        y: Math.max(0, Math.min(1 - roi.height, roi.y + deltaY)),
        width: roi.width,
        height: roi.height,
      };

      setROI(newROI);
      onROIChange?.(newROI);
      setDragStart({ x, y });
    }
  }, [isDragging, dragStart, roi, dragMode, onROIChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, corner: string) => {
    e.stopPropagation();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setDragStart({ x, y });
    setIsDragging(true);
    setDragMode('resize');
  }, []);

  return (
    <div 
      ref={containerRef}
      className={cn("relative aspect-video bg-slate-700 rounded-lg overflow-hidden cursor-crosshair", className)}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <img 
        src={imageUrl} 
        alt="ROI selection" 
        className="w-full h-full object-cover"
        draggable={false}
      />
      
      {/* ROI Rectangle */}
      <div
        className="absolute border-2 border-dashed border-blue-400 bg-blue-400/10 cursor-move"
        style={{
          left: `${roi.x * 100}%`,
          top: `${roi.y * 100}%`,
          width: `${roi.width * 100}%`,
          height: `${roi.height * 100}%`,
        }}
      >
        {/* Resize handles */}
        <div
          className="absolute -top-1 -left-1 w-3 h-3 bg-blue-400 rounded-full cursor-nw-resize"
          onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
        />
        <div
          className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full cursor-ne-resize"
          onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
        />
        <div
          className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-400 rounded-full cursor-sw-resize"
          onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
        />
        <div
          className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-400 rounded-full cursor-se-resize"
          onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
        />
      </div>
    </div>
  );
}
