import { Button } from "@/components/ui/button";
import { Link, PanelRightOpen } from "lucide-react";
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Node, Edge } from './networkGraph/networkService';


export interface EdgeRelationshipViewerProps {
  nodes: Node[];
  edges: Edge[];
  onModeToggle: (active: boolean) => void;
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
}

export interface RelationCitation {
  filename: string;
  citaat: string;
  oorzaak: string;
  gevolg: string;
  publication_date: string;
  source: string;
  title: string;
  document_link: string;
}

export const EdgeRelationshipViewer = ({
  nodes,
  edges,
  onModeToggle,
  selectedNodeId,
  onNodeSelect
}: EdgeRelationshipViewerProps) => {
  const [relationshipMode, setRelationshipMode] = useState<boolean>(false);
  const [firstNodeId, setFirstNodeId] = useState<string | null>(null);
  const [secondNodeId, setSecondNodeId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [relationshipEdge, setRelationshipEdge] = useState<Edge | null>(null);

  // Reset selection when exiting relationship mode
  useEffect(() => {
    if (!relationshipMode) {
      setFirstNodeId(null);
      setSecondNodeId(null);
    }
  }, [relationshipMode]);

  // Set first node when a node is selected in relationship mode
  useEffect(() => {
    if (relationshipMode && selectedNodeId) {
      if (!firstNodeId) {
        setFirstNodeId(selectedNodeId);
      } else if (firstNodeId !== selectedNodeId && !secondNodeId) {
        setSecondNodeId(selectedNodeId);
      }
    }
  }, [selectedNodeId, relationshipMode, firstNodeId, secondNodeId]);

  // When both nodes are selected, find the edge between them and open dialog
  useEffect(() => {
    if (firstNodeId && secondNodeId) {
      const edge = edges.find(e => 
        (e.source === firstNodeId && e.target === secondNodeId));
      
      if (edge) {
        setRelationshipEdge(edge);
        setDialogOpen(true);
      } else {
        // No edge found between these nodes
        alert("Geen verbinding gevonden tussen de geselecteerde dreigingen.");
      }
      
      // Reset selection after attempt
      setFirstNodeId(null);
      setSecondNodeId(null);
      setRelationshipMode(false);
      onModeToggle(false);
      onNodeSelect(null);
    }
  }, [firstNodeId, secondNodeId, edges, onModeToggle, onNodeSelect]);

  const toggleRelationshipMode = () => {
    const newState = !relationshipMode;
    setRelationshipMode(newState);
    onModeToggle(newState);
    
    // Reset selection when toggling
    if (newState) {
      setFirstNodeId(null);
      setSecondNodeId(null);
    } else {
      onNodeSelect(null);
    }
  };

  const formatDocumentLink = (link: string): string => {
    if (link && link.startsWith('/')) {
      return `https://open.overheid.nl${link}`;
    }
    return link || '#';
  };

  // Get node labels for display
  const getNodeLabel = (nodeId: string | null): string => {
    if (!nodeId) return '';
    const node = nodes.find(n => n.id === nodeId);
    return node ? node.label : 'Onbekend';
  };

  // Function to split citation text by '|||' delimiter
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
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`whitespace-nowrap ${relationshipMode ? 'bg-primary/10' : ''}`}
              onClick={toggleRelationshipMode}
            >
              <Link className="h-4 w-4 mr-1" />
              {relationshipMode ? 'Annuleer Verbindingsanalyse' : 'Analyseer Verbinding'}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {relationshipMode 
                ? `Selecteer twee dreigingen om hun verbinding te analyseren. Stap ${firstNodeId ? '2/2' : '1/2'}`
                : 'Selecteer twee dreigingen om hun verbinding te analyseren'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Selection status indicator during relationship mode */}
      {relationshipMode && (
        <div className="mt-2 text-xs">
          <p className="text-muted-foreground">
            {!firstNodeId 
              ? "Selecteer eerste dreiging..." 
              : `Eerste dreiging: ${getNodeLabel(firstNodeId)}`}
          </p>
          {firstNodeId && (
            <p className="text-muted-foreground mt-1">
              {!secondNodeId 
                ? "Selecteer tweede dreiging..." 
                : `Tweede dreiging: ${getNodeLabel(secondNodeId)}`}
            </p>
          )}
        </div>
      )}

      {/* Relationship Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Verbinding Analyse</DialogTitle>
            <DialogDescription className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-foreground">{getNodeLabel(relationshipEdge?.source || null)}</span>
              <PanelRightOpen className="h-4 w-4 rotate-90 opacity-50" />
              <span className="font-medium text-foreground">{getNodeLabel(relationshipEdge?.target || null)}</span>
              {relationshipEdge?.weight && (
                <span className="text-xs bg-muted px-2 py-1 rounded-full ml-2">
                  Gewicht: {relationshipEdge.weight.toFixed(2)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto mt-4 pr-2">
            {relationshipEdge?.citaat_relaties && relationshipEdge.citaat_relaties.length > 0 ? (
              <div className="space-y-4">
                {relationshipEdge.citaat_relaties.map((citation, index) => (
                  <div key={index} className="p-4 bg-background/50 rounded-lg border border-border/20">
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
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
                Geen citaties beschikbaar voor deze verbinding.
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
    </>
  );
};

export default EdgeRelationshipViewer;