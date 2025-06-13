// src/components/narrative/NarrativeLayout.tsx

import { useState, useEffect, useMemo, useRef } from 'react';
import { MainContent } from '../visualization/MainContent';
import { Info, ArrowUp, ChevronsDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ModelSettings } from '@/types/settings';
import ModelExplanation from './ModelExplanation';
import TransformerAttentionVisualizer from './TransformerAttentionVisualizer';
import ClimateImpactGraph from './ClimateImpactGraph';
import { RelationGraphCanvas } from '../visualization/relationGraph/RelationGraphCanvas';

// --- ADDED: Imports moved up from MainContent ---
import type { Node, Edge } from '../visualization/networkGraph/networkService';
import { getNetworkWithCentralityMetrics } from '../visualization/networkGraph/networkService';
import { DEFAULT_THREAT_IMPACT_WEIGHTS, ThreatImpactWeights } from '../visualization/networkGraph/threatImpactService';
import { EdgeDisplayMode } from '../visualization/EdgeDisplayToggle';

export type CentralityMetric = 
  'eigen_centrality' | 
  'eigen_centrality_in' | 
  'eigen_centrality_out' | 
  'cross_category_eigen_centrality' | 
  'cross_category_eigen_centrality_in' | 
  'cross_category_eigen_centrality_out';


const initialSettings: ModelSettings = {
  productivity: 1.0,
  steering: 'with',
  workHours: 'noone',
  jobPriority: 'standard',
  nonSourceJobs: 'standard'
};

const brandColorRgb = "0, 153, 168";

