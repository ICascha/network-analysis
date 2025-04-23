import React, { useState } from 'react';
import { useThreats, useScenarioGenerator, Citation, CitationSegment, AlternativePath } from './scenarioApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Theme color
const themeColor = 'rgb(0,153,168)';

// Citation component to show the citation details
const CitationDetail: React.FC<{ citation: Citation; id: string }> = ({ citation, id }) => {
  return (
    <div id={id} className="bg-gray-50 border border-gray-200 rounded-md p-4 my-3 scroll-mt-16">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-700">Citaat {citation.citation_id}</h4>
        <Badge style={{ backgroundColor: themeColor }} className="text-white">
          {citation.source}
        </Badge>
      </div>
      <div className="mb-2">
        <span className="text-sm font-medium text-gray-600">Oorzaak:</span> {citation.oorzaak}
      </div>
      <div className="mb-3">
        <span className="text-sm font-medium text-gray-600">Gevolg:</span> {citation.gevolg}
      </div>
      <div className="bg-white border-l-4 pl-3 py-2 italic text-gray-700" style={{ borderLeftColor: themeColor }}>
        "{citation.citaat}"
      </div>
      {citation.filename && (
        <div className="mt-2 text-sm text-gray-500">
          Bron: {citation.filename}
        </div>
      )}
    </div>
  );
};

