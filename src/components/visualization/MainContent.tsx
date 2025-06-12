import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Settings, ListOrdered } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from 'react';
import type { ModelSettings } from '@/types/settings';
import GraphChart, { GraphChartRef } from './GraphChart';
import NodeSelector from './NodeSelector';
import CameraControls from './CameraControls';
import ColorLegend from './ColorLegend';
import EdgeDisplayToggle, { EdgeDisplayMode } from './EdgeDisplayToggle';
// Update import to include ThreatImpactWeights
import { 
  getNetworkWithCentralityMetrics, 
  Node, 
  Edge 
} from './networkGraph/networkService';
import { 
  DEFAULT_THREAT_IMPACT_WEIGHTS,
  ThreatImpactWeights 
} from './networkGraph/threatImpactService';
import GraphSettings from './GraphSettings';
import ThreatImpactWeightsControl from './ThreatImpactWeightsControl';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import ThreatTable from './ThreatTable';
import EdgeRelationshipViewer from "./EdgeRelationshipViewer";
import EdgeCountFilter from "./EdgeCountFilter";

interface MainContentProps {
  settings: ModelSettings;
}

export type CentralityMetric = 
  'eigen_centrality' | 
  'eigen_centrality_in' | 
  'eigen_centrality_out' | 
  'cross_category_eigen_centrality' | 
  'cross_category_eigen_centrality_in' | 
  'cross_category_eigen_centrality_out';

const getCentralityValue = (node: Node, metric: CentralityMetric): number | null => {
  return node.data?.[metric] ?? null;
};

