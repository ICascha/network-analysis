/**
 * Main network service module that ties together all components
 */
import { NetworkData } from './types';
import { fetchNetworkData } from './networkFetcher';
import { calculateWeightedEigenvectorCentrality } from './eigenvectorCentrality';

/**
 * Get network data with eigenvector centrality calculations
 * Performs both regular and cross-category centrality metrics
 * 
 * @param iterations The number of iterations to run the algorithms (default: 10)
 * @returns The network data with updated eigenvector centrality scores
 */
export const getNetworkWithCentralityMetrics = async (iterations: number = 10): Promise<NetworkData> => {
  // Fetch the raw network data
  const networkData = await fetchNetworkData();
  
  // Calculate all eigenvector centrality metrics (both regular and cross-category)
  return calculateWeightedEigenvectorCentrality(networkData, iterations);
};

/**
 * Exports the main API functions and types for external use
 */
export * from './types';
export { fetchNetworkData } from './networkFetcher';
export { calculateWeightedEigenvectorCentrality } from './eigenvectorCentrality';