import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, useRef } from 'react';
import type { ModelSettings } from '@/types/settings';
import GraphChart, { GraphChartRef } from './GraphChart';
import NodeSelector from './NodeSelector';
import CameraControls from './CameraControls';
import { fetchNetworkData, Node, Edge } from './networkDataService';

interface MainContentProps {
  settings: ModelSettings;
}

export const MainContent = ({ }: MainContentProps) => {
  // Ref for graph controls
  const graphRef = useRef<GraphChartRef>(null);
  
  // State for network data
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Single state for selected node ID
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Computed value for the selected node object
  const selectedNode = selectedNodeId 
    ? nodes.find(n => n.id === selectedNodeId) || null 
    : null;

  // Fetch data when component mounts
  useEffect(() => {
    const loadNetworkData = async () => {
      try {
        setLoading(true);
        const data = await fetchNetworkData();
        
        // Make sure we have valid arrays
        const validNodes = Array.isArray(data?.nodes) ? data.nodes : [];
        const validEdges = Array.isArray(data?.edges) ? data.edges : [];
        
        setNodes(validNodes);
        setEdges(validEdges);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load network data');
        setLoading(false);
        setNodes([]);
        setEdges([]);
      }
    };
    
    loadNetworkData();
  }, []);

  // Handle selection from either source
  const handleNodeSelect = (nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  };

  // Center the view when a node is selected
  useEffect(() => {
    if (selectedNodeId && graphRef.current) {
      graphRef.current.centerOnNode(selectedNodeId);
    }
  }, [selectedNodeId]);

  return (
    <div className="p-6">
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Left side with graph */}
            <div className="md:w-1/2">
              <div style={{ position: "relative", width: '100%', height: '480px' }}>
                <GraphChart 
                  ref={graphRef}
                  nodes={nodes} 
                  edges={edges} 
                  loading={loading} 
                  error={error}
                  selectedNodeId={selectedNodeId}
                  onNodeSelect={handleNodeSelect}
                />
              </div>
            </div>
            
            {/* Subtle divider for larger screens */}
            <div className="hidden md:block w-px bg-border/30 mx-1"></div>
            
            {/* Right side with text and controls */}
            <div className="md:w-1/2 p-6">
              <h3 className="text-lg font-medium mb-2">Network Visualization</h3>
              <p className="text-muted-foreground text-sm mb-6">A simple visualization of network connections</p>
              
              {/* Node selector dropdown */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Select Node</h4>
                <NodeSelector 
                  nodes={nodes}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={handleNodeSelect}
                  placeholder="Select a dreiging..."
                />
              </div>
              
              {/* Camera controls */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Camera Controls</h4>
                <CameraControls graphRef={graphRef} />
              </div>
              
              <div className="space-y-4 text-sm mt-6">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum consequat hendrerit lacinia. Curabitur sodales, est vel fringilla imperdiet, erat nulla commodo erat, non tempor purus eros quis dui.</p>
                <p>Suspendisse at sapien velit. Nam et sollicitudin magna. Donec eget vehicula turpis. Suspendisse dapibus bibendum augue, non faucibus nunc volutpat ac.</p>
              </div>
              
              {/* Node Selection Information */}
              <div className="mt-8 pt-6 border-t border-border/30">
                <h4 className="text-sm font-medium mb-4">Selected Node</h4>
                {selectedNode ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <p className="font-medium">{selectedNode.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">ID: {selectedNode.id}</p>
                    </div>
                    
                    {/* Display additional node properties if available */}
                    {Object.entries(selectedNode)
                      .filter(([key]) => !['id', 'label'].includes(key))
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{key}</span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
                    Click on a node in the graph or select one from the dropdown to view its details.
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MainContent;