export const MainContent = ({ }: MainContentProps) => {
  const graphRef = useRef<GraphChartRef>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showRelationships, setShowRelationships] = useState<boolean>(false);
  const [showPanel, setShowPanel] = useState<boolean>(false);
  const [edgeDisplayMode, setEdgeDisplayMode] = useState<EdgeDisplayMode>('all');
  const [scoringMetric, setScoringMetric] = useState<CentralityMetric>('eigen_centrality_out');
  const [minNodeSize, setMinNodeSize] = useState<number>(5);
  const [maxNodeSize, setMaxNodeSize] = useState<number>(15);
  const [edgeWeightCutoff, setEdgeWeightCutoff] = useState<number>(0.5);
  const [useWeightBasedEdgeSize, setUseWeightBasedEdgeSize] = useState<boolean>(true);
  const [clusterOnCategory, setClusterOnCategory] = useState<boolean>(true);
  const [_, setRelationshipSelectionMode] = useState<boolean>(false);
  const [rawCountThreshold, setRawCountThreshold] = useState<number>(6);
  // Add state for threat impact weights
  const [threatImpactWeights, setThreatImpactWeights] = useState<ThreatImpactWeights>(DEFAULT_THREAT_IMPACT_WEIGHTS);

  useEffect(() => {
    const loadNetworkData = async () => {
      try {
        setLoading(true);
        // Pass the rawCountThreshold and threatImpactWeights to the function
        const data = await getNetworkWithCentralityMetrics(2, rawCountThreshold, threatImpactWeights);
        
        const validNodes = Array.isArray(data?.nodes) ? data.nodes : [];
        const validEdges = Array.isArray(data?.edges) ? data.edges : [];
        
        // Filter edges based on the weight threshold
        const filteredEdges = validEdges.filter(edge => {
          return edge.weight >= 1; // Or whatever threshold you want to use
        });
        
        // Create a set of node IDs that have at least one valid edge
        const nodeIdsWithValidEdges = new Set();
        filteredEdges.forEach(edge => {
          nodeIdsWithValidEdges.add(edge.source);
          nodeIdsWithValidEdges.add(edge.target);
        });
        
        // Filter nodes to only include those with at least one valid edge
        const filteredNodes = validNodes.filter(node => 
          nodeIdsWithValidEdges.has(node.id)
        );
        
        setNodes(filteredNodes);
        setEdges(filteredEdges);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load network data');
        setLoading(false);
        setNodes([]);
        setEdges([]);
      }
    };
    loadNetworkData();
  }, [rawCountThreshold, threatImpactWeights]); // Add threatImpactWeights as a dependency


  // Filter edges based on the selected display mode
  const filteredEdges = useMemo(() => {
    // First filter edges based on raw count threshold (if needed)
    let edgesToUse = edges;
    
    // Then apply the display mode filtering
    if (edgeDisplayMode === 'all') {
      return edgesToUse;
    } else if (edgeDisplayMode === 'incoming' && selectedNodeId) {
      return edgesToUse.filter(edge => edge.target === selectedNodeId);
    } else if (edgeDisplayMode === 'outgoing' && selectedNodeId) {
      return edgesToUse.filter(edge => edge.source === selectedNodeId);
    } else if (selectedNodeId) {
      // If a node is selected but mode is not 'all', show related edges
      return edgesToUse.filter(edge => edge.source === selectedNodeId || edge.target === selectedNodeId);
    }
    // Default: return all edges
    return edgesToUse;
  }, [edges, edgeDisplayMode, selectedNodeId]);

  const filteredNodes = useMemo(() => {
    // Create a Set of all node IDs that have at least one edge
    const nodeIdsWithEdges = new Set();
    
    // Use filteredEdges instead of edges to determine which nodes have connections
    filteredEdges.forEach(edge => {
      nodeIdsWithEdges.add(edge.source);
      nodeIdsWithEdges.add(edge.target);
    });
    
    // Filter nodes to only include those with at least one edge
    return nodes.filter(node => nodeIdsWithEdges.has(node.id));
  }, [nodes, filteredEdges]);

  const selectedNode = selectedNodeId
    ? nodes.find(n => n.id === selectedNodeId) || null
    : null;

  const handleNodeSelect = (nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    if (nodeId && window.innerWidth < 768) {
      setShowPanel(true);
    }
  };

  const sortedNodesForSelector = useMemo(() => {
    return [...filteredNodes].sort((a, b) => {
      const valA = getCentralityValue(a, scoringMetric);
      const valB = getCentralityValue(b, scoringMetric);
      const scoreA = valA === null ? -Infinity : valA;
      const scoreB = valB === null ? -Infinity : valB;
      return scoreB - scoreA;
    });
  }, [filteredNodes, scoringMetric]);
  

  useEffect(() => {
    if (selectedNodeId && graphRef.current) {
      graphRef.current.centerOnNode(selectedNodeId);
    }
  }, [selectedNodeId]);

  const formatDocumentLink = (link: string): string => {
    if (link && link.startsWith('/')) {
      return `https://open.overheid.nl${link}`;
    }
    return link || '#';
  };

  const getTotalCitationsCount = (node: Node): number => {
    return node.nr_citations || 0;
  };
  return (
    <div className="relative w-full h-[calc(100vh-96px)]">
      {/* Graph Container */}
      <div className="absolute inset-0 w-full h-full">
      <GraphChart
        ref={graphRef}
        nodes={filteredNodes}  // Changed from nodes to filteredNodes
        edges={filteredEdges}
        loading={loading}
        error={error}
        selectedNodeId={selectedNodeId}
        onNodeSelect={handleNodeSelect}
        showRelationships={showRelationships}
        sizingAttribute={scoringMetric}
        minNodeSize={minNodeSize}
        maxNodeSize={maxNodeSize}
        edgeWeightCutoff={edgeWeightCutoff}
        useWeightBasedEdgeSize={useWeightBasedEdgeSize}
        clusterOnCategory={clusterOnCategory}
      />
      </div>

      {/* Camera Controls */}
      <div className="absolute top-4 left-4 z-10 bg-background/70 backdrop-blur-md p-2 rounded-lg shadow-lg">
        <CameraControls graphRef={graphRef} />
      </div>

      {/* Edge Display Toggle - Add it below the Camera Controls */}
      <div className="absolute top-16 left-4 z-10">
        <EdgeDisplayToggle 
          displayMode={edgeDisplayMode}
          setDisplayMode={setEdgeDisplayMode}
        />
      </div>

      {/* Color Legend - Move it down to accommodate the new toggle */}
      <div className="absolute top-28 left-4 z-10">
        <ColorLegend />
      </div>

      {/* Edge Count Filter - Add below the Color Legend */}
    <div className="absolute top-64 left-4 z-10">
      <EdgeCountFilter
        value={rawCountThreshold}
        onChange={setRawCountThreshold}
        max={20}
        min={1}
      />
    </div>
    
          {/* Threat Impact Weights Control - Add below the Edge Count Filter */}
      <div className="absolute top-96 left-4 z-10">
        <ThreatImpactWeightsControl
          weights={threatImpactWeights}
          onChange={setThreatImpactWeights}
        />
      </div>


      {/* Settings & Ranking Buttons */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center space-x-2">
        {/* Settings Button */}
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
                     edgeWeightCutoff={edgeWeightCutoff}
                     setEdgeWeightCutoff={setEdgeWeightCutoff}
                     useWeightBasedEdgeSize={useWeightBasedEdgeSize}
                     setUseWeightBasedEdgeSize={setUseWeightBasedEdgeSize}
                     clusterOnCategory={clusterOnCategory}
                     setClusterOnCategory={setClusterOnCategory}
                   />
                </Sheet>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open grafiek instellingen</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Ranking Table Button */}
        <div className="bg-background/70 backdrop-blur-md p-2 rounded-lg shadow-lg">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                 <Sheet>
                   <SheetTrigger asChild>
                     <Button variant="outline" size="sm" className="gap-1 px-3" disabled={loading || !!error || nodes.length === 0}>
                       <ListOrdered className="h-4 w-4" />
                       <span>Ranglijst</span>
                     </Button>
                   </SheetTrigger>
                   <SheetContent side="bottom" className="h-[75vh] flex flex-col p-0">
                       <ThreatTable nodes={nodes} />
                   </SheetContent>
                 </Sheet>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bekijk dreiging ranglijst & exporteer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Edge Filter Info */}
       {edgeWeightCutoff > 0.5 && (
         <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10">
           <div className="bg-background/70 backdrop-blur-md px-3 py-1 rounded-lg shadow-lg text-xs">
             <span className="text-muted-foreground">Filteren: </span>
             <span>Alleen verbindingen met gewicht ≥ {edgeWeightCutoff.toFixed(2)} worden getoond</span>
           </div>
         </div>
       )}

      {/* Edge Display Mode Info - Add when a specific edge display mode is active */}
      {edgeDisplayMode !== 'all' && selectedNodeId && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-background/70 backdrop-blur-md px-3 py-1 rounded-lg shadow-lg text-xs">
            <span className="text-muted-foreground">Verbindingen: </span>
            <span>Toon alleen {edgeDisplayMode === 'incoming' ? 'inkomende' : 'uitgaande'} verbindingen voor geselecteerde dreiging</span>
          </div>
        </div>
      )}

      {/* Mobile toggle button */}
      <div className="md:hidden absolute top-4 right-4 z-10">
        <Button
          variant="secondary"
          className="bg-background/70 backdrop-blur-md shadow-lg"
          onClick={() => setShowPanel(!showPanel)}
        >
          {showPanel ? "Verberg Paneel" : "Toon Paneel"}
        </Button>
      </div>

      {/* Floating Panel */}
      <div className={`absolute right-0 top-0 bottom-0 z-10 w-full md:w-2/5 lg:w-1/3 transform transition-transform duration-300 ease-in-out ${
        showPanel || window.innerWidth >= 768 ? 'translate-x-0' : 'translate-x-full'
      } ${ window.innerWidth >= 768 ? 'md:translate-x-0' : '' }`}>
        <Card className="h-full bg-background/60 backdrop-blur-md border-0 shadow-lg rounded-l-lg rounded-r-none overflow-hidden">
          <div className="flex flex-col h-full p-4">
            {/* Node selector and controls */}
            <div className="mb-4 pt-2">
              <h4 className="text-sm font-medium mb-2">Selecteer Dreiging</h4>
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <NodeSelector
                    nodes={sortedNodesForSelector}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={handleNodeSelect}
                    placeholder="Selecteer een dreiging..."
                  />
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`whitespace-nowrap ${showRelationships ? 'bg-primary/10' : ''}`}
                        onClick={() => setShowRelationships(!showRelationships)}
                        disabled={!selectedNodeId}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {showRelationships ? 'Verberg Relaties' : 'Toon Relaties'}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{!selectedNodeId ? "Selecteer eerst een dreiging" : (showRelationships ? "Stop met het markeren van relaties" : "Markeer de relaties van de geselecteerde dreiging")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Gesorteerd op: {scoringMetric.replace(/_/g, ' ')} (hoogste eerst)
              </p>
            </div>

              {/* Add Edge Relationship Viewer toggle button */}
            <div className="mb-4">
            <EdgeRelationshipViewer
              nodes={filteredNodes}
              edges={filteredEdges}
              onModeToggle={setRelationshipSelectionMode}
              selectedNodeId={selectedNodeId}
              onNodeSelect={handleNodeSelect}
            />
            </div>

            {/* Divider */}
             <Separator className="my-2 bg-border/30" />

            {/* Node information */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <h4 className="text-sm font-medium mb-3">Geselecteerde Dreiging</h4>

              {selectedNode ? (
                <div className="flex flex-col h-full">
                  {/* Node Details Box */}
                  <div className="p-3 bg-primary/10 backdrop-blur-md rounded-lg flex-shrink-0">
                    <p className="font-medium text-lg">{selectedNode.label}</p>
                    {selectedNode.summary && (
                      <p className="text-sm mt-1 mb-2 text-muted-foreground">
                        {selectedNode.summary}
                      </p>
                    )}
                    <div className="text-sm text-muted-foreground mt-1">
                      <span>Genoemd in <span className="font-semibold">{selectedNode.nr_docs}</span> documenten</span>
                      <span className="mx-2">•</span>
                      <span><span className="font-semibold">{getTotalCitationsCount(selectedNode)}</span> totale citaties</span>
                    </div>
                    {selectedNode.data && (
                      <div className="mt-2 pt-2 border-t border-border/20 grid grid-cols-2 gap-2 text-xs">
                        {/* Update to display only eigenvector centrality metrics */}
                        {getCentralityValue(selectedNode, 'eigen_centrality') !== null && (
                          <div><span className="text-muted-foreground">Eigen Centrality: </span>
                          <span className="font-mono">{getCentralityValue(selectedNode, 'eigen_centrality')?.toFixed(4)}</span></div>
                        )}
                        {getCentralityValue(selectedNode, 'eigen_centrality_in') !== null && (
                          <div><span className="text-muted-foreground">Prestige (In): </span>
                          <span className="font-mono">{getCentralityValue(selectedNode, 'eigen_centrality_in')?.toFixed(4)}</span></div>
                        )}
                        {getCentralityValue(selectedNode, 'eigen_centrality_out') !== null && (
                          <div><span className="text-muted-foreground">Importance (Out): </span>
                          <span className="font-mono">{getCentralityValue(selectedNode, 'eigen_centrality_out')?.toFixed(4)}</span></div>
                        )}
                        {/* Add new cross-category centrality metrics */}
                        {getCentralityValue(selectedNode, 'cross_category_eigen_centrality') !== null && (
                          <div><span className="text-muted-foreground">Cross-Cat Centrality: </span>
                          <span className="font-mono">{getCentralityValue(selectedNode, 'cross_category_eigen_centrality')?.toFixed(4)}</span></div>
                        )}
                        {getCentralityValue(selectedNode, 'cross_category_eigen_centrality_in') !== null && (
                          <div><span className="text-muted-foreground">Cross-Cat Prestige: </span>
                          <span className="font-mono">{getCentralityValue(selectedNode, 'cross_category_eigen_centrality_in')?.toFixed(4)}</span></div>
                        )}
                        {getCentralityValue(selectedNode, 'cross_category_eigen_centrality_out') !== null && (
                          <div><span className="text-muted-foreground">Cross-Cat Importance: </span>
                          <span className="font-mono">{getCentralityValue(selectedNode, 'cross_category_eigen_centrality_out')?.toFixed(4)}</span></div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Citations section - Updated to display individual citations */}
                  <div className="mt-4 flex-1 flex flex-col overflow-hidden">
                    <h5 className="text-sm font-medium mb-2 flex-shrink-0">Representatieve documenten</h5>
                    <div className="space-y-3 overflow-y-auto pr-2 flex-1">
                      {selectedNode.citaten && selectedNode.citaten.length > 0 ? (
                         selectedNode.citaten.map((citation, index) => (
                          <div key={index} className="p-3 bg-background/50 rounded-lg border border-border/20">
                            <div className="flex justify-between items-start mb-2">
                              <a
                                href={formatDocumentLink(citation.document_link)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-primary hover:underline flex-1 mr-2"
                              >
                                {citation.title || "Onbekende Titel"}
                              </a>
                            </div>
                            <div className="flex flex-wrap text-xs text-muted-foreground mb-2 space-x-2">
                              {citation.publication_date && <div>{citation.publication_date.slice(0, 7)}</div>}
                              {citation.publication_date && (citation.document_type || citation.source) && <div>•</div>}
                              {citation.document_type && <div>{citation.document_type}</div>}
                              {citation.document_type && citation.source && <div>•</div>}
                              {citation.source && <div>{citation.source}</div>}
                            </div>
                            {citation.citaat.split('|||').map((citaatPart, partIndex) => (
                              <div key={partIndex} className="text-sm mt-2 italic bg-muted/40 p-2 rounded">
                                "{citaatPart.trim()}"
                              </div>
                            ))}
                          </div>
                         ))
                      ) : (
                        <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                          Geen citaties beschikbaar voor deze dreiging.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
                  Klik op een dreiging in de grafiek of selecteer er een uit de lijst om details te bekijken.
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
                Sluit Paneel
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MainContent;