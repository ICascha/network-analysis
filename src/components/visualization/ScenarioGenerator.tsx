import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, PanelRightOpen } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { ResponsiveSankey } from '@nivo/sankey';
import { getNetworkWithCentralityMetrics } from './networkGraph/networkService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Theme color
const themeColor = 'rgb(0,153,168)';

// Define types for our data structures
interface Citation {
  title?: string;
  document_type?: string;
  source?: string;
  publication_date?: string;
  document_link?: string;
  citaat: string;
  filename?: string;
}

interface RelationCitation {
  filename?: string;
  citaat: string;
  oorzaak?: string;
  gevolg?: string;
  citation_id?: string;
  publication_date?: string;
  source?: string;
  title?: string;
  document_link?: string;
}

interface Node {
  id: string;
  label: string;
  summary?: string;
  citaten?: Citation[];
  nr_docs?: number;
  nr_citations?: number;
  data?: {
    [key: string]: any;
  };
  category?: string;
  [key: string]: any;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string;
  weight: number;
  raw_count: number;
  citaat_relaties?: RelationCitation[];
  // Add any other possible citation-related fields
  [key: string]: any;
}

interface NetworkData {
  nodes: Node[];
  edges: Edge[];
}

const EnhancedThreatSankey: React.FC = () => {
  // State variables
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sankeyData, setSankeyData] = useState<any>(null);
  
  // Configuration options
  const [selectedThreat, setSelectedThreat] = useState<string>('');
  const [maxRelationsPerNode, setMaxRelationsPerNode] = useState<number>(3);
  const [selectedLink, setSelectedLink] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  
  // Fixed horizontal padding
  const horizontalPadding = 120;

  // Load network data
  useEffect(() => {
    const loadNetworkData = async () => {
      try {
        setLoading(true);
        const data = await getNetworkWithCentralityMetrics(100);
        setNetworkData(data);
        
        // Pre-select the first threat with outgoing connections
        if (data && Array.isArray(data.nodes) && Array.isArray(data.edges) && data.nodes.length > 0) {
          // Find a good candidate node that has outgoing connections
          const nodesWithOutgoingEdges = data.nodes.filter(node => 
            data.edges.some(edge => edge.source === node.id)
          );
          
          if (nodesWithOutgoingEdges.length > 0) {
            // Select the node with the most outgoing connections
            const nodeWithMostEdges = nodesWithOutgoingEdges.reduce((prev, current) => {
              const prevCount = data.edges.filter(edge => edge.source === prev.id).length;
              const currCount = data.edges.filter(edge => edge.source === current.id).length;
              return prevCount > currCount ? prev : current;
            });
            
            setSelectedThreat(nodeWithMostEdges.id);
          } else {
            // Fallback to first node
            setSelectedThreat(data.nodes[0].id);
          }
        }
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load network data');
        setLoading(false);
      }
    };
    
    loadNetworkData();
  }, []);

  // Process data for Sankey diagram
  useEffect(() => {
    if (networkData && selectedThreat) {
      const selectedNode = networkData.nodes.find(node => node.id === selectedThreat);
      
      if (!selectedNode) {
        setError(`Could not find node for threat: ${selectedThreat}`);
        return;
      }
      
      // Get first-order effects (direct connections from the selected threat)
      const firstOrderEdges = networkData.edges.filter(edge => 
        edge.source === selectedThreat && edge.weight >= 0.5 // Only include edges with weight >= 0.5
      );
      
      // Sort by raw_count and take top N based on slider
      const topFirstOrderEdges = [...firstOrderEdges]
        .sort((a, b) => b.raw_count - a.raw_count)
        .slice(0, maxRelationsPerNode);
      
      // Get second-order effects for each first-order node
      const secondOrderNodes = topFirstOrderEdges.map(edge => edge.target);
      const secondOrderEdgesBySource: Record<string, Edge[]> = {};
      
      secondOrderNodes.forEach(nodeId => {
        const edges = networkData.edges.filter(edge => 
          edge.source === nodeId && 
          edge.target !== selectedThreat && 
          edge.weight >= 0.5 // Only include edges with weight >= 0.5
        );
        
        // Sort by raw_count and take top N based on slider
        secondOrderEdgesBySource[nodeId] = [...edges]
          .sort((a, b) => b.raw_count - a.raw_count)
          .slice(0, maxRelationsPerNode)
          // Filter out edges that would create cycles
          .filter(edge => {
            // Check if this would create a cycle
            return !topFirstOrderEdges.some(firstOrderEdge => 
              firstOrderEdge.target === edge.target
            ) && edge.target !== selectedThreat;
          });
      });
      
      // Build nodes for Sankey diagram
      const sankeyNodes: { id: string, nodeColor: string }[] = [];
      
      // Map to store node id to display label
      const nodeLabels: Record<string, string> = {};
      
      // Add selected threat
      sankeyNodes.push({
        id: selectedThreat,
        nodeColor: themeColor
      });
      nodeLabels[selectedThreat] = selectedNode.label;
      
      // Add first-order nodes
      secondOrderNodes.forEach(nodeId => {
        const node = networkData.nodes.find(n => n.id === nodeId);
        if (node) {
          sankeyNodes.push({
            id: nodeId,
            nodeColor: getCategoryColor(node.category || 'default')
          });
          nodeLabels[nodeId] = node.label;
        }
      });
      
      // Add second-order nodes
      const secondOrderTargetNodes: Set<string> = new Set();
      Object.values(secondOrderEdgesBySource).forEach(edges => {
        edges.forEach(edge => {
          if (!secondOrderTargetNodes.has(edge.target)) {
            secondOrderTargetNodes.add(edge.target);
            const node = networkData.nodes.find(n => n.id === edge.target);
            if (node) {
              sankeyNodes.push({
                id: edge.target,
                nodeColor: getCategoryColor(node.category || 'default')
              });
              nodeLabels[edge.target] = node.label;
            }
          }
        });
      });
      
      // Build links for Sankey diagram
      const sankeyLinks: { source: string, target: string, value: number }[] = [];
      
      // Add first-order links
      topFirstOrderEdges.forEach(edge => {
        sankeyLinks.push({
          source: edge.source,
          target: edge.target,
          value: 1 // Fixed value as requested
        });
      });
      
      // Add second-order links
      Object.entries(secondOrderEdgesBySource).forEach(([_, edges]) => {
        edges.forEach(edge => {
          sankeyLinks.push({
            source: edge.source,
            target: edge.target,
            value: 1 // Fixed value as requested
          });
        });
      });
      
      // Process edges to ensure they use the correct node ids and filter out low-weight links
      const processedLinks = sankeyLinks.map(link => {
        const edgeInfo = networkData.edges.find(e => e.source === link.source && e.target === link.target);
        return {
          ...link,
          // Use node IDs but store original labels for display
          sourceLabel: nodeLabels[link.source] || link.source,
          targetLabel: nodeLabels[link.target] || link.target,
          // Store edge information for click handling
          edgeInfo: edgeInfo,
          // Store weight for filtering
          weight: edgeInfo?.weight || 0
        };
      });
      
      // Filter out links with weight < 0.5
      const filteredLinks = processedLinks.filter(link => link.weight >= 0.5);
      
      // Set final Sankey data
      setSankeyData({
        nodes: sankeyNodes.map(node => ({
          ...node,
          // Add node label for display
          label: nodeLabels[node.id] || node.id
        })),
        links: filteredLinks
      });
    }
  }, [networkData, selectedThreat, maxRelationsPerNode]);

  // Compute threat options from network data
  const threatOptions = useMemo(() => {
    if (!networkData || !Array.isArray(networkData.nodes)) {
      return [];
    }
    
    // Return nodes sorted by label
    return [...networkData.nodes]
      .sort((a, b) => a.label.localeCompare(b.label))
      .map(node => ({
        id: node.id,
        label: node.label
      }));
  }, [networkData]);

  // Helper function to get color based on category
  const getCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      'Milieu': 'hsl(130, 70%, 50%)',
      'Sociaal': 'hsl(200, 70%, 50%)',
      'Economie': 'hsl(50, 70%, 50%)',
      'Politiek': 'hsl(300, 70%, 50%)',
      'Gezondheid': 'hsl(0, 70%, 50%)',
      'default': 'hsl(230, 70%, 50%)'
    };
    
    return colorMap[category] || colorMap.default;
  };

  // Calculate sankey chart height based on the number of nodes
  const sankeyHeight = useMemo(() => {
    if (!sankeyData) return 400;
    return Math.max(400, sankeyData.nodes.length * 40);
  }, [sankeyData]);

  // Function to format document link
  const formatDocumentLink = (link: string): string => {
    if (link && link.startsWith('/')) {
      return `https://open.overheid.nl${link}`;
    }
    return link || '#';
  };

  // Function to split citation text by '|||' delimiter
  const renderCitationParts = (citationText: string) => {
    if (!citationText || !citationText.includes(" ||| ")) {
      return <div className="italic bg-muted/40 p-3 rounded text-sm">"{citationText || "Geen citaat beschikbaar"}"</div>;
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

  // Handle link click
  const handleLinkClick = (node: any) => {
    // Only handle clicks on links, not nodes
    if (node.source && node.target) {
      setSelectedLink(node);
      setDialogOpen(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white shadow-md px-8 py-6 mb-8 rounded-lg">
        <h1 className="text-2xl font-bold mb-4" style={{ color: themeColor }}>
          Dreigingsrelaties Visualisatie
        </h1>
        <div className="prose max-w-none mb-6">
          <p className="text-gray-600 leading-relaxed">
            Visualiseer hoe een dreiging direct en indirect samenhangt met andere dreigingen.
            De diagram toont de eerste- en tweede-orde causale verbanden uitgaande van de geselecteerde dreiging.
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Fout</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label htmlFor="threat-select" className="block mb-2">Selecteer een dreiging</Label>
            <Select
              value={selectedThreat}
              onValueChange={setSelectedThreat}
              disabled={loading || threatOptions.length === 0}
            >
              <SelectTrigger id="threat-select" className="w-full">
                <SelectValue placeholder="Selecteer een dreiging" />
              </SelectTrigger>
              <SelectContent>
                {threatOptions.map((option) => (
                  <SelectItem key={`threat-${option.id}`} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="block mb-2">Maximum aantal relaties per dreiging: {maxRelationsPerNode}</Label>
            <div className="px-2">
              <Slider
                value={[maxRelationsPerNode]}
                onValueChange={(values) => setMaxRelationsPerNode(values[0])}
                min={1}
                max={5}
                step={1}
                className="my-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>
          </div>
        </div>
        
        {loading && (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Gegevens laden...</span>
          </div>
        )}
      </div>
      
      {!loading && sankeyData && (
        <Card className="bg-white shadow-md mb-8 rounded-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2" style={{ color: themeColor }}>
                Dreigingsrelaties voor: {networkData?.nodes.find(n => n.id === selectedThreat)?.label || selectedThreat}
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                Dit diagram toont de top {maxRelationsPerNode} directe gevolgen en voor elk daarvan 
                de top {maxRelationsPerNode} secundaire gevolgen.
              </p>
            </div>
            <div style={{ height: `${sankeyHeight}px` }} className="w-full">
              <ResponsiveSankey
                data={sankeyData}
                margin={{ 
                  top: 40, 
                  right: horizontalPadding, 
                  bottom: 40, 
                  left: horizontalPadding 
                }}
                align="justify"
                colors={{ scheme: 'category10' }}
                nodeOpacity={1}
                nodeHoverOthersOpacity={0.35}
                nodeThickness={18}
                nodeSpacing={24}
                nodeBorderWidth={0}
                nodeBorderColor={{
                  from: 'color',
                  modifiers: [['darker', 0.8]]
                }}
                nodeBorderRadius={3}
                linkOpacity={0.5}
                linkHoverOthersOpacity={0.1}
                linkContract={3}
                enableLinkGradient={true}
                labelPosition="outside"
                labelOrientation="horizontal"
                labelPadding={16}
                labelTextColor={{
                  from: 'color',
                  modifiers: [['darker', 1]]
                }}
                onClick={handleLinkClick}
              />
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Dialog for showing citations - Updated to match EdgeRelationshipViewer style */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Verbinding Analyse</DialogTitle>
            <DialogDescription className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-foreground">
                {selectedLink ? selectedLink.sourceLabel : ''}
              </span>
              <PanelRightOpen className="h-4 w-4 rotate-90 opacity-50" />
              <span className="font-medium text-foreground">
                {selectedLink ? selectedLink.targetLabel : ''}
              </span>
              {selectedLink?.edgeInfo?.weight && (
                <span className="text-xs bg-muted px-2 py-1 rounded-full ml-2">
                  Gewicht: {selectedLink.edgeInfo.weight.toFixed(2)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto mt-4 pr-2">
            {selectedLink?.edgeInfo?.citaat_relaties && selectedLink.edgeInfo.citaat_relaties.length > 0 ? (
              <div className="space-y-4">
                {selectedLink.edgeInfo.citaat_relaties.map((citation: RelationCitation, index: number) => (
                  <div key={index} className="p-4 bg-background/50 rounded-lg border border-border/20">
                    <div className="flex justify-between items-start mb-2">
                      <a
                        href={formatDocumentLink(citation.document_link || '')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline flex-1 mr-2"
                      >
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
                        <span>{citation.oorzaak || selectedLink.sourceLabel}</span>
                      </div>
                      <div className="flex gap-2 mb-3">
                        <span className="text-xs font-medium bg-primary/10 px-2 py-0.5 rounded">Gevolg</span>
                        <span>{citation.gevolg || selectedLink.targetLabel}</span>
                      </div>
                      {renderCitationParts(citation.citaat)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
                {selectedLink?.edgeInfo ? (
                  selectedLink.edgeInfo.raw_count ? (
                    <p>Er zijn wel {selectedLink.edgeInfo.raw_count} citaten volgens de data, maar deze konden niet getoond worden.</p>
                  ) : (
                    <p>Geen citaties beschikbaar voor deze verbinding.</p>
                  )
                ) : (
                  <p>Geen details beschikbaar voor dit verband.</p>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Sluiten
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedThreatSankey;