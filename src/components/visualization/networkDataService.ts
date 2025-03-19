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
  data?: {
    hub?: number;    // Added for HITS algorithm
    auth?: number;   // Added for HITS algorithm
    [key: string]: any;
  };
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

/**
 * Implements the HITS algorithm to calculate hub and authority scores for nodes
 * @param networkData The network data containing nodes and edges
 * @param k The number of iterations to run the algorithm
 * @returns The network data with updated hub and authority scores
 */
export const calculateHITS = (networkData: NetworkData, k: number = 10): NetworkData => {
  const { nodes, edges } = networkData;
  
  // Create a map for quick access to nodes by id
  const nodeMap = new Map<string, Node>();
  
  // Step 1: Initialize all hub and authority scores to 1
  nodes.forEach(node => {
    // Ensure data object exists
    if (!node.data) {
      node.data = {};
    }
    node.data.auth = 1;
    node.data.hub = 1;
    nodeMap.set(node.id, node);
  });
  
  // Create maps to store incoming and outgoing neighbors for each node
  const incomingNeighbors = new Map<string, string[]>();
  const outgoingNeighbors = new Map<string, string[]>();
  
  // Initialize empty arrays for all nodes
  nodes.forEach(node => {
    incomingNeighbors.set(node.id, []);
    outgoingNeighbors.set(node.id, []);
  });
  
  // Populate the neighbors maps using the edges
  edges.forEach(edge => {
    const sourceId = edge.source;
    const targetId = edge.target;
    
    // Add targetId to the outgoing neighbors of sourceId
    const outNeighbors = outgoingNeighbors.get(sourceId) || [];
    outNeighbors.push(targetId);
    outgoingNeighbors.set(sourceId, outNeighbors);
    
    // Add sourceId to the incoming neighbors of targetId
    const inNeighbors = incomingNeighbors.get(targetId) || [];
    inNeighbors.push(sourceId);
    incomingNeighbors.set(targetId, inNeighbors);
  });
  
  // Run the HITS algorithm for k iterations
  for (let step = 0; step < k; step++) {
    // Update authority scores
    let norm = 0;
    
    // First update all authority values
    nodes.forEach(node => {
      if (!node.data) node.data = {};
      node.data.auth = 0;
      const inNeighbors = incomingNeighbors.get(node.id) || [];
      
      // Sum the hub scores of all incoming neighbors
      inNeighbors.forEach(neighborId => {
        const neighbor = nodeMap.get(neighborId);
        if (node.data && neighbor && neighbor.data && neighbor.data.hub !== undefined) {
          node.data.auth! += neighbor.data.hub;
        }
      });
      
      // Calculate the sum of the squared auth values for normalization
      norm += Math.pow(node.data.auth || 0, 2);
    });
    
    // Normalize authority scores
    norm = Math.sqrt(norm);
    if (norm > 0) {
      nodes.forEach(node => {
        if (node.data && node.data.auth !== undefined) {
          node.data.auth = node.data.auth / norm;
        }
      });
    }
    
    // Then update all hub values
    norm = 0;
    nodes.forEach(node => {
      if (!node.data) node.data = {};
      node.data.hub = 0;
      const outNeighbors = outgoingNeighbors.get(node.id) || [];
      
      // Sum the authority scores of all outgoing neighbors
      outNeighbors.forEach(neighborId => {
        const neighbor = nodeMap.get(neighborId);
        if (node.data && neighbor && neighbor.data && neighbor.data.auth !== undefined) {
          node.data.hub! += neighbor.data.auth;
        }
      });
      
      // Calculate the sum of the squared hub values for normalization
      norm += Math.pow(node.data.hub || 0, 2);
    });
    
    // Normalize hub scores
    norm = Math.sqrt(norm);
    if (norm > 0) {
      nodes.forEach(node => {
        if (node.data && node.data.hub !== undefined) {
          node.data.hub = node.data.hub / norm;
        }
      });
    }
  }
  
  return { nodes, edges };
};

/**
 * Example usage of the HITS algorithm
 */
export const getNetworkWithHITS = async (iterations: number = 10): Promise<NetworkData> => {
  const networkData = await fetchNetworkData();
  return calculateHITS(networkData, iterations);
};