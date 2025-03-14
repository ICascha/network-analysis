import React from 'react';
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize, RotateCcw } from "lucide-react";
import { GraphChartRef } from './GraphChart';

interface CameraControlsProps {
  graphRef: React.RefObject<GraphChartRef>;
}

const CameraControls = ({ graphRef }: CameraControlsProps) => {
  const handleZoomIn = () => {
    graphRef.current?.zoomIn();
  };
  
  const handleZoomOut = () => {
    graphRef.current?.zoomOut();
  };
  
  const handleFitAll = () => {
    graphRef.current?.fitAllNodesInView();
  };
  
  const handleReset = () => {
    graphRef.current?.resetCamera();
  };
  
  return (
    <div className="flex gap-1">
      <Button 
        variant="ghost"
        size="icon"
        onClick={handleZoomIn}
        title="Zoom In"
        className="h-8 w-8"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost"
        size="icon"
        onClick={handleZoomOut}
        title="Zoom Out"
        className="h-8 w-8"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost"
        size="icon"
        onClick={handleFitAll}
        title="Fit All Nodes"
        className="h-8 w-8"
      >
        <Maximize className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost"
        size="icon"
        onClick={handleReset}
        title="Reset View"
        className="h-8 w-8"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CameraControls;