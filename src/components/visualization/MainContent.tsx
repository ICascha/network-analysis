// src/components/visualization/MainContent.tsx

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Settings, ListOrdered, PanelRightOpen } from "lucide-react";
// MODIFIED: useEffect and useMemo are no longer needed for the lifted state
import { useState, useEffect, useRef, useMemo } from 'react';
import type { ModelSettings } from '@/types/settings';
import GraphChart, { GraphChartRef } from './GraphChart';
import NodeSelector from './NodeSelector';
import CameraControls from './CameraControls';
import ColorLegend from './ColorLegend';
import EdgeDisplayToggle, { EdgeDisplayMode } from './EdgeDisplayToggle';
// MODIFIED: Only need Node and Edge types here now
import type { Node, Edge } from './networkGraph/networkService';
// REMOVED: ThreatImpactWeights not needed here anymore
import GraphSettings from './GraphSettings';
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

// MODIFIED: Props interface is expanded to accept all the lifted state and setters
interface MainContentProps {
  settings: ModelSettings;
  nodes: Node[];
  loading: boolean;
  error: string | null;
  filteredNodes: Node[];
  filteredEdges: Edge[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  edgeDisplayMode: EdgeDisplayMode;
  onSetEdgeDisplayMode: (mode: EdgeDisplayMode) => void;
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

// MODIFIED: Component now receives many more props
export const MainContent = ({ 
  nodes,
  loading,
  error,
  filteredNodes,
  filteredEdges,
  selectedNodeId,
  onSelectNode,
  edgeDisplayMode,
  onSetEdgeDisplayMode
}: MainContentProps) => {
  const graphRef = useRef<GraphChartRef>(null);

  // REMOVED: All state and effects that were lifted up
  // const [nodes, setNodes] = useState<Node[]>([]);
  // const [edges, setEdges] = useState<Edge[]>([]);
  // const [loading, setLoading] = useState<boolean>(true);
  // const [error, setError] = useState<string | null>(null);
  // const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  // const [edgeDisplayMode, setEdgeDisplayMode] = useState<EdgeDisplayMode>('all');
  // const [rawCountThreshold] = useState<number>(6);
  // const [threatImpactWeights] = useState<ThreatImpactWeights>(DEFAULT_THREAT_IMPACT_WEIGHTS);
  // const [useEffect, useMemo blocks for data fetching and filtering]

  // KEPT: State that is local to MainContent's UI
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [showRelationships, setShowRelationships] = useState<boolean>(false);
  const [showPanel, setShowPanel] = useState<boolean>(false);
  const [scoringMetric, setScoringMetric] = useState<CentralityMetric>('eigen_centrality_out');
  const [minNodeSize, setMinNodeSize] = useState<number>(5);
  const [maxNodeSize, setMaxNodeSize] = useState<number>(15);
  const [edgeWeightCutoff, setEdgeWeightCutoff] = useState<number>(0.5);
  const [useWeightBasedEdgeSize, setUseWeightBasedEdgeSize] = useState<boolean>(true);
  const [clusterOnCategory, setClusterOnCategory] = useState<boolean>(true);
  
  // REMOVED: The useMemo blocks for filteredEdges and filteredNodes are now in the parent.
  // The component now receives filteredNodes and filteredEdges directly as props.

  const selectedNode = selectedNodeId
    ? nodes.find(n => n.id === selectedNodeId) || null
    : null;
    
  const sourceNodeForEdge = selectedEdge ? nodes.find(n => n.id === selectedEdge.source) : null;
  const targetNodeForEdge = selectedEdge ? nodes.find(n => n.id === selectedEdge.target) : null;

  // MODIFIED: handleNodeSelect now calls the onSelectNode prop
  const handleNodeSelect = (nodeId: string | null) => {
    setSelectedEdge(null);
    onSelectNode(nodeId); // Use the function passed via props
    if (nodeId && window.innerWidth < 768) {
      setShowPanel(true);
    }
  };

  const handleEdgeSelect = (edge: Edge | null) => {
    onSelectNode(null); // Use the function passed via props
    setSelectedEdge(edge);
    if (edge && window.innerWidth < 768) {
        setShowPanel(true);
    }
  };

  // This memo can stay as it's for the UI (the dropdown list)
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

  // ... (The rest of the component's render logic and helper functions remain the same)
  // Just ensure that anywhere you used a lifted state variable (like selectedNodeId or loading)
  // or a setter (like setEdgeDisplayMode), you are now using the prop version 
  // (selectedNodeId and onSetEdgeDisplayMode). The code below is already correct based on this.
  
  const formatDocumentLink = (link: string): string => {
    if (link && link.startsWith('/')) {
      return `https://open.overheid.nl${link}`;
    }
    return link || '#';
  };

  const getTotalCitationsCount = (node: Node): number => {
    return node.nr_citations || 0;
  };
  
  const renderCitationParts = (citationText: string) => {
    if (!citationText.includes(" ||| ")) {
      return <div className="italic bg-muted/40 p-3 rounded text-sm">"{citationText}"</div>;
    }

    const parts = citationText.split(" ||| ");
    return (
      <div className="space-y-2">
        {parts.map((part, i) => (
          <div key={i} className="italic bg-muted/40 p-3 rounded text-sm">
            "{part.trim()}"
          </div>
        ))}
      </div>
    );
  };
  
  return (
  <div className="relative w-full h-full">
      {/* Graph Container */}
      <div className="absolute inset-0 w-full h-full">
      <GraphChart
        ref={graphRef}
        nodes={filteredNodes} // Use prop
        edges={filteredEdges}   // Use prop
        loading={loading}       // Use prop
        error={error}           // Use prop
        selectedNodeId={selectedNodeId} // Use prop
        onNodeSelect={handleNodeSelect}
        onEdgeClick={handleEdgeSelect}
        showRelationships={showRelationships}
        sizingAttribute={scoringMetric}
        minNodeSize={minNodeSize}
        maxNodeSize={maxNodeSize}
        edgeWeightCutoff={edgeWeightCutoff}
        useWeightBasedEdgeSize={useWeightBasedEdgeSize}
        clusterOnCategory={clusterOnCategory}
      />
      </div>

      {/* UI Elements */}
      <div className="absolute top-4 left-4 z-10 bg-background/70 backdrop-blur-md p-2 rounded-lg shadow-lg">
        <CameraControls graphRef={graphRef} />
      </div>
      <div className="absolute top-16 left-4 z-10">
        <EdgeDisplayToggle 
          displayMode={edgeDisplayMode}         // Use prop
          setDisplayMode={onSetEdgeDisplayMode} // Use prop
        />
      </div>
      <div className="absolute bottom-10 left-10 z-10">
        <ColorLegend />
      </div>
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center space-x-2">
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
       {edgeWeightCutoff > 0.5 && (
         <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10">
           <div className="bg-background/70 backdrop-blur-md px-3 py-1 rounded-lg shadow-lg text-xs">
             <span className="text-muted-foreground">Filteren: </span>
             <span>Alleen verbindingen met gewicht ≥ {edgeWeightCutoff.toFixed(2)} worden getoond</span>
           </div>
         </div>
       )}
      {edgeDisplayMode !== 'all' && selectedNodeId && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-background/70 backdrop-blur-md px-3 py-1 rounded-lg shadow-lg text-xs">
            <span className="text-muted-foreground">Verbindingen: </span>
            <span>Toon alleen {edgeDisplayMode === 'incoming' ? 'inkomende' : 'uitgaande'} verbindingen voor geselecteerde dreiging</span>
          </div>
        </div>
      )}
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
            <div className="mb-4 pt-2">
              <h4 className="text-sm font-medium mb-2">Selecteer Dreiging</h4>
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <NodeSelector
                    nodes={sortedNodesForSelector}
                    selectedNodeId={selectedNodeId} // Use prop
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
            
            <Separator className="my-2 bg-border/30" />

            <div className="flex-1 overflow-hidden flex flex-col">
              <h4 className="text-sm font-medium mb-3">
                  {selectedNode ? "Geselecteerde Dreiging" : selectedEdge ? "Geselecteerde Verbinding" : "Details"}
              </h4>

              {!selectedNode && !selectedEdge && (
                <div className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
                  Klik op een dreiging of verbinding in de grafiek om details te bekijken.
                </div>
              )}

              {selectedNode && (
                <div className="flex flex-col h-full overflow-hidden">
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
                  <div className="mt-4 flex-1 flex flex-col overflow-hidden">
                    <h5 className="text-sm font-medium mb-2 flex-shrink-0">Representatieve documenten</h5>
                    <div className="space-y-3 overflow-y-auto pr-2 flex-1">
                      {selectedNode.citaten && selectedNode.citaten.length > 0 ? (
                         selectedNode.citaten.map((citation, index) => (
                          <div key={index} className="p-3 bg-background/50 rounded-lg border border-border/20">
                            <div className="flex justify-between items-start mb-2">
                              <a href={formatDocumentLink(citation.document_link)} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline flex-1 mr-2">
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
              )}

              {selectedEdge && (
                <div className="flex flex-col h-full overflow-hidden">
                   <div className="p-3 bg-primary/10 backdrop-blur-md rounded-lg flex-shrink-0">
                      <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-foreground">{sourceNodeForEdge?.label || 'Onbekend'}</span>
                          <PanelRightOpen className="h-4 w-4 rotate-90 opacity-50 flex-shrink-0" />
                          <span className="font-medium text-foreground">{targetNodeForEdge?.label || 'Onbekend'}</span>
                      </div>
                      {selectedEdge.weight && (
                        <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/20">
                          Gewicht: <span className="font-mono">{selectedEdge.weight.toFixed(2)}</span>
                        </div>
                      )}
                  </div>

                  <div className="mt-4 flex-1 flex flex-col overflow-hidden">
                    <h5 className="text-sm font-medium mb-2 flex-shrink-0">Bewijsmateriaal & Context</h5>
                     <div className="space-y-3 overflow-y-auto pr-2 flex-1">
                      {selectedEdge.citaat_relaties && selectedEdge.citaat_relaties.length > 0 ? (
                        selectedEdge.citaat_relaties.map((citation, index) => (
                           <div key={index} className="p-4 bg-background/50 rounded-lg border border-border/20">
                            <div className="flex justify-between items-start mb-2">
                              <a href={formatDocumentLink(citation.document_link)} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline flex-1 mr-2">
                                {citation.title || "Onbekende Titel"}
                              </a>
                            </div>
                            <div className="flex flex-wrap text-xs text-muted-foreground mb-3 space-x-2">
                              {citation.publication_date && <div>{citation.publication_date.slice(0, 7)}</div>}
                              {citation.publication_date && (citation.source) && <div>•</div>}
                              {citation.source && <div>{citation.source}</div>}
                            </div>
                            <div className="text-sm mt-2">
                              <div className="flex gap-2 mb-1">
                                <span className="text-xs font-medium bg-primary/10 px-2 py-0.5 rounded">Oorzaak</span>
                                <span>{citation.oorzaak}</span>
                              </div>
                              <div className="flex gap-2 mb-3">
                                <span className="text-xs font-medium bg-primary/10 px-2 py-0.5 rounded">Gevolg</span>
                                <span>{citation.gevolg}</span>
                              </div>
                              {renderCitationParts(citation.citaat)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                          Geen citaties beschikbaar voor deze verbinding.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

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