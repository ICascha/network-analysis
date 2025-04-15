import { ChevronsLeftRightEllipsis, Info, Users, Network } from "lucide-react"; // Added Network icon for cross-category
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
import { Separator } from "@/components/ui/separator"; // Import Separator

// Updated type to include cross-category eigenvector centrality metrics
type CentralityMetric = 
  'eigen_centrality' | 
  'eigen_centrality_in' | 
  'eigen_centrality_out' | 
  'cross_category_eigen_centrality' | 
  'cross_category_eigen_centrality_in' | 
  'cross_category_eigen_centrality_out';

// --- UPDATED Props Interface ---
interface GraphSettingsProps {
  scoringMetric: CentralityMetric;
  setScoringMetric: (value: CentralityMetric) => void;
  minNodeSize: number;
  setMinNodeSize: (value: number) => void;
  maxNodeSize: number;
  setMaxNodeSize: (value: number) => void;
  showRelationships: boolean;
  setShowRelationships: (value: boolean) => void;
  edgeWeightCutoff: number;
  setEdgeWeightCutoff: (value: number) => void;
  useWeightBasedEdgeSize: boolean;
  setUseWeightBasedEdgeSize: (value: boolean) => void;
  // --- ADDED Props for clustering ---
  clusterOnCategory: boolean;
  setClusterOnCategory: (value: boolean) => void;
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
  setUseWeightBasedEdgeSize,
  // --- Destructure cluster props ---
  clusterOnCategory,
  setClusterOnCategory
}: GraphSettingsProps) => {
  // Helper function to get description text for the selected metric
  const getMetricDescription = (metric: CentralityMetric): string => {
    switch (metric) {
      case 'eigen_centrality':
        return 'Knooppunten verbonden met andere centrale knooppunten zijn groter.';
      case 'eigen_centrality_in':
        return 'Knooppunten met veel inkomende links van centrale knooppunten zijn groter (prestige).';
      case 'eigen_centrality_out':
        return 'Knooppunten met veel uitgaande links naar centrale knooppunten zijn groter (belang).';
      case 'cross_category_eigen_centrality':
        return 'Knooppunten verbonden met andere centrale knooppunten uit verschillende categorieën zijn groter.';
      case 'cross_category_eigen_centrality_in':
        return 'Knooppunten met veel inkomende links van centrale knooppunten uit verschillende categorieën zijn groter (prestige).';
      case 'cross_category_eigen_centrality_out':
        return 'Knooppunten met veel uitgaande links naar centrale knooppunten uit verschillende categorieën zijn groter (belang).';
      default:
        return '';
    }
  };

  // Check if the current metric is a cross-category metric
  const isCrossCategoryMetric = scoringMetric.startsWith('cross_category_');
  
  // Helper function to toggle between regular and cross-category versions of the same metric
  const toggleCrossCategory = (useCrossCategory: boolean) => {
    if (useCrossCategory) {
      // Switch to cross-category version
      if (scoringMetric === 'eigen_centrality') {
        setScoringMetric('cross_category_eigen_centrality');
      } else if (scoringMetric === 'eigen_centrality_in') {
        setScoringMetric('cross_category_eigen_centrality_in');
      } else if (scoringMetric === 'eigen_centrality_out') {
        setScoringMetric('cross_category_eigen_centrality_out');
      }
    } else {
      // Switch to regular version
      if (scoringMetric === 'cross_category_eigen_centrality') {
        setScoringMetric('eigen_centrality');
      } else if (scoringMetric === 'cross_category_eigen_centrality_in') {
        setScoringMetric('eigen_centrality_in');
      } else if (scoringMetric === 'cross_category_eigen_centrality_out') {
        setScoringMetric('eigen_centrality_out');
      }
    }
  };

  // Helper function to get the base metric type without the cross-category prefix
  const getBaseMetricType = (metric: CentralityMetric): 'eigen_centrality' | 'eigen_centrality_in' | 'eigen_centrality_out' => {
    if (metric.startsWith('cross_category_')) {
      return metric.substring('cross_category_'.length) as 'eigen_centrality' | 'eigen_centrality_in' | 'eigen_centrality_out';
    }
    return metric as 'eigen_centrality' | 'eigen_centrality_in' | 'eigen_centrality_out';
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

        {/* === NODES TAB === */}
        <TabsContent value="nodes" className="space-y-6">
          {/* --- Node Sizing Section (Modified Structure) --- */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium mb-2">Knooppunt Groottes</h3>
            <div className="bg-muted/50 p-3 rounded-lg space-y-3">
              <div>
                <Label htmlFor="node-sizing" className="text-sm flex items-center gap-1">
                  Grootte obv. Centraliteit
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                         {/* Ensure 'a' tag is the single child */}
                        <a
                          href="https://en.wikipedia.org/wiki/Centrality"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary inline-flex items-center justify-center ml-1"
                           onClick={(e) => e.stopPropagation()} // Prevent sheet closure
                        >
                          <Info className="h-3 w-3" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-[250px]">Netwerk centraliteit algoritmes berekenen hoe belangrijk een knooppunt is in het netwerk.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>:
                </Label>
                <p className="text-xs text-muted-foreground mt-1 mb-3">
                  {getMetricDescription(scoringMetric)}
                </p>

                {/* Cross-Category Toggle */}
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="cross-category-toggle" className="text-sm flex items-center gap-1.5">
                      <Network className="h-4 w-4 text-muted-foreground" />
                      Alleen Cross-Categorie
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center justify-center ml-1">
                              <Info className="h-3 w-3 text-muted-foreground hover:text-primary" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs max-w-[250px]">Als dit is ingeschakeld, worden alleen verbindingen tussen verschillende categorieën meegenomen in de centraliteitsberekening.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Alleen verbindingen tussen verschillende categorieën tellen mee.
                    </p>
                  </div>
                  <Switch
                    id="cross-category-toggle"
                    checked={isCrossCategoryMetric}
                    onCheckedChange={toggleCrossCategory}
                  />
                </div>

                {/* Eigenvector Centrality */}
                <div className="border-l-2 border-primary/30 pl-3 mb-3">
                  <Label className="text-xs font-medium">Eigenvector Centraliteit:</Label>
                  <ToggleGroup
                    type="single"
                    value={getBaseMetricType(scoringMetric)}
                    onValueChange={(value) => {
                      if (value === 'eigen_centrality' || value === 'eigen_centrality_in' || value === 'eigen_centrality_out') {
                        const newMetric = isCrossCategoryMetric ? 
                          `cross_category_${value}` : 
                          value;
                        setScoringMetric(newMetric as CentralityMetric);
                      }
                    }}
                    className="mt-1 flex flex-wrap gap-1"
                  >
                    <ToggleGroupItem value="eigen_centrality" aria-label="Size by undirected eigenvector centrality" className="flex-1 text-xs py-1 min-w-[90px] h-8">
                      Ongericht
                    </ToggleGroupItem>
                    <ToggleGroupItem value="eigen_centrality_in" aria-label="Size by in-degree eigenvector centrality" className="flex-1 text-xs py-1 min-w-[90px] h-8">
                      Prestige (In)
                    </ToggleGroupItem>
                    <ToggleGroupItem value="eigen_centrality_out" aria-label="Size by out-degree eigenvector centrality" className="flex-1 text-xs py-1 min-w-[90px] h-8">
                      Belang (Uit)
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>

              {/* Min/Max Size Sliders */}
              <Separator className="!my-4 bg-border/30" />
              <div className="pt-2">
                <Label htmlFor="min-node-size" className="text-sm">Minimale Grootte</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Slider
                    id="min-node-size"
                    value={[minNodeSize]}
                    onValueChange={(value) => setMinNodeSize(value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <span className="w-12 text-center text-sm font-mono">{minNodeSize}px</span>
                </div>
              </div>

              <div className="pt-2">
                <Label htmlFor="max-node-size" className="text-sm">Maximale Grootte</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Slider
                    id="max-node-size"
                    value={[maxNodeSize]}
                    onValueChange={(value) => setMaxNodeSize(value[0])}
                    max={30}
                    min={10}
                    step={1}
                    className="flex-1"
                  />
                  <span className="w-12 text-center text-sm font-mono">{maxNodeSize}px</span>
                </div>
              </div>
            </div>
          </div>

          {/* --- Node Clustering Section --- */}
          <div className="space-y-4 pt-4 border-t border-border/20">
              <h3 className="text-sm font-medium mb-2">Knooppunt Layout</h3>
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="cluster-on-category" className="text-sm flex items-center gap-1.5">
                         <Users className="h-4 w-4 text-muted-foreground" />
                         Cluster op Categorie
                        </Label>
                        <p className="text-xs text-muted-foreground">
                         Groepeer knooppunten met dezelfde categorie.
                        </p>
                    </div>
                    <Switch
                        id="cluster-on-category"
                        checked={clusterOnCategory}
                        onCheckedChange={setClusterOnCategory}
                        aria-labelledby="cluster-on-category-label"
                    />
                </div>
              </div>
          </div>
        </TabsContent>

        {/* === EDGES TAB === */}
        <TabsContent value="edges" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium mb-2">Verbindings Weergave</h3>
            <div className="bg-muted/50 p-3 rounded-lg space-y-4">
              {/* Show Relationships Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="show-relationships" className="text-sm flex-grow pr-4">
                  Markeer Relaties (Selecteer eerst knooppunt)
                </Label>
                <Switch
                    id="show-relationships"
                    checked={showRelationships}
                    onCheckedChange={setShowRelationships}
                />
              </div>

              {/* Edge Weight Cutoff */}
              <Separator className="!my-4 bg-border/30" />
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="edge-weight-cutoff" className="text-sm flex items-center gap-1">
                    Filter Verbindingsgewicht
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center justify-center ml-1"><Info className="h-3 w-3 text-muted-foreground hover:text-primary" /></span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs max-w-[250px]">Verberg verbindingen met gewicht lager dan deze waarde.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <span className="w-12 text-center text-sm font-mono">{edgeWeightCutoff.toFixed(2)}</span>
                </div>
                <Slider
                  id="edge-weight-cutoff"
                  value={[edgeWeightCutoff]}
                  onValueChange={(value) => setEdgeWeightCutoff(value[0])}
                  max={5}
                  min={0.5}
                  step={0.05}
                  className="w-full"
                />
              </div>

              {/* Weight-based Edge Size */}
              <Separator className="!my-4 bg-border/30" />
              <div className="pt-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weight-based-edge-size" className="text-sm flex items-center gap-1">
                      Gewichtgebaseerde Dikte
                       <TooltipProvider delayDuration={100}>
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <span className="inline-flex items-center justify-center ml-1"><Info className="h-3 w-3 text-muted-foreground hover:text-primary" /></span>
                           </TooltipTrigger>
                           <TooltipContent>
                             <p className="text-xs max-w-[250px]">Maak verbindingen dikker naarmate hun gewicht hoger is.</p>
                           </TooltipContent>
                         </Tooltip>
                       </TooltipProvider>
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Dikkere lijnen = sterkere relatie.
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
        </TabsContent>
      </Tabs>

      <SheetFooter className="mt-6">
        <SheetClose asChild>
          <Button type="button" variant="outline">Sluiten</Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  );
};

export default GraphSettings;