export const NarrativeLayout = () => {
  const [settings] = useState<ModelSettings>(initialSettings);
  const introRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const basePath = import.meta.env.BASE_URL;

  // --- ADDED: State lifted up from MainContent ---
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [edgeDisplayMode, setEdgeDisplayMode] = useState<EdgeDisplayMode>('all');
  
  // State for fetching logic, can be controlled from here if needed
  const [rawCountThreshold] = useState<number>(6);
  const [threatImpactWeights] = useState<ThreatImpactWeights>(DEFAULT_THREAT_IMPACT_WEIGHTS);

  // --- ADDED: Data fetching logic moved up from MainContent ---
  useEffect(() => {
    const loadNetworkData = async () => {
      try {
        setLoading(true);
        const data = await getNetworkWithCentralityMetrics(2, rawCountThreshold, threatImpactWeights);
        
        const validNodes = Array.isArray(data?.nodes) ? data.nodes : [];
        const validEdges = Array.isArray(data?.edges) ? data.edges : [];
        
        // This initial filtering can stay here
        const filteredInitialEdges = validEdges.filter(edge => edge.weight >= 1);
        const nodeIdsWithValidEdges = new Set();
        filteredInitialEdges.forEach(edge => {
          nodeIdsWithValidEdges.add(edge.source);
          nodeIdsWithValidEdges.add(edge.target);
        });
        const filteredInitialNodes = validNodes.filter(node => nodeIdsWithValidEdges.has(node.id));
        
        setNodes(filteredInitialNodes);
        setEdges(filteredInitialEdges);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load network data');
        setLoading(false);
        setNodes([]);
        setEdges([]);
      }
    };
    loadNetworkData();
  }, [rawCountThreshold, threatImpactWeights]);

  // --- ADDED: filteredEdges logic moved up from MainContent ---
  const filteredEdges = useMemo(() => {
    let edgesToUse = edges;
    if (edgeDisplayMode === 'all') {
      return edgesToUse;
    } else if (edgeDisplayMode === 'incoming' && selectedNodeId) {
      return edgesToUse.filter(edge => edge.target === selectedNodeId);
    } else if (edgeDisplayMode === 'outgoing' && selectedNodeId) {
      return edgesToUse.filter(edge => edge.source === selectedNodeId);
    } else if (selectedNodeId) {
      return edgesToUse.filter(edge => edge.source === selectedNodeId || edge.target === selectedNodeId);
    }
    return edgesToUse;
  }, [edges, edgeDisplayMode, selectedNodeId]);

  // --- ADDED: filteredNodes logic moved up from MainContent ---
  const filteredNodes = useMemo(() => {
    const nodeIdsWithEdges = new Set();
    filteredEdges.forEach(edge => {
      nodeIdsWithEdges.add(edge.source);
      nodeIdsWithEdges.add(edge.target);
    });
    return nodes.filter(node => nodeIdsWithEdges.has(node.id));
  }, [nodes, filteredEdges]);

  const handleScrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="w-full h-screen overflow-y-scroll scroll-snap-type-y-mandatory">
      {/* Floating Dialogs - remain for informational purposes */}
      {/* ... (Dialogs code remains unchanged) ... */}
      <div className="fixed top-8 left-8 z-50">
        <Dialog>
          <DialogTrigger asChild>
            <div className="relative w-16 h-16 rounded-full bg-[rgb(0,153,168)] flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer">
              <img
                src={`${basePath}denkwerk_logo.svg`}
                alt="Denkwerk Logo"
                className="h-8 w-auto"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm p-0">
            <DialogHeader className="p-6 pb-4">
              <DialogTitle className="text-xl">Over Denkwerk</DialogTitle>
            </DialogHeader>
            <div className="px-6 pb-6">
              <p className="text-gray-700 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="fixed top-8 right-8 z-50">
        <Dialog>
          <DialogTrigger asChild>
            <div className="relative w-16 h-16 rounded-full bg-[rgb(0,153,168)] flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer">
              <Info className="h-8 w-8 text-white" />
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-xl">Toelichting model</DialogTitle>
            </DialogHeader>
            <ModelExplanation/>
          </DialogContent>
        </Dialog>
      </div>

      {/* Section 1: Introduction */}
      <section
        ref={introRef}
        className="relative w-full h-screen bg-slate-50 scroll-snap-align-start overflow-hidden"
      >
        {/* ... (Introductory content remains unchanged) ... */}
         <div className="relative w-full h-[200px] md:h-[250px] flex-shrink-0">
          <img
            src={`${basePath}nl_from_above.jpg`}
            alt="Netherlands by night"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center text-white text-center px-4">
            <h1 className="text-5xl font-bold mb-4">
              Knooppuntenanalyse Dreigingen
            </h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto" style={{ height: 'calc(100vh - 250px)' }}>
          <div className="p-8 text-center">
            <div className="max-w-4xl mx-auto space-y-8">
              <p className="text-lg text-gray-600 leading-relaxed">
                Deze interactieve visualisatie brengt de complexe relaties binnen het Nederlandse dreigingslandschap in kaart. Met behulp van AI taalmodellen (LLMs) hebben we duizenden beleidsdocumenten en onderzoeksrapporten geanalyseerd om de verborgen verbanden tussen diverse dreigingen bloot te leggen. Een taalmodel kan, zoals het onderstaande voorbeeld illustreert, de contextuele relaties identificeren die experts in tekst leggen:
              </p>
              
              <TransformerAttentionVisualizer />
              <p className="text-sm text-gray-500 italic">
                Een LLM kan contextueel relaties tussen concepten in tekst herkennen. Hierdoor zijn LLMs een geschikte tool om verbanden te ontdekken.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Uit deze analyse zijn duizenden citaten verzameld die wijzen op causale verbanden. Deze verbanden vormen een netwerk waarin elke dreiging een 'knooppunt' is. Om de betrouwbaarheid te waarborgen, negeren we verbanden die slechts sporadisch in de data voorkomen. Dit netwerk stelt ons in staat te identificeren welke dreigingen als <strong style={{ color: 'rgb(0, 153, 168)' }}>centrale knooppunten</strong> functioneren. Door ons te richten op dreigingen die kettingreacties kunnen veroorzaken, kunnen we effectiever prioriteiten stellen in ons nationaal veiligheidsbeleid.
              </p>
              
              <ClimateImpactGraph />
              
              <p className="text-sm text-gray-500 italic">
                Een voorbeeld van een causaal verband: hitte en droogte als centrale dreiging die leidt tot andere dreigingen.
              </p>

              <p className="text-lg text-gray-600 leading-relaxed">
                De dreigingen in de visualisatie zijn verdeeld over vijf thema's, met een focus op de verbanden tussen deze thema's. De dikte van een lijn geeft de geschatte impact van een verband aan. De grootte van het knooppunt representeert de invloed van een dreiging op andere thema's.
              </p>

              {/* MODIFIED: Pass filtered data to RelationGraphCanvas */}
              <RelationGraphCanvas nodes={filteredNodes} edges={filteredEdges} />

              <p className="text-lg text-gray-600 leading-relaxed">De visualisatie is interactief: <strong style={{ color: 'rgb(0, 153, 168)' }}>klik op een verbinding om de onderliggende citaten en brondocumenten te raadplegen.</strong> Voor een diepgaande blik en uitleg verwijzen we u naar ons <a href='https://google.com' target='_blank' rel='noopener noreferrer' style={{ color: 'rgb(0, 153, 168)', fontWeight: 'bold' }} className='underline'>rapport</a> en de bijbehorende <a href='https://google.com' target='_blank' rel='noopener noreferrer' style={{ color: 'rgb(0, 153, 168)', fontWeight: 'bold' }} className='underline'>appendix</a>.</p>
              
              <div className="h-24"></div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={() => handleScrollTo(mainContentRef)}
            className="flex flex-col items-center text-gray-500 hover:text-[rgb(0,153,168)] transition-colors animate-subtle-glow-pulse bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg"
            aria-label="Scroll to main content"
          >
            <span className="mb-1 text-sm font-medium text-[rgb(0,153,168)]">Verken de data</span>
            <ChevronsDown className="w-8 h-8" />
          </button>
        </div>
      </section>

      {/* Section 2: Main Content (The Interactive Graph) */}
      <section
        ref={mainContentRef}
        className="relative w-full h-screen bg-gray-900 scroll-snap-align-start"
      >
        {/* MODIFIED: Pass all necessary state and setters down to MainContent */}
        <MainContent
          settings={settings}
          nodes={nodes}
          loading={loading}
          error={error}
          filteredNodes={filteredNodes}
          filteredEdges={filteredEdges}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          edgeDisplayMode={edgeDisplayMode}
          onSetEdgeDisplayMode={setEdgeDisplayMode}
        />

        {/* Button to return to the top */}
        <div className="absolute top-6 right-6 z-30">
          <Button
            onClick={() => handleScrollTo(introRef)}
            variant="secondary"
            className="bg-white/80 backdrop-blur-sm hover:bg-white text-gray-800 rounded-full shadow-lg h-12 w-12 p-0"
          >
            <ArrowUp className="h-6 w-6" />
            <span className="sr-only">Return to Top</span>
          </Button>
        </div>
      </section>
      
      {/* ... (CSS remains unchanged) ... */}
       <style>{`
        .scroll-snap-type-y-mandatory {
          scroll-snap-type: y mandatory;
        }
        .scroll-snap-align-start {
          scroll-snap-align: start;
        }
        @keyframes subtle-glow-pulse {
          0%, 100% {
            opacity: 0.85;
            filter: drop-shadow(0 0 1px rgba(${brandColorRgb}, 0.1));
          }
          50% {
            opacity: 1;
            filter: drop-shadow(0 0 6px rgba(${brandColorRgb}, 0.4));
          }
        }
        .animate-subtle-glow-pulse {
          animation: subtle-glow-pulse 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default NarrativeLayout;