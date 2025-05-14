import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveSankey } from '@nivo/sankey';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

// Define category type for type safety
type CategoryKey = 'democratische rechtsorde, overheid en instituties' | 'kritieke infrastructuur en functies' | 'economie' | 'defensie' | string;

// Color palette
const CATEGORY_COLORS: Record<CategoryKey, string> = {
  'democratische rechtsorde, overheid en instituties': '#0099A8',
  'kritieke infrastructuur en functies': '#33ADBA',
  'economie': '#66C2CB',
  'defensie': '#99D6DC',
};

// Node colors will be based on their category
const getNodeColor = (node: { category?: string }): string => {
  const category = node.category || '';
  return CATEGORY_COLORS[category as CategoryKey] || '#CCEAED';
};

interface SankeyLink {
  source: string;
  target: string;
  raw_count: number;
  source_category: string;
  target_category: string;
}

interface SankeyNode {
  id: string;
  nodeColor: string;
  category: string;
}

interface CategoryLink {
  source: string;
  target: string;
  combinationCount: number;
  sourceCategory: string;
  targetCategory: string;
  rawData: SankeyLink[];
  value: number; // Changed from optional to required
}

interface FormattedSankeyData {
  nodes: SankeyNode[];
  links: CategoryLink[];
}

const Aangrijpspunten: React.FC = () => {
  const [sankeyData, setSankeyData] = useState<SankeyLink[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [thresholdValue, setThresholdValue] = useState<number>(6);
  const [hideIdentityLinks, setHideIdentityLinks] = useState<boolean>(false);
  const [selectedLink, setSelectedLink] = useState<{ source: string; target: string } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [underlyingPairs, setUnderlyingPairs] = useState<SankeyLink[]>([]);
  
  // Theme color matching the example
  const themeColor = 'rgb(0,153,168)';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get the base URL for GitHub Pages in Vite
        const basePath = import.meta.env.BASE_URL;
        const response = await fetch(`${basePath}edges_mapped.json`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const data = await response.json();
        setSankeyData(data);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);


  // Filter data based on the threshold, identity mapping preference, and filtering out 'geen passend'
  const filteredData = useMemo(() => {
    if (!sankeyData.length) return [];
    
    // Filter items based on raw_count threshold
    let filtered = sankeyData.filter(item => item.raw_count >= thresholdValue);
    
    // If hideIdentityLinks is true, filter out links where source_category equals target_category
    if (hideIdentityLinks) {
      filtered = filtered.filter(item => item.source_category !== item.target_category);
    }
    
    // Filter out items where source_category or target_category starts with 'geen passend'
    filtered = filtered.filter(item => 
      !item.source_category.startsWith('geen passend') && 
      !item.target_category.startsWith('geen passend')
    );
    
    return filtered;
  }, [sankeyData, thresholdValue, hideIdentityLinks]);

  // Format data for the Sankey diagram - aggregate by category and count combinations
  const formattedData = useMemo((): FormattedSankeyData => {
    if (!filteredData.length) return { nodes: [], links: [] };

    const nodesMap = new Map<string, SankeyNode>();
    const nodes: SankeyNode[] = [];
    
    // Create a map to track unique combinations between categories
    const categoryLinksMap = new Map<string, CategoryLink>();
    const uniqueCombinationsMap = new Map<string, Set<string>>();
    
    // Add all source and target categories as nodes
    filteredData.forEach(item => {
      const sourceId = item.source_category;
      // Add space to target categories to make IDs different
      const targetId = `${item.target_category} `;
      
      if (!nodesMap.has(sourceId)) {
        nodesMap.set(sourceId, {
          id: sourceId,
          nodeColor: getNodeColor({ category: sourceId }),
          category: sourceId
        });
      }
      
      if (!nodesMap.has(targetId)) {
        nodesMap.set(targetId, {
          id: targetId,
          nodeColor: getNodeColor({ category: item.target_category }),
          category: item.target_category
        });
      }
      
      // Create a unique key for this category pair
      const linkKey = `${sourceId}=>${targetId}`;
      
      // For each source-target pair, create a unique key
      const combinationKey = `${item.source}=>${item.target}`;
      
      // Track unique combinations within categories
      if (!uniqueCombinationsMap.has(linkKey)) {
        uniqueCombinationsMap.set(linkKey, new Set());
      }
      uniqueCombinationsMap.get(linkKey)?.add(combinationKey);
      
      // Store original data for reference
      if (!categoryLinksMap.has(linkKey)) {
        categoryLinksMap.set(linkKey, {
          source: sourceId,
          target: targetId,
          combinationCount: 0,
          sourceCategory: sourceId,
          targetCategory: targetId.trim(),
          rawData: [],
          value: 0 // Initialize with 0, will be updated later
        });
      }
      
      const linkData = categoryLinksMap.get(linkKey);
      if (linkData) {
        linkData.rawData.push(item);
      }
    });
    
    // Now update the count of unique combinations
    uniqueCombinationsMap.forEach((combinations, linkKey) => {
      const linkData = categoryLinksMap.get(linkKey);
      if (linkData) {
        linkData.combinationCount = combinations.size;
        linkData.value = combinations.size; // Set value equal to combinationCount
      }
    });
    
    // Convert link map to array
    const links = Array.from(categoryLinksMap.values());
    
    // Convert nodes map to array
    nodesMap.forEach(node => {
      nodes.push(node);
    });

    return { nodes, links };
  }, [filteredData]);

  // Function to handle link click and show detailed pairs
  const handleLinkClick = (data: unknown) => {
    // Safety check for the type of data
    if (!data || typeof data !== 'object') return;
    
    // Try to extract relevant properties
    const link = data as any;
    
    if (!link.rawData) {
      console.log("Click data does not contain rawData:", link);
      return;
    }
    
    setUnderlyingPairs(link.rawData);
    setSelectedLink({
      source: link.sourceCategory || '',
      target: link.targetCategory || ''
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="flex items-center justify-center p-10">
            <div className="text-center">
              <p className="text-gray-500">Loading data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="flex items-center justify-center p-10">
            <div className="text-center">
              <p className="text-red-500">Error loading data: {error}</p>
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
            Deze visualisatie toont de verbanden tussen verschillende categorieën van aangrijpingspunten in dreigingen.
            De dikte van elke verbinding geeft het aantal unieke combinaties weer tussen de categorieën,
            gefilterd op een minimale drempelwaarde. Klik op een verbinding om de onderliggende bronnen en doelen te zien.
          </p>
        </div>

        {/* Sankey Diagram Section */}
        <div className="relative pt-8 border-t border-gray-200 mb-6">
          {/* Section Label */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white px-4">
            <h2 className="text-lg font-semibold" style={{ color: themeColor }}>Categorieën aangrijpingspunten</h2>
          </div>
        
          <div className="flex flex-wrap items-end space-x-4 mb-6">
            {/* Toggle for hiding identity links */}
            <div className="flex items-center space-x-2">
              <Switch
                id="hide-identity-links"
                checked={hideIdentityLinks}
                onCheckedChange={setHideIdentityLinks}
              />
              <Label htmlFor="hide-identity-links" className="text-sm font-medium text-gray-500">
                Verberg identiteitsverbindingen
              </Label>
            </div>
            
            {/* Threshold slider */}
            <div className="flex-1 ml-6 max-w-xs">
              <Label htmlFor="threshold-slider" className="text-sm font-medium text-gray-500 block mb-2">
                Minimale drempelwaarde: {thresholdValue}
              </Label>
              <Slider 
                id="threshold-slider"
                min={0}
                max={20}
                step={1}
                value={[thresholdValue]}
                onValueChange={(value) => setThresholdValue(value[0])}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-md p-4 bg-white">
            <div className="h-[500px]">
              {formattedData.nodes.length > 0 ? (
                <ResponsiveSankey
                  data={formattedData as any}
                  margin={{ top: 40, right: 300, bottom: 40, left: 300 }}
                  align="justify"
                  colors={(node: Omit<SankeyNode, "color" | "label">) => node.nodeColor || '#0099A8'}
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
                  animate={true}
                  motionConfig="gentle"
                  onClick={(data) => {
                    console.log("Click event:", data);
                    if (data) {
                      handleLinkClick(data);
                    }
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">
                    Geen gegevens beschikbaar met de huidige drempelwaarde of filterinstellingen. 
                    Probeer de drempelwaarde te verlagen of pas de filters aan.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>
              De dikte van elke verbinding toont het aantal unieke combinaties tussen categorieën.
              <br />
              Alleen combinaties met een raw_count waarde van {thresholdValue} of hoger worden getoond.
              {hideIdentityLinks && " Identiteitsverbindingen (waar bron en doel dezelfde categorie hebben) worden verborgen."}
              <br />
              Categorieën die beginnen met 'geen passend' worden automatisch uitgefilterd.
              <br />
              Klik op een verbinding om de onderliggende bron-doel paren te zien.
            </p>
          </div>
        </div>
      </div>
      
      {/* Dialog to show underlying pairs */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              Onderliggende combinaties tussen {selectedLink?.source} en {selectedLink?.target}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-96 rounded-md border p-4">
            <div className="space-y-2">
              {underlyingPairs.length > 0 ? (
                underlyingPairs.map((pair, index) => (
                  <div 
                    key={index} 
                    className="p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="font-semibold text-xs uppercase text-gray-500">Bron</div>
                        <div className="mt-1">{pair.source}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-xs uppercase text-gray-500">Doel</div>
                        <div className="mt-1">{pair.target}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Raw count: {pair.raw_count}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Geen gedetailleerde gegevens beschikbaar voor deze verbinding.
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="text-sm text-gray-500 mt-2">
            Totaal aantal combinaties: {underlyingPairs.length}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Aangrijpspunten;