import { Card } from "@/components/ui/card";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThreatImpactWeights } from './networkGraph/threatImpactService';

interface ThreatImpactWeightsControlProps {
  weights: ThreatImpactWeights;
  onChange: (weights: ThreatImpactWeights) => void;
}

const ThreatImpactWeightsControl = ({ 
  weights, 
  onChange 
}: ThreatImpactWeightsControlProps) => {
  
  const handleWeightChange = (level: keyof ThreatImpactWeights, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onChange({
        ...weights,
        [level]: numValue
      });
    }
  };

  return (
    <Card className="bg-background/70 backdrop-blur-md p-3 rounded-lg shadow-lg">
      <Accordion type="single" collapsible defaultValue="impact-weights">
        <AccordionItem value="impact-weights">
          <AccordionTrigger className="text-xs py-1">
            Dreiging Impact Gewichten
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <Label htmlFor="beperkt-weight" className="text-xs">Beperkt</Label>
                <Input
                  id="beperkt-weight"
                  type="number"
                  min="0"
                  step="0.1"
                  value={weights.Beperkt}
                  onChange={(e) => handleWeightChange('Beperkt', e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="aanzienlijk-weight" className="text-xs">Aanzienlijk</Label>
                <Input
                  id="aanzienlijk-weight"
                  type="number"
                  min="0"
                  step="0.1"
                  value={weights.Aanzienlijk}
                  onChange={(e) => handleWeightChange('Aanzienlijk', e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="ernstig-weight" className="text-xs">Ernstig</Label>
                <Input
                  id="ernstig-weight"
                  type="number"
                  min="0"
                  step="0.1"
                  value={weights.Ernstig}
                  onChange={(e) => handleWeightChange('Ernstig', e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="zeer-ernstig-weight" className="text-xs">Zeer ernstig</Label>
                <Input
                  id="zeer-ernstig-weight"
                  type="number"
                  min="0"
                  step="0.1"
                  value={weights['Zeer ernstig']}
                  onChange={(e) => handleWeightChange('Zeer ernstig', e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="catastrofaal-weight" className="text-xs">Catastrofaal</Label>
                <Input
                  id="catastrofaal-weight"
                  type="number"
                  min="0"
                  step="0.1"
                  value={weights.Catastrofaal}
                  onChange={(e) => handleWeightChange('Catastrofaal', e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};

export default ThreatImpactWeightsControl;