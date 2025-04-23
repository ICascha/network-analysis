import { useState, useEffect } from 'react';

// Types definitions
export interface Citation {
  citation_id: number;
  source: string;
  oorzaak: string;
  gevolg: string;
  citaat: string;
  filename?: string;
}

export interface TextSegment {
  type: "text";
  content: string;
}

export interface CitationSegment {
  type: "citation";
  id: number;
  citation: Citation;
}

export type Segment = TextSegment | CitationSegment;

export interface ScenarioContent {
  title: string;
  segments: Segment[];
  path: string[];
  path_citation_counts: number[];
  total_citations: number;
  summary: string;
}

export interface AlternativePath {
  target: string;
  path_length: number;
  path: string[];
}

export interface ScenarioResponse {
  success: boolean;
  message: string;
  scenario?: ScenarioContent;
  raw_text?: string;
  alternative_paths?: AlternativePath[];
}

// Hook to fetch all available threats
export const useThreats = () => {
  const [threats, setThreats] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThreats = async () => {
      try {
        setIsLoading(true);
        
        // Get the API endpoint from environment variables or use default
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/threats`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setThreats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching threats:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchThreats();
  }, []);

  return { threats, isLoading, error };
};

// Hook to generate a scenario between a source and target threat
export const useScenarioGenerator = () => {
  const [scenario, setScenario] = useState<ScenarioContent | null>(null);
  const [alternativePaths, setAlternativePaths] = useState<AlternativePath[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const generateScenario = async (source: string, target: string, pruneWeakEdges: boolean = true) => {
    try {
      setIsLoading(true);
      setScenario(null);
      setAlternativePaths(null);
      setError(null);
      setMessage(null);
      
      // Get the API endpoint from environment variables or use default
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/generate-scenario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source,
          target,
          prune_weak_edges: pruneWeakEdges
        })
      });
      
      const data: ScenarioResponse = await response.json();
      
      if (data.success && data.scenario) {
        setScenario(data.scenario);
      } else {
        setMessage(data.message);
        if (data.alternative_paths) {
          setAlternativePaths(data.alternative_paths);
        }
      }
    } catch (err) {
      console.error('Error generating scenario:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    scenario, 
    alternativePaths,
    isLoading, 
    error,
    message,
    generateScenario 
  };
};