import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useSourceData, getCategoryData, getTotalMentions } from './SourceDataApi';

// Animation styles (can be imported from a CSS file instead)
const pulseAnimation = `
  @keyframes subtle-pulse {
    0% { box-shadow: 0 0 0 1px rgba(0,153,168, 0.2); }
    50% { box-shadow: 0 0 0 2px rgba(0,153,168, 0.2); }
    100% { box-shadow: 0 0 0 1px rgba(0,153,168, 0.2); }
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
  }
`;

// Color palette for the pie chart
const CATEGORY_COLORS = [
  '#0099A8', // primary theme color
  '#33ADBA',
  '#66C2CB',
  '#99D6DC',
  '#CCEAED',
  '#FFB800' // accent color for contrast
];

// Inline Select component with styling inspired by the TimeSeriesAnalysis
const InlineSelect = ({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: { value: string, label: string }[];
  onChange: (value: string) => void;
}) => (
  <div className="space-y-1">
    <style>{pulseAnimation}</style>
    <label className="text-sm font-medium text-gray-500">{label}</label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[200px] border border-gray-200 bg-white hover:bg-blue-50 animate-[subtle-pulse_3s_ease-in-out_infinite]">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="font-medium">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

// Custom tooltip for the pie chart
const CustomTooltip = ({ active, payload, showRelative }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 shadow-md rounded">
        <p className="font-medium">{payload[0].name}</p>
        {showRelative ? (
          <>
            <p className="text-sm">Relative: <span className="font-medium">
              {payload[0].value.toFixed(1)}% of all '{payload[0].name}' mentions
            </span></p>
            <p className="text-sm">Actual count: <span className="font-medium">
              {payload[0].payload.rawValue.toLocaleString()}
            </span></p>
          </>
        ) : (
          <>
            <p className="text-sm">Count: <span className="font-medium">
              {payload[0].value.toLocaleString()}
            </span></p>
            <p className="text-sm">Percentage: <span className="font-medium">
              {(payload[0].payload.percent * 100).toFixed(1)}%
            </span></p>
          </>
        )}
      </div>
    );
  }
  return null;
};

