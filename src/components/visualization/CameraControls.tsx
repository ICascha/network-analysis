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
    <div className="flex space-x-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleZoomIn}
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleZoomOut}
        title="Zoom Out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleFitAll}
        title="Fit All Nodes"
        className="ml-2"
      >
        <Maximize className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleReset}
        title="Reset View"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CameraControls;