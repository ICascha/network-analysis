/**
 * Service to fetch and manage network graph data
 */

// Define type for citation objects
export interface Citation {
  title: string;
  document_type: string;
  source: string;
  publication_date: string;
  document_link: string;
  citaat: string;
}

// Define type for relation citation objects
export interface RelationCitation {
  filename: string;
  citaat: string;
  oorzaak: string;
  gevolg: string;
}

// Define types for our enhanced network data
export interface Node {
  id: string;
  label: string;
  citaten: Citation[];
  nr_docs: number;
  [key: string]: any; // For any additional properties
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label: string;
  weight: number;
  citaat_relaties: RelationCitation[];
  [key: string]: any; // For any additional properties
}

export interface NetworkData {
  nodes: Node[];
  edges: Edge[];
}

/**
 * Fetches network data from JSON files
 */
export const fetchNetworkData = async (): Promise<NetworkData> => {
  try {
    // Get the base URL for GitHub Pages in Vite
    const basePath = import.meta.env.BASE_URL;
    
    // Fetch nodes and edges data from JSON files with the correct base path
    const [nodesResponse, edgesResponse] = await Promise.all([
      fetch(`${basePath}nodes.json`),
      fetch(`${basePath}edges.json`)
    ]);
    
    // Check if responses are successful
    if (!nodesResponse.ok || !edgesResponse.ok) {
      throw new Error('Failed to fetch graph data');
    }
    
    // Parse JSON responses
    const nodes = await nodesResponse.json();
    const edges = await edgesResponse.json();
    
    return { nodes, edges };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error loading graph data:', errorMessage);
    throw error;
  }
};