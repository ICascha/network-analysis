import React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface LineGraphProps {
  data: any[];
  dataKey: string;
  xAxisKey?: string;
  height?: number;
  color?: string;
  formatXAxis?: (value: any) => string;
  formatTooltip?: (value: any) => [string, string];
}

const LineGraph: React.FC<LineGraphProps> = ({
  data,
  dataKey,
  xAxisKey = 'Date',
  height = 300,
  color = 'rgb(0,153,168)',
  formatXAxis = (value) => value,
  formatTooltip
}) => {
  // Create a unique ID for the gradient to avoid conflicts
  const gradientId = `color-${dataKey.replace(/\s+/g, '-')}`;
  
  return (
    <div className="h-full w-full" style={{ height: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0.1} />
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
            formatter={formatTooltip}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              borderColor: 'hsl(var(--border))',
              borderRadius: '0.5rem'
            }}
          />
          <Area 
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 6, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineGraph;