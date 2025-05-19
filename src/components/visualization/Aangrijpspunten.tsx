import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveSankey } from '@nivo/sankey';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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

// Color palette for categories
const CATEGORY_COLORS = {
  'democratische rechtsorde, overheid en instituties': '#0099A8',
  'kritieke infrastructuur en functies': '#33ADBA',
  'economie': '#66C2CB',
  'defensie': '#99D6DC',
  'samenleving (sociaal/psychologisch)': '#CCEAED',
  // Default color for other categories
  'default': '#CCEAED'
};

// Function to get node color based on category
const getNodeColor = (category: string): string => {
  return CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.default;
};

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
        lines.push(`${currentLine}-`);
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
  const themeColor = 'rgb(0,153,168)';

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get the base URL - in a real implementation this would be a fetch to your server
        // For now, we'll simulate it with a mock fetch
        const response = await fetch('aangrijpingsgebieden.json');
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const data = await response.json();
        setRawData(data);
        
        // Initially select the first dreiging
        if (data.length > 0) {
          const uniqueDreigingen = [...new Set(data.map((item: DataItem) => item.Dreiging))];
          if (uniqueDreigingen.length > 0) {
            setSelectedDreigingen([uniqueDreigingen[0] as any]);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setIsLoading(false);
        
        // For development, load sample data
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
        
        // Initially select the first dreiging
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
    
    // Define special categories to appear at the top
    const specialCategories = [
      'Ecologisch', 
      'Economisch', 
      'Geopolitiek & militair', 
      'Gezondheid', 
      'Sociaal & Maatschappelijk', 
      'Technologisch & digitaal'
    ];
    
    // Calculate totals for each dreiging
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
    
    // Sort by special categories first, then by total amount (descending)
    dreigingTotals.sort((a, b) => {
      // First, sort by whether they're special categories
      if (a.isSpecial !== b.isSpecial) {
        return a.isSpecial ? -1 : 1;
      }
      
      // If both are special or both are not special, sort by total
      return b.total - a.total;
    });
    
    // Mark the last special category for adding a divider after it
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
    
    // Filter data based on selected dreigingen
    let filtered = rawData.filter(item => 
      selectedDreigingen.includes(item.Dreiging)
    );
    
    // Apply absolute threshold filter for both display modes
    filtered = filtered.filter(item => item.Aantal >= thresholdValue);
    
    return filtered;
  }, [rawData, selectedDreigingen, thresholdValue]);

  // Format data for the Sankey diagram
  const formattedData = useMemo((): FormattedSankeyData => {
    if (!filteredData.length) return { nodes: [], links: [] };

    const nodesMap = new Map<string, SankeyNode>();
    const links: SankeyLink[] = [];
    
    // Process data based on display mode
    if (displayMode === 'absolute') {
      // Create nodes for each dreiging (source)
      selectedDreigingen.forEach(dreiging => {
        nodesMap.set(dreiging, {
          id: dreiging,
          nodeColor: themeColor,
          category: 'dreiging',
          labelLines: formatLongLabel(dreiging) // Format long labels into array of lines
        });
      });
      
      // Create nodes for each aangrijpingsgebied (target)
      const uniqueAangrijpingsgebieden = new Set<string>();
      filteredData.forEach(item => uniqueAangrijpingsgebieden.add(item.Aangrijpingsgebied));
      
      uniqueAangrijpingsgebieden.forEach(gebied => {
        nodesMap.set(gebied, {
          id: gebied,
          nodeColor: getNodeColor(gebied),
          category: 'aangrijpingsgebied',
          labelLines: formatLongLabel(gebied) // Format long labels into array of lines
        });
      });
      
      // Create links
      filteredData.forEach(item => {
        links.push({
          source: item.Dreiging,
          target: item.Aangrijpingsgebied,
          value: item.Aantal,
          rawData: item
        });
      });
    } else {
      // Relative mode
      
      // Calculate totals for each dreiging
      const dreigingTotals = selectedDreigingen.reduce((acc, dreiging) => {
        const total = rawData
          .filter(item => item.Dreiging === dreiging)
          .reduce((sum, item) => sum + item.Aantal, 0);
        acc[dreiging] = total;
        return acc;
      }, {} as Record<string, number>);
      
      // Create nodes for each dreiging (source)
      selectedDreigingen.forEach(dreiging => {
        nodesMap.set(dreiging, {
          id: dreiging,
          nodeColor: themeColor,
          category: 'dreiging',
          labelLines: formatLongLabel(dreiging) // Format long labels
        });
      });
      
      // Create nodes for each aangrijpingsgebied (target)
      const uniqueAangrijpingsgebieden = new Set<string>();
      filteredData.forEach(item => uniqueAangrijpingsgebieden.add(item.Aangrijpingsgebied));
      
      uniqueAangrijpingsgebieden.forEach(gebied => {
        nodesMap.set(gebied, {
          id: gebied,
          nodeColor: getNodeColor(gebied),
          category: 'aangrijpingsgebied',
          labelLines: formatLongLabel(gebied) // Format long labels
        });
      });
      
      // Create links with relative values (percentages)
      filteredData.forEach(item => {
        const dreigingTotal = dreigingTotals[item.Dreiging] || 0;
        if (dreigingTotal === 0) return;
        
        const relativeValue = (item.Aantal / dreigingTotal) * 100;
        
        links.push({
          source: item.Dreiging,
          target: item.Aangrijpingsgebied,
          value: relativeValue,
          rawData: item
        });
      });
    }
    
    return { 
      nodes: Array.from(nodesMap.values()), 
      links 
    };
  }, [filteredData, selectedDreigingen, displayMode, rawData]);

  // Handle dreiging selection toggle
  const handleDreigingToggle = (dreiging: string) => {
    setSelectedDreigingen(prev => {
      // If item is already selected, remove it (unless it's the last one)
      if (prev.includes(dreiging)) {
        return prev.length > 1 ? prev.filter(d => d !== dreiging) : prev;
      } 
      // Otherwise add it
      return [...prev, dreiging];
    });
  };

  // Handle link click to show details
  const handleLinkClick = (data: any) => {
    if (!data || !data.rawData) return;
    
    setSelectedLink(data.rawData);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="flex items-center justify-center p-10">
            <div className="text-center">
              <p className="text-gray-500">Laden van gegevens...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && rawData.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="flex items-center justify-center p-10">
            <div className="text-center">
              <p className="text-red-500">Fout bij het laden van gegevens: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="relative w-full bg-white shadow-md px-8 py-6">
        <div className="prose max-w-none mb-6">
          <p className="text-gray-600 leading-relaxed">
            Deze visualisatie toont de verbanden tussen dreigingen en aangrijpingsgebieden.
            U kunt meerdere dreigingen selecteren aan de linkerkant, en de bijbehorende aangrijpingsgebieden worden aan de rechterkant getoond.
            De dikte van elke verbinding geeft {displayMode === 'absolute' ? 'het absolute aantal' : 'het relatieve percentage'} weer.
          </p>
        </div>

        {/* Controls Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 border-t border-gray-200 pt-6">
          {/* Dreigingen Selection */}
          <div className="col-span-1">
            <h3 className="font-medium text-gray-700 mb-2">Selecteer Dreigingen</h3>
            <div className="border rounded-md overflow-hidden">
              <ScrollArea className="h-60 w-full">
                <div className="p-2">
                  <div className="space-y-1">
                    {/* Special Categories Section - Brede Categorieën */}
                    {uniqueDreigingen.filter(item => item.isSpecial).length > 0 && (
                      <div className="mb-2">
                        <div className="bg-gray-100 py-1 px-2 text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Categorieën
                        </div>
                        {uniqueDreigingen
                          .filter(item => item.isSpecial)
                          .map(item => (
                            <div 
                              key={item.dreiging} 
                              className={`flex items-center px-2 py-1.5 ${
                                selectedDreigingen.includes(item.dreiging) 
                                  ? 'bg-blue-50' 
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <Checkbox 
                                id={`dreiging-${item.dreiging}`}
                                checked={selectedDreigingen.includes(item.dreiging)}
                                onCheckedChange={() => handleDreigingToggle(item.dreiging)}
                                className="mr-2"
                              />
                              <Label 
                                htmlFor={`dreiging-${item.dreiging}`}
                                className="text-sm flex-1 cursor-pointer"
                              >
                                {item.dreiging}
                              </Label>
                              <span className="text-xs font-medium text-gray-500 ml-1">
                                {item.total.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        {/* Divider after special categories */}
                        <div className="h-px bg-gray-200 my-2" />
                      </div>
                    )}
                    
                    {/* Regular Threats Section */}
                    {uniqueDreigingen.filter(item => !item.isSpecial).length > 0 && (
                      <div>
                        <div className="bg-gray-100 py-1 px-2 text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Dreigingen
                        </div>
                        {uniqueDreigingen
                          .filter(item => !item.isSpecial)
                          .map(item => (
                            <div 
                              key={item.dreiging} 
                              className={`flex items-center px-2 py-1.5 ${
                                selectedDreigingen.includes(item.dreiging) 
                                  ? 'bg-blue-50' 
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <Checkbox 
                                id={`dreiging-${item.dreiging}`}
                                checked={selectedDreigingen.includes(item.dreiging)}
                                onCheckedChange={() => handleDreigingToggle(item.dreiging)}
                                className="mr-2"
                              />
                              <Label 
                                htmlFor={`dreiging-${item.dreiging}`}
                                className="text-sm flex-1 cursor-pointer"
                              >
                                {item.dreiging}
                              </Label>
                              <span className="text-xs font-medium text-gray-500 ml-1">
                                {item.total.toLocaleString()}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </div>
            <div className="mt-2 text-xs text-gray-500 flex justify-between">
              <span>{selectedDreigingen.length} van {uniqueDreigingen.length} geselecteerd</span>
              <div className="space-x-2">
                <button 
                  onClick={() => setSelectedDreigingen(uniqueDreigingen.map(item => item.dreiging))}
                  className="text-blue-600 hover:underline"
                >
                  Alles
                </button>
                <button 
                  onClick={() => {
                    // Select only the first item if deselecting would leave nothing selected
                    if (selectedDreigingen.length <= 1) {
                      setSelectedDreigingen([uniqueDreigingen[0].dreiging]);
                    } else {
                      setSelectedDreigingen([]);
                    }
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Geen
                </button>
              </div>
            </div>
          </div>
          
          {/* Display Mode */}
          <div className="col-span-1">
            <h3 className="font-medium text-gray-700 mb-2">Weergavemodus</h3>
            <RadioGroup
              value={displayMode}
              onValueChange={(value) => setDisplayMode(value as 'absolute' | 'relative')}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="absolute" id="absolute" />
                <Label htmlFor="absolute">Absolute waardes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="relative" id="relative" />
                <Label htmlFor="relative">Relatieve waardes (%)</Label>
              </div>
            </RadioGroup>
            
            <div className="mt-6">
              <h3 className="font-medium text-gray-700 mb-2">
                Minimale drempelwaarde (absoluut): {thresholdValue}
              </h3>
              <Slider 
                id="threshold-slider"
                min={0}
                max={100}
                step={1}
                value={[thresholdValue]}
                onValueChange={(value) => setThresholdValue(value[0])}
                className="w-full"
              />
              <div className="mt-1 text-xs text-gray-500">
                Verbindingen onder deze absolute waarde worden niet getoond
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="col-span-1">
            <h3 className="font-medium text-gray-700 mb-2">Legenda</h3>
            <div className="space-y-2">
              {Object.entries(CATEGORY_COLORS).filter(([key]) => key !== 'default').map(([category, color]) => (
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

        {/* Sankey Diagram Section */}
        <div className="relative border-t border-gray-200 pt-6 mb-6">
          {/* Section Label */}
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
                  enableLinkGradient={true}
                  labelPosition="outside"
                  labelOrientation="horizontal"
                  labelPadding={16}
                  labelTextColor={{ from: 'color', modifiers: [['darker', 1]] }}
                  // Use custom label formatter with tspan elements for multi-line display
                  label={node => {
                    if (!node.labelLines || node.labelLines.length === 1) {
                      return node.id;
                    }
                    // Cast the JSX element to string to satisfy the type checker
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
      
      {/* Dialog to show details */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Details</DialogTitle>
          </DialogHeader>
          
          {selectedLink && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold text-xs uppercase text-gray-500">Dreiging</div>
                  <div className="mt-1">{selectedLink.Dreiging}</div>
                </div>
                <div>
                  <div className="font-semibold text-xs uppercase text-gray-500">Aangrijpingsgebied</div>
                  <div className="mt-1">{selectedLink.Aangrijpingsgebied}</div>
                </div>
              </div>
              
              <div>
                <div className="font-semibold text-xs uppercase text-gray-500">Aantal</div>
                <div className="mt-1">{selectedLink.Aantal}</div>
              </div>
              
              {displayMode === 'relative' && (
                <div>
                  <div className="font-semibold text-xs uppercase text-gray-500">Percentage</div>
                  <div className="mt-1">
                    {(() => {
                      const totalForDreiging = rawData
                        .filter(item => item.Dreiging === selectedLink.Dreiging)
                        .reduce((sum, item) => sum + item.Aantal, 0);
                      
                      return `${((selectedLink.Aantal / totalForDreiging) * 100).toFixed(1)}%`;
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Aangrijpspunten;