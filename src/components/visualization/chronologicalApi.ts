import { useState, useEffect } from 'react';

export interface Document {
  title: string;
  document_link: string;
}

export interface EmergingThreat {
  topic_id: number;
  emergence_date: string;
  keyword: string;
  samenvatting: string;
  aantal_berichten: number;
  bronnen: number;
  unieke_bronnen?: string[];
  documenten?: Document[];
}

export const useChronologicalData = () => {
  const [data, setData] = useState<EmergingThreat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const basePath = import.meta.env.BASE_URL;
        const response = await fetch(`${basePath}emerging_threats.json`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // We'll let the component handle sorting as needed
        setData(result.emerging_threats);
        setError(null);
      } catch (err) {
        console.error('Error fetching chronological data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
};