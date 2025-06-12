// Aangrijpspunten.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveSankey } from '@nivo/sankey';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { categoryColors, nodeCategoryMapLower, nodeRename, gebiedRename } from './auxiliaryData'; // Import new data

// Define types for data structure
interface DataItem {
  Dreiging: string;
  Aangrijpingsgebied: string;
  Aantal: number;
}

interface SankeyNode {
  id: string;
  nodeColor: string;
  category: string;
  labelLines?: string[]; // Changed to array of strings for multi-line labels
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
  rawData: DataItem;
}

interface FormattedSankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

// Function to format long labels by converting them to arrays of lines
const formatLongLabel = (label: string, maxLength = 40): string[] => {
  if (label.length <= maxLength) return [label];
  
  // Split the label into words
  const words = label.split(' ');
  let lines: string[] = [];
  let currentLine = '';
  
  // Build lines word by word
  for (const word of words) {
    // If adding this word exceeds the max length, start a new line
    if (currentLine.length + word.length + 1 > maxLength) {
      if (currentLine) {
        // Add hyphen if we're breaking a line
        lines.push(`${currentLine}`);
        currentLine = word;
      } else {
        // If a single word is longer than max length, we'll just use it as is
        currentLine = word;
      }
    } else {
      // Add word to current line
      currentLine = currentLine ? `${currentLine} ${word}` : word;
    }
  }
  
  // Add the last line
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
};

// Helper function for renaming and capitalizing Aangrijpingsgebied
const formatGebiedLabel = (gebied: string): string => {
  const renamedGebied = gebiedRename[gebied] || gebied;
  return renamedGebied.charAt(0).toUpperCase() + renamedGebied.slice(1);
};

// Helper function to capitalize the first letter of a string
const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};