const SourceAnalysis: React.FC = () => {
  const { topicsData, categoriesData, sources, isLoading, error } = useSourceData();
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [showRelative, setShowRelative] = useState<boolean>(false);
  
  // Theme color matching the example
  const themeColor = 'rgb(0,153,168)';

  // Set initial selected source when data loads
  React.useEffect(() => {
    if (sources.length > 0 && !selectedSource) {
      setSelectedSource(sources[0]);
    }
  }, [sources, selectedSource]);

  // Calculate the category data for the selected source
  const categoryData = useMemo(() => {
    if (!selectedSource || !categoriesData[selectedSource]) {
      return [];
    }
    
    const data = getCategoryData(selectedSource, categoriesData);
    const total = data.reduce((sum, [_, value]) => sum + value, 0);
    
    // If showing relative numbers, calculate percentages across all sources
    if (showRelative) {
      // Calculate totals across all sources for each category
      const categoryTotals: Record<string, number> = {};
      
      // For each source
      Object.keys(categoriesData).forEach(source => {
        // For each category in that source
        Object.entries(categoriesData[source]).forEach(([category, count]) => {
          categoryTotals[category] = (categoryTotals[category] || 0) + count;
        });
      });
      
      return data.map(([name, value]) => {
        // Calculate what percentage of all mentions of this category are from this source
        const categoryTotal = categoryTotals[name] || 1; // Avoid division by zero
        const relativeValue = (value / categoryTotal) * 100;
        
        return {
          name,
          value: showRelative ? relativeValue : value,
          rawValue: value,
          percent: value / total,
          // Store the relative percentage for the tooltip
          relativePercent: value / categoryTotal
        };
      });
    }
    
    // For absolute numbers, just return the raw values
    return data.map(([name, value]) => ({
      name,
      value,
      rawValue: value,
      percent: value / total
    }));
  }, [selectedSource, categoriesData, showRelative]);

  // Calculate topics for the selected source (all topics, not just top 5)
  const sortedTopics = useMemo(() => {
    if (!selectedSource || !topicsData[selectedSource]) {
      return [];
    }
    
    if (showRelative) {
      // For relative mode, calculate what percentage of each topic's mentions comes from this source
      const sourceTopics = topicsData[selectedSource];
      
      // Calculate totals across all sources for each topic
      const topicTotals: Record<string, number> = {};
      
      // For each source
      Object.keys(topicsData).forEach(source => {
        // For each topic in that source
        Object.entries(topicsData[source]).forEach(([topic, count]) => {
          topicTotals[topic] = (topicTotals[topic] || 0) + count;
        });
      });
      
      // Convert to percentages and sort
      const topicsWithPercentages = Object.entries(sourceTopics)
        .map(([topic, count]) => {
          const total = topicTotals[topic] || 1; // Avoid division by zero
          const percentage = (count / total) * 100;
          return [topic, percentage, count] as [string, number, number];
        })
        .sort((a, b) => b[1] - a[1]);
      
      return topicsWithPercentages;
    }
    
    // For absolute mode, return all topics sorted by count
    return Object.entries(topicsData[selectedSource])
      .sort((a, b) => b[1] - a[1]);
  }, [selectedSource, topicsData, showRelative]);

  // Calculate total mentions for the selected source
  const totalMentions = useMemo(() => {
    if (!selectedSource || !topicsData[selectedSource]) {
      return 0;
    }
    
    return getTotalMentions(topicsData[selectedSource]);
  }, [selectedSource, topicsData]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="flex items-center justify-center p-10">
            <div className="text-center">
              <p className="text-gray-500">Loading source data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="flex items-center justify-center p-10">
            <div className="text-center">
              <p className="text-red-500">Error loading data: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="relative w-full bg-white shadow-md px-8 py-6">
        <div className="prose max-w-none mb-6">
          <p className="text-gray-600 leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor.
          </p>
        </div>

        {/* Category Distribution Section */}
        <div className="relative pt-8 border-t border-gray-200 mb-6">
          {/* Section Label */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white px-4">
            <h2 className="text-lg font-semibold" style={{ color: themeColor }}>Category Distribution</h2>
          </div>
        
          <div className="flex flex-row items-end space-x-6 mb-6">
            <InlineSelect 
              label="Select Source"
              value={selectedSource} 
              options={sources.map(source => ({ value: source, label: source }))}
              onChange={setSelectedSource}
            />
            
            <div className="flex items-center space-x-2">
              <Switch
                id="relative-mode"
                checked={showRelative}
                onCheckedChange={setShowRelative}
              />
              <Label htmlFor="relative-mode" className="text-sm font-medium text-gray-500">
                {showRelative ? "Showing Relative Numbers" : "Showing Absolute Numbers"}
              </Label>
            </div>
          </div>
          
          {selectedSource ? (
            <div className="border border-gray-200 rounded-md p-4 bg-white">
              <div className="flex flex-col md:flex-row">
                {/* Pie Chart */}
                <div className="w-full md:w-1/2 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                      >
                        {categoryData.map((_, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip showRelative={showRelative} />} />
                      <Legend layout="vertical" align="right" verticalAlign="middle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Topics List with Scrollbar */}
                <div className="w-full md:w-1/2 pl-0 md:pl-6 mt-4 md:mt-0">
                  <h3 className="text-md font-medium mb-2" style={{ color: themeColor }}>
                    Topics - {selectedSource}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Total mentions: {totalMentions.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mb-2 italic">
                    {showRelative 
                      ? "Showing relative values: what percentage of each topic/category's total mentions across all sources comes from this source" 
                      : "Showing absolute numbers: raw counts for this source"}
                  </p>
                  <div className="h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="space-y-2">
                      {sortedTopics.map((data) => {
                        // In relative mode, data includes [topic, percentage, rawCount]
                        // In absolute mode, data is [topic, count]
                        const topic = data[0];
                        const value = showRelative ? data[1] : data[1];
                        const rawCount = showRelative ? data[2] : data[1];
                        
                        return (
                          <div key={topic} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="font-medium">{topic}</span>
                            <div className="text-right">
                              <span className="text-gray-600">
                                {showRelative 
                                  ? `${value.toFixed(1)}%` 
                                  : (rawCount as number).toLocaleString()}
                              </span>
                              {showRelative && (
                                <span className="text-xs text-gray-400 block">
                                  ({(rawCount as number).toLocaleString()} mentions)
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-10 h-[300px] border border-gray-200 rounded-md">
              <p className="text-gray-500">Please select a source to view its data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SourceAnalysis;