import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Settings } from "lucide-react";
import { useState, useEffect, useRef } from 'react';
import type { ModelSettings } from '@/types/settings';
import GraphChart, { GraphChartRef } from './GraphChart';
import NodeSelector from './NodeSelector';
import CameraControls from './CameraControls';
import { getNetworkWithAllCentralityMetrics, Node, Edge, Citation } from './networkDataService';
import GraphSettings from './GraphSettings';
import {
  Sheet,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MainContentProps {
  settings: ModelSettings;
}

// Updated type for centrality metrics
type CentralityMetric = 'hub' | 'auth' | 'eigen_centrality' | 'eigen_centrality_in' | 'eigen_centrality_out';

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
  
  // State for panel visibility on mobile
  const [showPanel, setShowPanel] = useState<boolean>(false);
  
  // Updated: State for centrality scoring metric (now includes eigenvector centrality options)
  const [scoringMetric, setScoringMetric] = useState<CentralityMetric>('eigen_centrality_out');
  
  // State for node size control
  const [minNodeSize, setMinNodeSize] = useState<number>(5);
  const [maxNodeSize, setMaxNodeSize] = useState<number>(15);
  
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

  // Fetch data when component mounts - using the new function for all centrality metrics
  useEffect(() => {
    const loadNetworkData = async () => {
      try {
        setLoading(true);
        // Updated: Using the new function that calculates all centrality metrics
        const data = await getNetworkWithAllCentralityMetrics();
        
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
    // Show panel on mobile when node is selected
    if (nodeId && window.innerWidth < 768) {
      setShowPanel(true);
    }
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
    <div className="relative w-full h-[calc(100vh-96px)]">
      {/* Full-width graph container */}
      <div className="absolute inset-0 w-full h-full">
        <GraphChart 
          ref={graphRef}
          nodes={nodes} 
          edges={edges} 
          loading={loading} 
          error={error}
          selectedNodeId={selectedNodeId}
          onNodeSelect={handleNodeSelect}
          showRelationships={showRelationships}
          sizingAttribute={scoringMetric}
          minNodeSize={minNodeSize}
          maxNodeSize={maxNodeSize}
        />
      </div>
      
      {/* Camera controls only - fixed position */}
      <div className="absolute top-4 left-4 z-10 bg-background/70 backdrop-blur-md p-2 rounded-lg shadow-lg">
        <CameraControls graphRef={graphRef} />
      </div>
      
      {/* Settings Button only */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center">
        <div className="bg-background/70 backdrop-blur-md p-2 rounded-lg shadow-lg">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1 px-3">
                      <Settings className="h-4 w-4" />
                      <span>Instellingen</span>
                    </Button>
                  </SheetTrigger>
                  <GraphSettings
                    scoringMetric={scoringMetric}
                    setScoringMetric={setScoringMetric}
                    minNodeSize={minNodeSize}
                    setMinNodeSize={setMinNodeSize}
                    maxNodeSize={maxNodeSize}
                    setMaxNodeSize={setMaxNodeSize}
                    showRelationships={showRelationships}
                    setShowRelationships={setShowRelationships}
                  />
                </Sheet>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open geavanceerde instellingen</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Mobile toggle button for panel */}
      <div className="md:hidden absolute top-4 right-4 z-10">
        <Button 
          variant="secondary" 
          className="bg-background/70 backdrop-blur-md shadow-lg" 
          onClick={() => setShowPanel(!showPanel)}
        >
          {showPanel ? "Hide Panel" : "Show Panel"}
        </Button>
      </div>
      
      {/* Floating glass panel */}
      <div className={`absolute right-0 top-0 bottom-0 z-10 w-full md:w-2/5 lg:w-1/3 transform transition-transform duration-300 ease-in-out ${
        showPanel ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
      }`}>
        <Card className="h-full bg-background/60 backdrop-blur-md border-0 shadow-lg rounded-l-lg rounded-r-none overflow-hidden">
          <div className="flex flex-col h-full p-4">
            {/* Node selector and controls */}
            <div className="mb-4 pt-2">
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
                  onClick={() => setShowRelationships(!showRelationships)}
                  disabled={!selectedNodeId}
                  title={!selectedNodeId ? "Select a node first" : undefined}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {showRelationships ? 'Hide Relations' : 'Show Relations'}
                </Button>
              </div>
            </div>
            
            {/* Divider */}
            <div className="w-full h-px bg-border/30 my-2"></div>
            
            {/* Node information */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <h4 className="text-sm font-medium mb-3">Selected Dreiging</h4>
              
              {selectedNode ? (
                <div className="flex flex-col h-full">
                  <div className="p-3 bg-primary/10 backdrop-blur-md rounded-lg flex-shrink-0">
                    <p className="font-medium text-lg">{selectedNode.label}</p>
                    <div className="text-sm text-muted-foreground mt-1">
                      <span>Mentioned in <span className="font-semibold">{selectedNode.nr_docs}</span> documents</span>
                      <span className="mx-2">•</span>
                      <span><span className="font-semibold">{getTotalCitationsCount(selectedNode)}</span> total citations</span>
                    </div>
                    
                    {/* Display centrality metrics if available */}
                    {selectedNode.data && (
                      <div className="mt-2 pt-2 border-t border-border/20 grid grid-cols-2 gap-2 text-xs">
                        {selectedNode.data.hub !== undefined && (
                          <div>
                            <span className="text-muted-foreground">HITS Hub: </span>
                            <span className="font-mono">{selectedNode.data.hub.toFixed(4)}</span>
                          </div>
                        )}
                        {selectedNode.data.auth !== undefined && (
                          <div>
                            <span className="text-muted-foreground">HITS Authority: </span>
                            <span className="font-mono">{selectedNode.data.auth.toFixed(4)}</span>
                          </div>
                        )}
                        {selectedNode.data.eigen_centrality !== undefined && (
                          <div>
                            <span className="text-muted-foreground">Eigen Centrality: </span>
                            <span className="font-mono">{selectedNode.data.eigen_centrality.toFixed(4)}</span>
                          </div>
                        )}
                        {selectedNode.data.eigen_centrality_in !== undefined && (
                          <div>
                            <span className="text-muted-foreground">Prestige (In): </span>
                            <span className="font-mono">{selectedNode.data.eigen_centrality_in.toFixed(4)}</span>
                          </div>
                        )}
                        {selectedNode.data.eigen_centrality_out !== undefined && (
                          <div>
                            <span className="text-muted-foreground">Importance (Out): </span>
                            <span className="font-mono">{selectedNode.data.eigen_centrality_out.toFixed(4)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Citations section */}
                  <div className="mt-4 flex-1 flex flex-col overflow-hidden">
                    <h5 className="text-sm font-medium mb-2 flex-shrink-0">Documents</h5>
                    
                    <div className="space-y-3 overflow-y-auto pr-2 flex-1">
                      {selectedNode.citaten && groupCitationsByDocument(selectedNode.citaten).map((document, index) => (
                        <div key={index} className="p-3 bg-background/50 rounded-lg border border-border/20">
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
                          
                          <div className="flex text-xs text-muted-foreground mb-2 space-x-2">
                            <div>{document.document_type}</div>
                            <div>•</div>
                            <div>{document.source}</div>
                            <div>•</div>
                            <div>{document.citaten.length} citation{document.citaten.length !== 1 ? 's' : ''}</div>
                          </div>
                          
                          {document.citaten.map((citaat, citaatIndex) => (
                            <div key={citaatIndex} className="text-sm mt-2 italic bg-muted/40 p-2 rounded">
                              "{citaat}"
                            </div>
                          ))}
                        </div>
                      ))}
                      
                      {(!selectedNode.citaten || selectedNode.citaten.length === 0) && (
                        <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
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
            
            {/* Mobile close button */}
            <div className="md:hidden mt-4">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setShowPanel(false)}
              >
                Close Panel
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MainContent;