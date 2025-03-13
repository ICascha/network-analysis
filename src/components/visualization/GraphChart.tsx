import { GraphCanvas, GraphCanvasRef } from 'reagraph';
import { useState, useEffect, useRef } from 'react';
import { useSelection } from 'reagraph';

export const GraphChart = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // TypeScript syntax
  const graphRef = useRef<GraphCanvasRef>(null);
  
  useEffect(() => {
    const fetchData = async () => {
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
        const nodesData = await nodesResponse.json();
        const edgesData = await edgesResponse.json();
        
        // Update state with fetched data
        setNodes(nodesData);
        setEdges(edgesData);
        setLoading(false);
      } catch (error: unknown) {
        // Properly handle the unknown error type
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error loading graph data:', errorMessage);
        setError(errorMessage);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Add selection functionality
  const { selections, actives, onNodeClick, onCanvasClick } = useSelection({
    ref: graphRef,
    nodes: nodes,
    edges: edges,
    pathSelectionType: 'all'
  });
  
  if (loading) {
    return <div>Loading graph data...</div>;
  }
  
  if (error) {
    return <div>Error loading graph: {error}</div>;
  }
  
  return (
    <GraphCanvas 
      ref={graphRef}
      nodes={nodes} 
      edges={edges}
      selections={selections}
      actives={actives}
      onNodeClick={onNodeClick}
      onCanvasClick={onCanvasClick}
    />
  );
};

export default GraphChart;