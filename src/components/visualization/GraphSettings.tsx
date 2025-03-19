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

interface GraphSettingsProps {
  scoringMetric: 'hub' | 'auth';
  setScoringMetric: (value: 'hub' | 'auth') => void;
  minNodeSize: number;
  setMinNodeSize: (value: number) => void;
  maxNodeSize: number;
  setMaxNodeSize: (value: number) => void;
  showRelationships: boolean;
  setShowRelationships: (value: boolean) => void;
}

const GraphSettings = ({
  scoringMetric,
  setScoringMetric,
  minNodeSize,
  setMinNodeSize,
  maxNodeSize,
  setMaxNodeSize,
  showRelationships,
  setShowRelationships
}: GraphSettingsProps) => {
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
                    Op basis van het HITS algoritme
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a 
                            href="https://en.wikipedia.org/wiki/HITS_algorithm" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary"
                          >
                            <Info className="h-3 w-3" />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs max-w-[200px]">HITS Algoritme berekent twee scores voor knooppunten: Verbindingshub (verwijst naar veel autoriteitsbronnen) en Autoriteitsbron (wordt verwezen door veel hubs)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>:
                  </Label>
                  <ToggleGroup 
                    type="single" 
                    value={scoringMetric} 
                    onValueChange={(value) => {
                      if (value) setScoringMetric(value as 'hub' | 'auth');
                    }}
                    className="mt-2"
                    id="node-sizing"
                  >
                    <ToggleGroupItem value="hub" aria-label="Size by hub score" className="flex-1">
                      Verbindingshub
                    </ToggleGroupItem>
                    <ToggleGroupItem value="auth" aria-label="Size by authority score" className="flex-1">
                      Autoriteitsbron
                    </ToggleGroupItem>
                  </ToggleGroup>
                  <p className="text-xs text-muted-foreground mt-2">
                    {scoringMetric === 'hub' 
                      ? 'Knooppunten die naar veel belangrijke bronnen verwijzen zijn groter.' 
                      : 'Knooppunten waarnaar veel belangrijke bronnen verwijzen zijn groter.'}
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
              <div className="bg-muted/50 p-3 rounded-lg space-y-3">
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