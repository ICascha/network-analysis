import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useState, useEffect, useRef } from 'react';
import type { ModelSettings } from '@/types/settings';
import GraphChart, { GraphChartRef } from './GraphChart';
import NodeSelector from './NodeSelector';
import CameraControls from './CameraControls';
import { fetchNetworkData, Node, Edge, Citation } from './networkDataService';

interface MainContentProps {
  settings: ModelSettings;
}

// Interface for grouping citations by document
interface GroupedCitation {
  title: string;
  document_type: string;
  source: string;
  publication_date: string;
  document_link: string;
  citaten: string[]; // Multiple citation texts
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
  
  // State for show relationships toggle
  const [showRelationships, setShowRelationships] = useState<boolean>(false);
  
  // Computed value for the selected node object
  const selectedNode = selectedNodeId 
    ? nodes.find(n => n.id === selectedNodeId) || null 
    : null;

  // Group citations by document
  const groupCitationsByDocument = (citations: Citation[]): GroupedCitation[] => {
    const groupedMap = new Map<string, GroupedCitation>();
    
    citations.forEach(citation => {
      const documentKey = citation.title;
      
      if (!groupedMap.has(documentKey)) {
        groupedMap.set(documentKey, {
          title: citation.title,
          document_type: citation.document_type,
          source: citation.source,
          publication_date: citation.publication_date,
          document_link: citation.document_link,
          citaten: [citation.citaat]
        });
      } else {
        // Add this citation to the existing document
        const existing = groupedMap.get(documentKey)!;
        existing.citaten.push(citation.citaat);
      }
    });
    
    return Array.from(groupedMap.values());
  };

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
  
  // Toggle relationship visibility
  const toggleRelationships = () => {
    setShowRelationships(!showRelationships);
  };

  // Center the view when a node is selected
  useEffect(() => {
    if (selectedNodeId && graphRef.current) {
      graphRef.current.centerOnNode(selectedNodeId);
    }
  }, [selectedNodeId]);

  // Format document link
  const formatDocumentLink = (link: string): string => {
    if (link.startsWith('/')) {
      return `https://open.overheid.nl${link}`;
    }
    return link;
  };

  // Calculate total citations count
  const getTotalCitationsCount = (node: Node): number => {
    return node.citaten?.length || 0;
  };

  return (
    <div className="p-6">
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Left side with graph */}
            <div className="md:w-1/2">
              <div style={{ position: "relative", width: '100%', height: '100%' }}>
                {/* Camera controls overlay */}
                <div className="absolute top-2 right-2 z-10 bg-background/80 p-1 rounded-md shadow-sm">
                  <CameraControls graphRef={graphRef} />
                </div>
                <GraphChart 
                  ref={graphRef}
                  nodes={nodes} 
                  edges={edges} 
                  loading={loading} 
                  error={error}
                  selectedNodeId={selectedNodeId}
                  onNodeSelect={handleNodeSelect}
                  showRelationships={showRelationships}
                />
              </div>
            </div>
            
            {/* Subtle divider for larger screens */}
            <div className="hidden md:block w-px bg-border/30 mx-1"></div>
            
            {/* Right side with controls and details */}
            <div className="md:w-1/2 p-6">
              {/* Node selector dropdown and relationship toggle */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Select Dreiging</h4>
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <NodeSelector 
                      nodes={nodes}
                      selectedNodeId={selectedNodeId}
                      onSelectNode={handleNodeSelect}
                      placeholder="Select a dreiging..."
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`whitespace-nowrap ${showRelationships ? 'bg-primary/10' : ''}`}
                    onClick={toggleRelationships}
                    disabled={!selectedNodeId}
                    title={!selectedNodeId ? "Select a node first" : undefined}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {showRelationships ? 'Hide Relations' : 'Show Relations'}
                  </Button>
                </div>
              </div>
              
              {/* Node Selection Information - with fixed height */}
              <div className="mt-6 pt-6 border-t border-border/30 h-[480px] flex flex-col">
                <h4 className="text-sm font-medium mb-4">Selected Dreiging</h4>
                {selectedNode ? (
                  <div className="flex flex-col h-full">
                    <div className="p-4 bg-primary/5 rounded-lg flex-shrink-0">
                      <p className="font-medium text-lg">{selectedNode.label}</p>
                      <div className="text-sm text-muted-foreground mt-1">
                        <span>Mentioned in <span className="font-semibold">{selectedNode.nr_docs}</span> documents</span>
                        <span className="mx-2">•</span>
                        <span><span className="font-semibold">{getTotalCitationsCount(selectedNode)}</span> total citations</span>
                      </div>
                    </div>
                    
                    {/* Citations section - with flex and overflow */}
                    <div className="mt-4 flex-1 flex flex-col overflow-hidden">
                      <h5 className="text-sm font-medium mb-3 flex-shrink-0">Documents</h5>
                      
                      <div className="space-y-4 overflow-y-auto pr-2 flex-1">
                        {selectedNode.citaten && groupCitationsByDocument(selectedNode.citaten).map((document, index) => (
                          <div key={index} className="p-4 bg-muted/30 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <a 
                                href={formatDocumentLink(document.document_link)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-primary hover:underline"
                              >
                                {document.title}
                              </a>
                              <div className="text-xs text-muted-foreground">{document.publication_date}</div>
                            </div>
                            
                            <div className="flex text-xs text-muted-foreground mb-3 space-x-2">
                              <div>{document.document_type}</div>
                              <div>•</div>
                              <div>{document.source}</div>
                              <div>•</div>
                              <div>{document.citaten.length} citation{document.citaten.length !== 1 ? 's' : ''}</div>
                            </div>
                            
                            {document.citaten.map((citaat, citaatIndex) => (
                              <div key={citaatIndex} className="text-sm mt-2 italic bg-muted/20 p-3 rounded">
                                "{citaat}"
                              </div>
                            ))}
                          </div>
                        ))}
                        
                        {(!selectedNode.citaten || selectedNode.citaten.length === 0) && (
                          <div className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
                            No citations available for this node.
                          </div>
                        )}
                      </div>
                    </div>
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