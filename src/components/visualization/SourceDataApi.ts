import { useState, useEffect } from 'react';

export interface TopicData {
  [topic: string]: number;
}

export interface SourceData {
  [source: string]: TopicData;
}

export interface CategoryData {
  [source: string]: {
    [category: string]: number;
  };
}

export interface UseSourceDataReturn {
  topicsData: SourceData;
  categoriesData: CategoryData;
  sources: string[];
  isLoading: boolean;
  error: string | null;
}

export const useSourceData = (): UseSourceDataReturn => {
  const [topicsData, setTopicsData] = useState<SourceData>({});
  const [categoriesData, setCategoriesData] = useState<CategoryData>({});
  const [sources, setSources] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Get the base URL for deployment
        const basePath = import.meta.env.BASE_URL;

        // Fetch topics data
        const topicsResponse = await fetch(`${basePath}topics_per_source.json`);
        if (!topicsResponse.ok) {
          throw new Error(`Failed to fetch topics data: ${topicsResponse.statusText}`);
        }
        const topicsJson = await topicsResponse.json();
        setTopicsData(topicsJson);

        // Fetch categories data
        const categoriesResponse = await fetch(`${basePath}category_per_source.json`);
        if (!categoriesResponse.ok) {
          throw new Error(`Failed to fetch categories data: ${categoriesResponse.statusText}`);
        }
        const categoriesJson = await categoriesResponse.json();
        setCategoriesData(categoriesJson);

        // Extract sources (should be the same in both files)
        const extractedSources = Object.keys(topicsJson);
        setSources(extractedSources);

        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    topicsData,
    categoriesData,
    sources,
    isLoading,
    error
  };
};

// Helper functions for data analysis

// Get top N topics for a source by count
export const getTopTopics = (sourceData: TopicData, count: number = 5): [string, number][] => {
  if (!sourceData) return [];
  
  return Object.entries(sourceData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count);
};

// Get top N topics that are relatively more common in this source than others
export const getDistinctiveTopics = (
  sourceData: TopicData, 
  allSourcesData: SourceData,
  count: number = 5
): [string, number][] => {
  if (!sourceData || !allSourcesData) return [];
  
  const sourceName = Object.keys(allSourcesData).find(
    source => allSourcesData[source] === sourceData
  );
  
  if (!sourceName) return [];
  
  // Calculate total mentions for each topic across all sources
  const topicTotals: Record<string, number> = {};
  Object.values(allSourcesData).forEach(source => {
    Object.entries(source).forEach(([topic, mentions]) => {
      topicTotals[topic] = (topicTotals[topic] || 0) + mentions;
    });
  });
  
  // Calculate the relative frequency (% of mentions in this source vs. overall)
  const relativeFrequency: [string, number][] = Object.entries(sourceData)
    .map(([topic, mentions]): [string, number] => {
      // Skip topics with very few mentions to avoid statistical noise
      if (mentions < 5 || topicTotals[topic] < 10) return [topic, 0];
      
      const sourcePercentage = mentions / Object.values(sourceData)
        .reduce((sum, val) => sum + val, 0);
      const overallPercentage = topicTotals[topic] / Object.values(topicTotals)
        .reduce((sum, val) => sum + val, 0);
      
      // Calculate ratio (how many times more frequent in this source)
      const ratio = sourcePercentage / overallPercentage;
      return [topic, ratio];
    })
    .filter(([_, ratio]) => ratio > 0) // Filter out zero ratios
    .sort((a, b) => b[1] - a[1]);
  
  return relativeFrequency.slice(0, count);
};

// Get category data for a source
export const getCategoryData = (
  source: string,
  categoriesData: CategoryData
): [string, number][] => {
  if (!categoriesData || !source || !categoriesData[source]) return [];
  
  return Object.entries(categoriesData[source])
    .sort((a, b) => b[1] - a[1]);
};

// Calculate total mentions for a source
export const getTotalMentions = (sourceData: TopicData): number => {
  if (!sourceData) return 0;
  return Object.values(sourceData).reduce((sum, count) => sum + count, 0);
};