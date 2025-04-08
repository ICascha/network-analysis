import React from 'react';

// Define the category color mapping
const categoryColors = {
  'Gezondheid': 'rgb(72, 143, 177)', // Using the updated color for Gezondheid
  'Geopolitiek & militair': 'rgb(72, 92, 114)',
  'Economisch': 'rgb(165, 137, 67)',
  'Sociaal & Maatschappelijk': 'rgb(158, 109, 135)',
  'Ecologisch': 'rgb(105, 145, 94)',
  'Technologisch & digitaal': 'rgb(99, 113, 163)',
  'unknown': 'rgb(133, 133, 133)'
};

interface ColorLegendProps {
  className?: string;
}

const ColorLegend: React.FC<ColorLegendProps> = ({ className = '' }) => {
  return (
    <div className={`bg-background/70 backdrop-blur-md p-3 rounded-lg shadow-lg ${className}`}>
      <h4 className="text-xs font-medium mb-2">Categorieën</h4>
      <div className="space-y-1.5">
        {Object.entries(categoryColors).map(([category, color]) => (
          // Skip unknown category in the legend
          category !== 'unknown' && (
            <div key={category} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs">{category}</span>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default ColorLegend;