// ScenarioPath component to visualize the path
const ScenarioPath: React.FC<{ path: string[]; pathCounts: number[] }> = ({ path, pathCounts }) => {
  return (
    <div className="my-6">
      <h3 className="text-lg font-semibold mb-4" style={{ color: themeColor }}>Dreigingspad</h3>
      <div className="flex flex-wrap items-center justify-center">
        {path.map((node, index) => (
          <React.Fragment key={`node-${index}`}>
            {index > 0 && (
              <div className="flex flex-col items-center mx-2">
                <div className="w-12 h-1 bg-gray-300"></div>
                <div className="text-xs text-gray-500 mt-1">{pathCounts[index-1]} citaten</div>
              </div>
            )}
            <div 
              className="px-4 py-2 m-2 rounded-lg text-center min-w-32 shadow-sm"
              style={{ 
                backgroundColor: index === 0 || index === path.length - 1 
                  ? themeColor 
                  : 'rgba(0,153,168,0.1)',
                color: index === 0 || index === path.length - 1 ? 'white' : 'inherit'
              }}
            >
              {node}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// AlternativePathsList component to show alternative paths
const AlternativePathsList: React.FC<{ 
  alternativePaths: AlternativePath[]; 
  onSelectPath: (source: string, target: string) => void;
  source: string;
}> = ({ alternativePaths, onSelectPath, source }) => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3" style={{ color: themeColor }}>
        Alternatieve paden
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alternativePaths.map((path, index) => (
          <Card key={`alt-path-${index}`} className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-gray-800">{path.target}</h4>
                <Badge>{path.path_length} stappen</Badge>
              </div>
              <div className="flex flex-wrap items-center mt-3 text-sm text-gray-600">
                {path.path.map((node, nodeIndex) => (
                  <React.Fragment key={`path-${index}-node-${nodeIndex}`}>
                    {nodeIndex > 0 && <span className="mx-1">→</span>}
                    <span className="font-medium">{node}</span>
                  </React.Fragment>
                ))}
              </div>
              <Button 
                className="mt-3 w-full" 
                variant="outline"
                onClick={() => onSelectPath(source, path.target)}
              >
                Genereer dit scenario
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Main component
const ScenarioGenerator: React.FC = () => {
  const { threats, isLoading: threatsLoading, error: threatsError } = useThreats();
  const { 
    scenario, 
    alternativePaths, 
    isLoading: scenarioLoading, 
    error: scenarioError, 
    message,
    generateScenario
  } = useScenarioGenerator();
  
  const [source, setSource] = useState<string>('');
  const [target, setTarget] = useState<string>('');
  const [pruneWeakEdges, setPruneWeakEdges] = useState<boolean>(true);

  const handleGenerateScenario = () => {
    if (source && target) {
      generateScenario(source, target, pruneWeakEdges);
    }
  };

  const handleSelectAlternativePath = (source: string, target: string) => {
    setTarget(target);
    generateScenario(source, target, pruneWeakEdges);
  };

  // Modified function to render the scenario content with inline superscript citations
  const renderScenarioContent = () => {
    if (!scenario) return null;
    
    return (
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4" style={{ color: themeColor }}>
          {scenario.title}
        </h2>
        
        <ScenarioPath path={scenario.path} pathCounts={scenario.path_citation_counts} />
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3" style={{ color: themeColor }}>Samenvatting</h3>
          <div className="bg-gray-50 p-4 rounded-md border-l-4 mb-6" style={{ borderLeftColor: themeColor }}>
            <p className="text-gray-700">{scenario.summary}</p>
          </div>
          
          <h3 className="text-lg font-semibold mb-3" style={{ color: themeColor }}>Scenario</h3>
          <div className="prose max-w-none">
            {/* Modified section to make citations inline superscripts */}
            <p>
              {scenario.segments.map((segment, index) => {
                if (segment.type === "text") {
                  return <span key={`segment-${index}`}>{segment.content}</span>;
                } else {
                  return (
                    <sup key={`segment-${index}`}>
                      <span 
                        className="cursor-pointer text-xs font-medium hover:underline"
                        style={{ color: themeColor }}
                        title={`Citaat ${segment.id}: ${segment.citation.citaat.substring(0, 100)}...`}
                        onClick={() => {
                          const element = document.getElementById(`citation-${segment.id}`);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                      >
                        [{segment.id}]
                      </span>
                    </sup>
                  );
                }
              })}
            </p>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3" style={{ color: themeColor }}>Bronnen en citaten</h3>
          <div className="grid grid-cols-1 gap-4">
            {scenario.segments
              .filter((segment): segment is CitationSegment => segment.type === "citation")
              .map(segment => (
                <CitationDetail 
                  key={`citation-${segment.id}`}
                  id={`citation-${segment.id}`}
                  citation={segment.citation} 
                />
              ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white shadow-md px-8 py-6 mb-8 rounded-lg">
        <h1 className="text-2xl font-bold mb-4" style={{ color: themeColor }}>
          Dreigingsscenario Generator
        </h1>
        <div className="prose max-w-none mb-6">
          <p className="text-gray-600 leading-relaxed">
            Genereer een scenario dat laat zien hoe een bepaalde dreiging kan leiden tot een andere dreiging,
            gebaseerd op causale relaties die in documenten zijn gedocumenteerd. Selecteer een oorzaak en een
            gevolg om een gedetailleerd scenario te genereren met alle tussenliggende stappen.
          </p>
        </div>
        
        {threatsError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Fout</AlertTitle>
            <AlertDescription>
              Er is een fout opgetreden bij het laden van de dreigingen: {threatsError}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="source-select" className="block mb-2">Oorzaak (bron)</Label>
            <Select
              value={source}
              onValueChange={setSource}
              disabled={threatsLoading}
            >
              <SelectTrigger id="source-select" className="w-full">
                <SelectValue placeholder="Selecteer een dreiging als oorzaak" />
              </SelectTrigger>
              <SelectContent>
                {threats.map((threat) => (
                  <SelectItem key={`source-${threat}`} value={threat}>
                    {threat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="target-select" className="block mb-2">Gevolg (doel)</Label>
            <Select
              value={target}
              onValueChange={setTarget}
              disabled={threatsLoading}
            >
              <SelectTrigger id="target-select" className="w-full">
                <SelectValue placeholder="Selecteer een dreiging als gevolg" />
              </SelectTrigger>
              <SelectContent>
                {threats.map((threat) => (
                  <SelectItem key={`target-${threat}`} value={threat}>
                    {threat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mt-4">
          <Switch
            id="prune-edges"
            checked={pruneWeakEdges}
            onCheckedChange={setPruneWeakEdges}
          />
          <Label htmlFor="prune-edges">Alleen sterke verbindingen gebruiken (&gt;3 citaten)</Label>
        </div>
        
        <div className="mt-6">
          <Button 
            onClick={handleGenerateScenario}
            disabled={!source || !target || scenarioLoading || threatsLoading}
            style={{ backgroundColor: themeColor }}
            className="w-full"
          >
            {scenarioLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scenario genereren...
              </>
            ) : (
              'Genereer Scenario'
            )}
          </Button>
        </div>
        
        {scenarioError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Fout</AlertTitle>
            <AlertDescription>
              {scenarioError}
            </AlertDescription>
          </Alert>
        )}
        
        {message && !scenario && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Bericht</AlertTitle>
            <AlertDescription>
              {message}
            </AlertDescription>
          </Alert>
        )}
        
        {alternativePaths && alternativePaths.length > 0 && (
          <AlternativePathsList 
            alternativePaths={alternativePaths} 
            onSelectPath={handleSelectAlternativePath} 
            source={source}
          />
        )}
      </div>
      
      {renderScenarioContent()}
    </div>
  );
};

export default ScenarioGenerator;