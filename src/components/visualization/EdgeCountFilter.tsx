import React from 'react';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Gauge } from "lucide-react";

interface EdgeCountFilterProps {
  value: number;
  onChange: (value: number) => void;
  max: number;
  min?: number;
}

const EdgeCountFilter: React.FC<EdgeCountFilterProps> = ({ 
  value, 
  onChange, 
  max, 
  min = 1 
}) => {
  const handleChange = (newValue: number[]) => {
    onChange(newValue[0]);
  };

  return (
    <div className="bg-background/70 backdrop-blur-md p-3 rounded-lg shadow-lg flex flex-col gap-2 w-48">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center">
          <Gauge className="h-4 w-4 mr-1" />
          <Label className="text-xs font-medium">Citatie Drempel</Label>
        </div>
        <Badge variant="outline" className="h-5 px-2 text-xs font-mono">
          ≥ {value}
        </Badge>
      </div>
      
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={handleChange}
        className="w-full"
      />
      
      <div className="flex justify-between mt-1">
        <span className="text-xs text-muted-foreground">{min}</span>
        <span className="text-xs text-muted-foreground">{max}</span>
      </div>
      
      <p className="text-xs text-muted-foreground mt-1">
        Toont alleen verbindingen met {value} of meer citaties
      </p>
    </div>
  );
};

export default EdgeCountFilter;