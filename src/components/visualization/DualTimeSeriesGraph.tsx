import React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DualTimeSeriesGraphProps {
  data: any[];
  primaryTopic: string;
  secondaryTopic: string;
  xAxisKey?: string;
  height?: number;
  primaryColor?: string;
  secondaryColor?: string;
  formatXAxis?: (value: string) => string;
}

const DualTimeSeriesGraph: React.FC<DualTimeSeriesGraphProps> = ({
  data,
  primaryTopic,
  secondaryTopic,
  xAxisKey = 'Date',
  height = 300,
  primaryColor = 'rgb(0,153,168)',
  secondaryColor = 'rgb(168,45,0)',
  formatXAxis = (value: string) => value,
}) => {
  // Create unique IDs for the gradients
  const primaryGradientId = `color-${primaryTopic.replace(/\s+/g, '-')}`;
  const secondaryGradientId = `color-${secondaryTopic.replace(/\s+/g, '-')}`;
  
  return (
    <div className="h-full w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id={primaryGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={primaryColor} stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id={secondaryGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={secondaryColor} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
          <XAxis
            dataKey={xAxisKey}
            tickFormatter={formatXAxis}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickMargin={10}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            label={{ 
              value: "Benoemd (%)", 
              angle: -90, 
              position: 'insideLeft',
              style: { 
                textAnchor: 'middle',
                fill: 'hsl(var(--muted-foreground))'
              },
              dx: -10
            }}
          />
          <Tooltip
            formatter={(value: number, name: string) => [value.toFixed(2), name]}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              borderColor: 'hsl(var(--border))',
              borderRadius: '0.5rem'
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey={primaryTopic}
            name={primaryTopic}
            stroke={primaryColor}
            strokeWidth={2}
            fillOpacity={0.4}
            fill={`url(#${primaryGradientId})`}
            dot={false}
            activeDot={{ r: 6, fill: primaryColor }}
          />
          <Area
            type="monotone"
            dataKey={secondaryTopic}
            name={secondaryTopic}
            stroke={secondaryColor}
            strokeWidth={2}
            fillOpacity={0.4}
            fill={`url(#${secondaryGradientId})`}
            dot={false}
            activeDot={{ r: 6, fill: secondaryColor }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DualTimeSeriesGraph;