const Aangrijpspunten: React.FC = () => {
  // State for data and UI
  const [rawData, setRawData] = useState<DataItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [thresholdValue, setThresholdValue] = useState<number>(20);
  const [selectedDreigingen, setSelectedDreigingen] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedLink, setSelectedLink] = useState<DataItem | null>(null);
  const [displayMode, setDisplayMode] = useState<'absolute' | 'relative'>('absolute');
  
  // Theme color
  const themeColor = '#636363';

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch('aangrijpingsgebieden.json');
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const data = await response.json();
        const filteredData = data.filter((item: DataItem) => item.Aangrijpingsgebied !== 'defensie');
        setRawData(filteredData);
                
        if (filteredData.length > 0) {
          const uniqueDreigingen = [...new Set(filteredData.map((item: DataItem) => item.Dreiging))];
          if (uniqueDreigingen.length > 0) {
            setSelectedDreigingen([uniqueDreigingen[0] as any]);
          }
        }

        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setIsLoading(false);
        
        const sampleData = [
          { "Dreiging": "(heimelijke) beïnvloeding en hybride operaties door statelijke actoren die aangrijpen op het maatschappelijk debat", "Aangrijpingsgebied": "defensie", "Aantal": 40 },
          { "Dreiging": "(heimelijke) beïnvloeding en hybride operaties door statelijke actoren die aangrijpen op het maatschappelijk debat", "Aangrijpingsgebied": "democratische rechtsorde, overheid en instituties", "Aantal": 496 },
          { "Dreiging": "(heimelijke) beïnvloeding en hybride operaties door statelijke actoren die aangrijpen op het maatschappelijk debat", "Aangrijpingsgebied": "economie", "Aantal": 45 },
          { "Dreiging": "(heimelijke) beïnvloeding en hybride operaties door statelijke actoren die aangrijpen op het maatschappelijk debat", "Aangrijpingsgebied": "kritieke infrastructuur en functies", "Aantal": 35 },
          { "Dreiging": "(heimelijke) beïnvloeding en hybride operaties door statelijke actoren die aangrijpen op het maatschappelijk debat", "Aangrijpingsgebied": "samenleving (sociaal/psychologisch)", "Aantal": 690 },
          { "Dreiging": "aanval cloud service provider", "Aangrijpingsgebied": "defensie", "Aantal": 1 },
          { "Dreiging": "aanval cloud service provider", "Aangrijpingsgebied": "democratische rechtsorde, overheid en instituties", "Aantal": 4 },
          { "Dreiging": "aanval cloud service provider", "Aangrijpingsgebied": "economie", "Aantal": 8 },
          { "Dreiging": "aanval cloud service provider", "Aangrijpingsgebied": "kritieke infrastructuur en functies", "Aantal": 12 },
          { "Dreiging": "aanval cloud service provider", "Aangrijpingsgebied": "samenleving (sociaal/psychologisch)", "Aantal": 3 }
        ];
        
        setRawData(sampleData);
        
        if (sampleData.length > 0) {
          const uniqueDreigingen = [...new Set(sampleData.map(item => item.Dreiging))];
          if (uniqueDreigingen.length > 0) {
            setSelectedDreigingen([uniqueDreigingen[0]]);
          }
        }
        
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Get unique dreigingen for the selection, sorted by total connections and with special categories on top
  const uniqueDreigingen = useMemo(() => {
    if (!rawData.length) return [];
    
    const specialCategories = [
      'Ecologisch', 
      'Economisch', 
      'Geopolitiek & militair', 
      'Gezondheid', 
      'Sociaal & Maatschappelijk', 
      'Technologisch & digitaal'
    ];
    
    const dreigingTotals = Array.from(new Set(rawData.map(item => item.Dreiging)))
      .map(dreiging => {
        const total = rawData
          .filter(item => item.Dreiging === dreiging)
          .reduce((sum, item) => sum + item.Aantal, 0);
        
        return {
          dreiging,
          total,
          isSpecial: specialCategories.includes(dreiging)
        };
      });
    
    dreigingTotals.sort((a, b) => {
      if (a.isSpecial !== b.isSpecial) {
        return a.isSpecial ? -1 : 1;
      }
      return b.total - a.total;
    });
    
    if (dreigingTotals.some(item => item.isSpecial)) {
      const lastSpecialIndex = dreigingTotals.findIndex(item => !item.isSpecial) - 1;
      if (lastSpecialIndex >= 0) {
        dreigingTotals[lastSpecialIndex].isSpecial = true;
      }
    }
    
    return dreigingTotals;
  }, [rawData]);

  // Filter data based on selections and threshold
  const filteredData = useMemo(() => {
    if (!rawData.length || !selectedDreigingen.length) return [];
    
    let filtered = rawData.filter(item => 
      selectedDreigingen.includes(item.Dreiging)
    );
    
    filtered = filtered.filter(item => item.Aantal >= thresholdValue);
    
    return filtered;
  }, [rawData, selectedDreigingen, thresholdValue]);

  // Format data for the Sankey diagram
  const formattedData = useMemo((): FormattedSankeyData => {
    if (!filteredData.length) return { nodes: [], links: [] };

    const nodesMap = new Map<string, SankeyNode>();
    const links: SankeyLink[] = [];

    // Create nodes for each dreiging (source)
    selectedDreigingen.forEach(dreiging => {
      const category = nodeCategoryMapLower[dreiging] || 'unknown';
      const color = categoryColors[category] || categoryColors['unknown'];
      const renamedAndCapitalized = capitalizeFirstLetter(nodeRename[dreiging] || dreiging);
      nodesMap.set(dreiging, {
        id: dreiging,
        nodeColor: color, // Use category color for the left side
        category: 'dreiging',
        labelLines: formatLongLabel(renamedAndCapitalized) // Use renamed and capitalized labels
      });
    });

    // Create nodes for each aangrijpingsgebied (target)
    const uniqueAangrijpingsgebieden = new Set<string>();
    filteredData.forEach(item => uniqueAangrijpingsgebieden.add(item.Aangrijpingsgebied));

    uniqueAangrijpingsgebieden.forEach(gebied => {
      const formattedId = formatGebiedLabel(gebied);
      nodesMap.set(formattedId, {
        id: formattedId,
        nodeColor: themeColor, // Use uniform blue for the right side
        category: 'aangrijpingsgebied',
        labelLines: formatLongLabel(formattedId)
      });
    });
    
    if (displayMode === 'absolute') {
      filteredData.forEach(item => {
        links.push({
          source: item.Dreiging,
          target: formatGebiedLabel(item.Aangrijpingsgebied),
          value: item.Aantal,
          rawData: item
        });
      });
    } else { // Relative mode
      const dreigingTotals = selectedDreigingen.reduce((acc, dreiging) => {
        const total = rawData
          .filter(item => item.Dreiging === dreiging)
          .reduce((sum, item) => sum + item.Aantal, 0);
        acc[dreiging] = total;
        return acc;
      }, {} as Record<string, number>);
      
      filteredData.forEach(item => {
        const dreigingTotal = dreigingTotals[item.Dreiging] || 0;
        if (dreigingTotal === 0) return;
        const relativeValue = (item.Aantal / dreigingTotal) * 100;
        links.push({
          source: item.Dreiging,
          target: formatGebiedLabel(item.Aangrijpingsgebied),
          value: relativeValue,
          rawData: item
        });
      });
    }
    
    return { 
      nodes: Array.from(nodesMap.values()), 
      links 
    };
  }, [filteredData, selectedDreigingen, displayMode, rawData, themeColor]);

  const handleDreigingToggle = (dreiging: string) => {
    setSelectedDreigingen(prev => {
      if (prev.includes(dreiging)) {
        return prev.length > 1 ? prev.filter(d => d !== dreiging) : prev;
      } 
      return [...prev, dreiging];
    });
  };

  const handleLinkClick = (data: any) => {
    if (!data || !data.rawData) return;
    setSelectedLink(data.rawData);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Title */}
      <h1 className="text-2xl font-bold mb-2" style={{ color: themeColor }}>
        Aangrijpingspunten Analyse
      </h1>
      <p className="text-gray-600 mb-6">
        Deze Sankey-diagram toont de relaties tussen geselecteerde dreigingen en de gebieden waarop zij aangrijpen.
      </p>

      {/* Controls Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-4 border rounded-md shadow-sm">
        {/* Dreigingen Selection */}
        <div className="col-span-1 md:col-span-2">
          <h3 className="font-medium text-gray-700 mb-2">Selecteer Dreiging(en)</h3>
          <ScrollArea className="h-48 rounded-md border p-4">
            {uniqueDreigingen.map(({ dreiging, total, isSpecial }) => (
              <div key={dreiging} className={`flex items-center space-x-2 mb-2 ${isSpecial ? 'border-b pb-2 mb-2' : ''}`}>
                <Checkbox
                  id={dreiging}
                  checked={selectedDreigingen.includes(dreiging)}
                  onCheckedChange={() => handleDreigingToggle(dreiging)}
                />
                <label htmlFor={dreiging} className="text-sm text-gray-800 flex-1 cursor-pointer">
                  {capitalizeFirstLetter(nodeRename[dreiging] || dreiging)} ({total})
                </label>
              </div>
            ))}
          </ScrollArea>
        </div>

        <div className="col-span-1">
          {/* Threshold Slider */}
          <div className="mb-6">
            <Label htmlFor="threshold" className="font-medium text-gray-700">
              Drempelwaarde: {thresholdValue}
            </Label>
            <p className="text-sm text-gray-500 mb-2">Toon alleen verbindingen met dit minimum aantal.</p>
            <Slider
              id="threshold"
              min={0}
              max={100}
              step={5}
              value={[thresholdValue]}
              onValueChange={(value) => setThresholdValue(value[0])}
            />
          </div>

          {/* Display Mode */}
          <div>
            <Label className="font-medium text-gray-700">Weergavemodus</Label>
            <p className="text-sm text-gray-500 mb-2">Kies hoe de verbindingsdikte wordt berekend.</p>
            <RadioGroup
              value={displayMode}
              onValueChange={(value: 'absolute' | 'relative') => setDisplayMode(value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="absolute" id="absolute" />
                <Label htmlFor="absolute">Absoluut</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="relative" id="relative" />
                <Label htmlFor="relative">Relatief</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Diagram and Legend Wrapper */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1 md:col-span-3">
          {/* Sankey Diagram Section */}
          <div className="relative border-t border-gray-200 pt-6 mb-6">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white px-4">
              <h2 className="text-lg font-semibold" style={{ color: themeColor }}>
                Dreigingen → Aangrijpingsgebieden
              </h2>
            </div>

            <div className="border border-gray-200 rounded-md p-4 bg-white">
              <div className="h-[600px]">
                {formattedData.nodes.length > 0 && formattedData.links.length > 0 ? (
                  <ResponsiveSankey
                    data={formattedData}
                    margin={{ top: 40, right: 250, bottom: 40, left: 250 }}
                    align="justify"
                    colors={(node) => node.nodeColor || themeColor}
                    nodeOpacity={1}
                    nodeHoverOthersOpacity={0.35}
                    nodeThickness={18}
                    nodeSpacing={24}
                    nodeBorderWidth={0}
                    nodeBorderRadius={3}
                    linkOpacity={0.5}
                    linkHoverOthersOpacity={0.1}
                    linkContract={3}
                    enableLinkGradient={false}
                    labelPosition="outside"
                    labelOrientation="horizontal"
                    labelPadding={16}
                    labelTextColor={{ from: 'color', modifiers: [['darker', 1]] }}
                    label={node => {
                      if (!node.labelLines || node.labelLines.length === 1) {
                         // Nivo expects the original ID to be returned for single lines, but we want the formatted one.
                         // So we get it from the node object itself.
                        return node.labelLines?.[0] || node.id;
                      }
                      return (
                        <React.Fragment>
                          {node.labelLines.map((line, i) => (
                            <tspan key={i} x="0" dy={i === 0 ? "0" : "1.2em"}>
                              {line}
                            </tspan>
                          ))}
                        </React.Fragment>
                      ) as unknown as string;
                    }}
                    animate={true}
                    motionConfig="gentle"
                    onClick={handleLinkClick}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">
                      Geen gegevens beschikbaar met de huidige instellingen. 
                      Probeer meer dreigingen te selecteren of verlaag de drempelwaarde.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <p>
                {displayMode === 'absolute' 
                  ? `De dikte van elke verbinding toont het absolute aantal verbindingen.`
                  : `De dikte van elke verbinding toont het relatieve percentage per dreiging.`}
                <br />
                Alleen verbindingen met een absolute waarde van {thresholdValue} of hoger worden getoond.
                <br />
                Klik op een verbinding voor meer details.
              </p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="col-span-1">
          <h3 className="font-medium text-gray-700 mb-2">Legenda Dreiging Categorieën</h3>
          <div className="space-y-2">
            {Object.entries(categoryColors).filter(([key]) => key !== 'unknown').map(([category, color]) => (
              <div key={category} className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded" 
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-sm">{category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dialog for Link Details */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Details van de Verbinding</DialogTitle>
          </DialogHeader>
          {selectedLink && (
            <div className="space-y-4">
              <div>
                <Label className="font-semibold">Dreiging</Label>
                <p className="text-sm text-gray-700 p-2 border rounded-md bg-gray-50">
                  {capitalizeFirstLetter(nodeRename[selectedLink.Dreiging] || selectedLink.Dreiging)}
                </p>
              </div>
              <div>
                <Label className="font-semibold">Aangrijpingsgebied</Label>
                <p className="text-sm text-gray-700 p-2 border rounded-md bg-gray-50">
                  {formatGebiedLabel(selectedLink.Aangrijpingsgebied)}
                </p>
              </div>
              <div>
                <Label className="font-semibold">Aantal Verbindingen</Label>
                <p className="text-lg font-bold p-2 border rounded-md bg-gray-50" style={{ color: themeColor }}>
                  {selectedLink.Aantal}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Aangrijpspunten;