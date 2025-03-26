import { useEffect, useState } from 'react';

export interface TimeSeriesDataPoint {
  index: number;
  Date: string;
  [key: string]: number | string;
}

export const useTimeSeriesData = () => {
  const [data, setData] = useState<TimeSeriesDataPoint[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Get the base URL for GitHub Pages in Vite
        const basePath = import.meta.env.BASE_URL;
        
        // Fetch time series data
        const response = await fetch(`${basePath}time_series.json`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        
        const jsonData: TimeSeriesDataPoint[] = await response.json();
        
        // Multiply all numeric data by 100
        const multipliedData = jsonData.map(dataPoint => {
          const newDataPoint = { ...dataPoint };
          
          // Iterate through all keys in the data point
          Object.keys(newDataPoint).forEach(key => {
            // Check if the value is a number and not 'index' (which should stay as is)
            if (typeof newDataPoint[key] === 'number' && key !== 'index') {
              // Multiply the value by 100
              newDataPoint[key] = (newDataPoint[key] as number) * 100;
            }
          });
          
          return newDataPoint;
        });
        
        setData(multipliedData);
        
        // Extract available topics (all keys except 'index' and 'Date')
        if (multipliedData.length > 0) {
          const extractedTopics = Object.keys(multipliedData[0])
            .filter(key => key !== 'index' && key !== 'Date');
          setTopics(extractedTopics);
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching time series data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, topics, isLoading, error };
};