import React, { useState, useMemo } from 'react';
import { useTimeSeriesData } from './timeSeriesApi';
import LineGraph from './LineGraph';
import DualTimeSeriesGraph from './DualTimeSeriesGraph';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

// Animation styles (can be imported from a CSS file instead)
const pulseAnimation = `
  @keyframes subtle-pulse {
    0% { box-shadow: 0 0 0 1px rgba(0,153,168, 0.2); }
    50% { box-shadow: 0 0 0 2px rgba(0,153,168, 0.2); }
    100% { box-shadow: 0 0 0 1px rgba(0,153,168, 0.2); }
  }
`;

// Function to calculate rolling average
const calculateRollingMean = (data: any[], topic: string, windowSize: number) => {
  if (!data.length || windowSize < 1 || !topic) return data;
  
  const result = [...data].map((item, index) => {
    const newItem = { ...item };
    
    // Calculate the window (take previous N months)
    const startIdx = Math.max(0, index - windowSize + 1);
    const window = data.slice(startIdx, index + 1);
    
    // Calculate mean for the window
    if (window.length > 0) {
      const sum = window.reduce((acc, curr) => acc + (Number(curr[topic]) || 0), 0);
      newItem[topic] = sum / window.length;
    }
    
    return newItem;
  });
  
  return result;
};

// Function to calculate rolling average for multiple topics
const calculateMultiRollingMean = (data: any[], topics: string[], windowSize: number) => {
  if (!data.length || windowSize < 1 || !topics.length) return data;
  
  const result = [...data].map((item, index) => {
    const newItem = { ...item };
    
    // Calculate the window (take previous N months)
    const startIdx = Math.max(0, index - windowSize + 1);
    const window = data.slice(startIdx, index + 1);
    
    // Calculate mean for each topic in the window
    topics.forEach(topic => {
      if (window.length > 0) {
        const sum = window.reduce((acc, curr) => acc + (Number(curr[topic]) || 0), 0);
        newItem[topic] = sum / window.length;
      }
    });
    
    return newItem;
  });
  
  return result;
};

// Inline Select component with styling inspired by the NarrativeLayout
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

const TimeSeriesAnalysis: React.FC = () => {
  const { data, topics, isLoading, error } = useTimeSeriesData();
  const [selectedTopic, setSelectedTopic] = useState<string>('Vertrouwenscrisis');
  const [smoothingMonths, setSmoothingMonths] = useState<number>(6);
  
  // For the dual graph
  const [primaryTopic, setPrimaryTopic] = useState<string>('Afhankelijkheid');
  const [secondaryTopic, setSecondaryTopic] = useState<string>('Informatie-uitwisseling');
  const [dualSmoothingMonths, setDualSmoothingMonths] = useState<number>(6);

  // Theme color
  const themeColor = 'rgb(0,153,168)';

  // Effect to set initial selected topics when data loads
  React.useEffect(() => {
    if (topics.length > 0) {
      if (!selectedTopic) {
        setSelectedTopic(topics[0]);
      }
      if (!primaryTopic) {
        setPrimaryTopic(topics[0]);
      }
      if (!secondaryTopic && topics.length > 1) {
        setSecondaryTopic(topics[1]);
      }
    }
  }, [topics, selectedTopic, primaryTopic, secondaryTopic]);

  // Apply smoothing to single topic data
  const smoothedData = useMemo(() => {
    return calculateRollingMean(data, selectedTopic, smoothingMonths);
  }, [data, selectedTopic, smoothingMonths]);

  // Apply smoothing to dual topic data
  const smoothedDualData = useMemo(() => {
    return calculateMultiRollingMean(data, [primaryTopic, secondaryTopic].filter(Boolean), dualSmoothingMonths);
  }, [data, primaryTopic, secondaryTopic, dualSmoothingMonths]);

  // Format functions for the chart
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  
  const formatTooltip = (value: number): [string, string] => {
    return [value.toFixed(2), selectedTopic];
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="flex items-center justify-center p-10">
            <div className="text-center">
              <p className="text-gray-500">Loading time series data...</p>
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

        {/* Single Topic Section */}
        <div className="relative pt-8 border-t border-gray-200 mb-6">
          {/* Section Label */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white px-4">
            <h2 className="text-lg font-semibold" style={{ color: themeColor }}>Mentions over time</h2>
          </div>
        
          <div className="flex flex-row items-end space-x-6 mb-6">
            <InlineSelect 
              label="Selecteer Dreiging"
              value={selectedTopic} 
              options={topics.map(topic => ({ value: topic, label: topic }))}
              onChange={setSelectedTopic}
            />
            
            <div className="space-y-1 w-full max-w-[300px]">
              <label className="text-sm font-medium text-gray-500">
                Smoothing: {smoothingMonths} month{smoothingMonths > 1 ? 's' : ''}
              </label>
              <Slider 
                value={[smoothingMonths]} 
                min={1} 
                max={12} 
                step={1} 
                onValueChange={(value) => setSmoothingMonths(value[0])} 
                className="cursor-pointer"
              />
            </div>
          </div>
          
          {selectedTopic ? (
            <div className="border border-gray-200 rounded-md p-4 bg-white">
              <LineGraph 
                data={smoothedData}
                dataKey={selectedTopic}
                xAxisKey="Date"
                height={300}
                color={themeColor}
                formatXAxis={formatDate}
                formatTooltip={formatTooltip}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center p-10 h-[300px] border border-gray-200 rounded-md">
              <p className="text-gray-500">Please select a topic to view its trend</p>
            </div>
          )}
        </div>
        
        {/* Dual Topic Section */}
        <div className="relative pt-8 border-t border-gray-200 mb-6">
          {/* Section Label */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white px-4">
            <h2 className="text-lg font-semibold" style={{ color: themeColor }}>Verworvenheid</h2>
          </div>
          
          <div className="prose max-w-none mb-6">
            <p className="text-gray-600 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus. Sed porttitor lectus nibh.
            </p>
          </div>
          
          <div className="flex flex-row items-end space-x-6 mb-6">
            <InlineSelect 
              label="Eerste dreiging"
              value={primaryTopic} 
              options={topics.map(topic => ({ value: topic, label: topic }))}
              onChange={setPrimaryTopic}
            />
            
            <InlineSelect 
              label="Tweede dreiging"
              value={secondaryTopic} 
              options={topics.map(topic => ({ value: topic, label: topic }))}
              onChange={setSecondaryTopic}
            />
            
            <div className="space-y-1 w-full max-w-[300px]">
              <label className="text-sm font-medium text-gray-500">
                Smoothing: {dualSmoothingMonths} month{dualSmoothingMonths > 1 ? 's' : ''}
              </label>
              <Slider 
                value={[dualSmoothingMonths]} 
                min={1} 
                max={12} 
                step={1} 
                onValueChange={(value) => setDualSmoothingMonths(value[0])} 
                className="cursor-pointer"
              />
            </div>
          </div>
          
          {primaryTopic && secondaryTopic ? (
            <div className="border border-gray-200 rounded-md p-4 bg-white">
              <DualTimeSeriesGraph 
                data={smoothedDualData}
                primaryTopic={primaryTopic}
                secondaryTopic={secondaryTopic}
                xAxisKey="Date"
                height={300}
                formatXAxis={formatDate}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center p-10 h-[300px] border border-gray-200 rounded-md">
              <p className="text-gray-500">Please select two topics to compare their trends</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeSeriesAnalysis;