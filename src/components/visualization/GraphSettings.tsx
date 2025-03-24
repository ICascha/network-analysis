import { ChevronsLeftRightEllipsis, Info } from "lucide-react";
import {
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  ToggleGroup,
  ToggleGroupItem
} from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";

// Updated type to include new eigenvector centrality metrics
type CentralityMetric = 'hub' | 'auth' | 'eigen_centrality' | 'eigen_centrality_in' | 'eigen_centrality_out';

interface GraphSettingsProps {
  scoringMetric: CentralityMetric;
  setScoringMetric: (value: CentralityMetric) => void;
  minNodeSize: number;
  setMinNodeSize: (value: number) => void;
  maxNodeSize: number;
  setMaxNodeSize: (value: number) => void;
  showRelationships: boolean;
  setShowRelationships: (value: boolean) => void;
  // New props for edge filtering and sizing
  edgeWeightCutoff: number;
  setEdgeWeightCutoff: (value: number) => void;
  useWeightBasedEdgeSize: boolean;
  setUseWeightBasedEdgeSize: (value: boolean) => void;
}

const GraphSettings = ({
  scoringMetric,
  setScoringMetric,
  minNodeSize,
  setMinNodeSize,
  maxNodeSize,
  setMaxNodeSize,
  showRelationships,
  setShowRelationships,
  edgeWeightCutoff,
  setEdgeWeightCutoff,
  useWeightBasedEdgeSize,
  setUseWeightBasedEdgeSize
}: GraphSettingsProps) => {
  // Helper function to get description text for the selected metric
  const getMetricDescription = (metric: CentralityMetric): string => {
    switch (metric) {
      case 'hub':
        return 'Knooppunten die naar veel belangrijke bronnen verwijzen zijn groter.';
      case 'auth':
        return 'Knooppunten waarnaar veel belangrijke bronnen verwijzen zijn groter.';
      case 'eigen_centrality':
        return 'Knooppunten met meer verbindingen (inkomend en uitgaand) met andere centrale knooppunten zijn groter.';
      case 'eigen_centrality_in':
        return 'Knooppunten met meer inkomende verbindingen van andere prestigieuze knooppunten zijn groter (prestige).';
      case 'eigen_centrality_out':
        return 'Knooppunten met meer uitgaande verbindingen naar andere belangrijke knooppunten zijn groter (belang).';
      default:
        return '';
    }
  };

  return (
    <SheetContent className="w-full sm:max-w-md overflow-y-auto">
      <SheetHeader className="mb-5">
        <SheetTitle>Visualisatie Instellingen</SheetTitle>
        <SheetDescription>
          Pas de weergave van het netwerk aan.
        </SheetDescription>
      </SheetHeader>
      
      <Tabs defaultValue="nodes" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="nodes" className="flex items-center gap-1">
            <CircleDot className="h-4 w-4" />
            <span>Knooppunten</span>
          </TabsTrigger>
          <TabsTrigger value="edges" className="flex items-center gap-1">
            <ChevronsLeftRightEllipsis className="h-4 w-4" />
            <span>Verbindingen</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="nodes" className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Knooppunt Groottes</h3>
              <div className="bg-muted/50 p-3 rounded-lg space-y-3">
                <div>
                  <Label htmlFor="node-sizing" className="text-sm flex items-center gap-1">
                    Centraliteit Algoritme
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a 
                            href="https://en.wikipedia.org/wiki/Centrality" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary"
                          >
                            <Info className="h-3 w-3" />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs max-w-[250px]">Netwerk centraliteit algoritmes berekenen hoe belangrijk een knooppunt is in het netwerk gebaseerd op verschillende criteria zoals connectiviteit, positie, en verbindingen.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>:
                  </Label>
                  
                  {/* Eigenvector Centrality Section */}
                  <div className="mt-3 border-l-2 border-primary/30 pl-3">
                    <Label className="text-xs font-medium">Eigenvector Centraliteit:</Label>
                    <ToggleGroup 
                      type="single" 
                      value={scoringMetric} 
                      onValueChange={(value) => {
                        if (value === 'eigen_centrality' || value === 'eigen_centrality_in' || value === 'eigen_centrality_out') 
                          setScoringMetric(value as CentralityMetric);
                      }}
                      className="mt-1"
                    >
                      <ToggleGroupItem value="eigen_centrality" aria-label="Size by undirected eigenvector centrality" className="flex-1 text-xs py-1">
                        Ongerichte Centraliteit
                      </ToggleGroupItem>
                    </ToggleGroup>
                    <ToggleGroup 
                      type="single" 
                      value={scoringMetric} 
                      onValueChange={(value) => {
                        if (value === 'eigen_centrality' || value === 'eigen_centrality_in' || value === 'eigen_centrality_out') 
                          setScoringMetric(value as CentralityMetric);
                      }}
                      className="mt-1"
                    >
                      <ToggleGroupItem value="eigen_centrality_in" aria-label="Size by in-degree eigenvector centrality" className="flex-1 text-xs py-1">
                        Prestige (Inkomend)
                      </ToggleGroupItem>
                      <ToggleGroupItem value="eigen_centrality_out" aria-label="Size by out-degree eigenvector centrality" className="flex-1 text-xs py-1">
                        Belang (Uitgaand)
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  {/* HITS Algorithm Section */}
                  <div className="mt-3 border-l-2 border-primary/30 pl-3">
                    <Label className="text-xs font-medium">HITS Algoritme:</Label>
                    <ToggleGroup 
                      type="single" 
                      value={scoringMetric} 
                      onValueChange={(value) => {
                        if (value === 'hub' || value === 'auth') setScoringMetric(value);
                      }}
                      className="mt-1"
                    >
                      <ToggleGroupItem value="hub" aria-label="Size by hub score" className="flex-1 text-xs py-1">
                        Verbindingshub
                      </ToggleGroupItem>
                      <ToggleGroupItem value="auth" aria-label="Size by authority score" className="flex-1 text-xs py-1">
                        Autoriteitsbron
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    {getMetricDescription(scoringMetric)}
                  </p>
                </div>
                
                <div className="pt-2">
                  <Label htmlFor="min-node-size" className="text-sm">Minimum Knooppunt Grootte</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Slider
                      id="min-node-size"
                      value={[minNodeSize]}
                      onValueChange={(value) => setMinNodeSize(value[0])}
                      max={10}
                      min={1}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-12 text-center text-sm">{minNodeSize}px</span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Label htmlFor="max-node-size" className="text-sm">Maximum Knooppunt Grootte</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Slider
                      id="max-node-size"
                      value={[maxNodeSize]}
                      onValueChange={(value) => setMaxNodeSize(value[0])}
                      max={30}
                      min={10}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-12 text-center text-sm">{maxNodeSize}px</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="edges" className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Verbindings Weergave</h3>
              <div className="bg-muted/50 p-3 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-relationships" className="text-sm">Toon Relaties Voor Geselecteerde Knooppunt</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    className={showRelationships ? 'bg-primary/10' : ''}
                    onClick={() => setShowRelationships(!showRelationships)}
                    id="show-relationships"
                  >
                    {showRelationships ? 'Verbergen' : 'Tonen'}
                  </Button>
                </div>

                {/* Edge Weight Cutoff */}
                <div className="pt-2 border-t border-border/20">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="edge-weight-cutoff" className="text-sm flex items-center gap-1">
                      Verbindingsgewicht Filter
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-muted-foreground hover:text-primary" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs max-w-[250px]">Verbindingen met een gewicht lager dan deze waarde worden niet getoond.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <span className="w-12 text-center text-sm">{edgeWeightCutoff}</span>
                  </div>
                  <Slider
                    id="edge-weight-cutoff"
                    value={[edgeWeightCutoff]}
                    onValueChange={(value) => setEdgeWeightCutoff(value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Weight-based Edge Size */}
                <div className="pt-2 border-t border-border/20">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="weight-based-edge-size" className="text-sm flex items-center gap-1">
                        Gewichtgebaseerde Verbindingsgrootte
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-muted-foreground hover:text-primary" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs max-w-[250px]">Als dit is ingeschakeld, wordt de dikte van verbindingen bepaald door hun gewicht.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Verbindingsgrootte is direct proportioneel aan het gewicht.
                      </p>
                    </div>
                    <Switch
                      id="weight-based-edge-size"
                      checked={useWeightBasedEdgeSize}
                      onCheckedChange={setUseWeightBasedEdgeSize}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <SheetFooter className="mt-6">
        <SheetClose asChild>
          <Button>Instellingen Opslaan</Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  );
};

export default GraphSettings;