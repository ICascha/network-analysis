import { useState, useEffect } from 'react';
import { MainContent } from '../visualization/MainContent';
import TimeSeriesAnalysis from "../visualization/TimeSeriesAnalysis";
import ScenarioGenerator from "../visualization/ScenarioGenerator";
import { Info, Home, Network, Clock, Newspaper, Calendar, GitBranch, Target } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ModelSettings } from '@/types/settings';
import ModelExplanation from './ModelExplanation';
import SourceAnalysis from '../visualization/SourceAnalysis';
import ChronologicalAnalysis from '../visualization/ChronologicalAnalysis';
import Aangrijpspunten from '../visualization/Aangrijpspunten';

// Create a temporary placeholder until the real component is available
const CitationsBackground = () => <div className="absolute inset-0 z-0"></div>;

const initialSettings: ModelSettings = {
  productivity: 1.0,
  steering: 'with',
  workHours: 'noone',
  jobPriority: 'standard',
  nonSourceJobs: 'standard'
};

// Primary brand color
const brandColor = "rgb(0,153,168)";

interface TypewriterTextProps {
  preText: string;
  typewriterText: string;
  speed?: number;
  onComplete?: () => void;
}

const TypewriterText = ({ preText, typewriterText, speed = 40, onComplete }: TypewriterTextProps) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    if (displayText.length < typewriterText.length) {
      const timer = setTimeout(() => {
        setDisplayText(typewriterText.slice(0, displayText.length + 1));
      }, speed);
      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
      onComplete && onComplete();
    }
  }, [displayText, typewriterText, speed, onComplete]);
  
  return (
    <p className="text-3xl text-gray-600 max-w-3xl mx-auto">
      {preText}<br />
      {displayText}
      <span
        className={`ml-1 ${isComplete ? 'hidden' : 'inline-block'}`}
        style={{
          animation: 'blink 0.7s infinite',
          backgroundColor: brandColor
        }}
      >
        &nbsp;
      </span>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </p>
  );
};

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

const LandingPage = ({ onNavigate }: LandingPageProps) => {
  const [isTypewriterComplete, setIsTypewriterComplete] = useState(false);
  
  const handleTypewriterComplete = () => {
    setIsTypewriterComplete(true);
  };
  
  return (
    <div className="relative z-10 py-16 px-8">
      {/* Added a container div with a more subtle backdrop blur effect */}
      <div className="max-w-6xl mx-auto bg-white/25 backdrop-blur-sm rounded-xl p-8">
        <div className="text-center mb-16">
          <TypewriterText 
            preText="Een analyse van duizenden rapporten door middel van "
            typewriterText="taalmodellen."
            onComplete={handleTypewriterComplete}
          />
        </div>
        
        {isTypewriterComplete && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8 animate-fade-in">
            <Card className="bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Network className="h-5 w-5" style={{ color: brandColor }} />
                  Complexiteitsanalyse
                </CardTitle>
                <CardDescription className="text-gray-600">Ontdek de verwevendheid van dreigingen
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
              <p className="text-gray-600 mb-6">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi posuere, arcu vel cursus ultrices, risus lacus porttitor lacus.</p>
                <Button 
                  className="w-full text-white"
                  style={{ backgroundColor: brandColor, borderColor: brandColor }}
                  onClick={() => onNavigate('complexiteit')}
                >
                  Bekijken
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Clock className="h-5 w-5" style={{ color: brandColor }} />
                  Tijkdreeksanalyse
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Ontdek hoe dreigingen zich ontwikkelen
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
              <p className="text-gray-600 mb-6">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi posuere, arcu vel cursus ultrices, risus lacus porttitor lacus.</p>
                <Button 
                  className="w-full text-white"
                  style={{ backgroundColor: brandColor, borderColor: brandColor }}
                  onClick={() => onNavigate('tijkdreeks')}
                >
                  Bekijken
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Calendar className="h-5 w-5" style={{ color: brandColor }} />
                  Chronologische analyse
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Volg de ontwikkeling van gebeurtenissen
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-6">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi posuere, arcu vel cursus ultrices, risus lacus porttitor lacus.</p>
                <Button 
                  className="w-full text-white"
                  style={{ backgroundColor: brandColor, borderColor: brandColor }}
                  onClick={() => onNavigate('chronologisch')}
                >
                  Bekijken
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Newspaper className="h-5 w-5" style={{ color: brandColor }} />
                  Bronanalyse
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Ontdek onderliggende details
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-6">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi posuere, arcu vel cursus ultrices, risus lacus porttitor lacus.</p>
                <Button 
                  className="w-full text-white"
                  style={{ backgroundColor: brandColor, borderColor: brandColor }}
                  onClick={() => onNavigate('topic')}
                >
                  Bekijken
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <GitBranch className="h-5 w-5" style={{ color: brandColor }} />
                  Scenario Generator
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Verken causale relaties tussen dreigingen
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-6">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi posuere, arcu vel cursus ultrices, risus lacus porttitor lacus.</p>
                <Button 
                  className="w-full text-white"
                  style={{ backgroundColor: brandColor, borderColor: brandColor }}
                  onClick={() => onNavigate('scenario')}
                >
                  Bekijken
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Target className="h-5 w-5" style={{ color: brandColor }} />
                  Aangrijpingsgebieden
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Identificeer waar ingegrepen kan worden
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-6">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi posuere, arcu vel cursus ultrices, risus lacus porttitor lacus.</p>
                <Button 
                  className="w-full text-white"
                  style={{ backgroundColor: brandColor, borderColor: brandColor }}
                  onClick={() => onNavigate('aangrijpspunten')}
                >
                  Bekijken
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* Add custom animation for fade-in */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

// The rest of the NarrativeLayout component remains exactly the same as in the original file
export const NarrativeLayout = () => {
  const [settings] = useState<ModelSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState("landing");
  
  const basePath = import.meta.env.BASE_URL;

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Floating Circles with Dialogs */}
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
          <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-xl">Over Denkwerk</DialogTitle>
            </DialogHeader>
            <div className="p-6">
              <p className="text-gray-700 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
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

      <div className="w-full">
        {/* Hero Banner */}
        <div className="relative w-full h-[300px]">
          <img
            src={`${basePath}nl_from_above.jpg`}
            alt="Netherlands by night"
            className="w-full h-full object-cover"
          />
          {/* Photo credit */}
          <div className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
            Foto: ©ESA/NASA - André Kuipers
          </div>
          <div className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center text-white text-center px-4">
            <h1 className="text-5xl font-bold mb-8">
              Dreigingsbeeld Nederland
            </h1>
            <p className="text-xl max-w-3xl">
              WORK IN PROGRESS
            </p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="bg-white shadow-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto">
            <nav className="flex flex-wrap">
              <button 
                onClick={() => handleNavigate('landing')}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-gray-700 font-medium border-b-2 transition-colors",
                  activeTab === 'landing' 
                    ? "border-[rgb(0,153,168)] text-[rgb(0,153,168)]" 
                    : "border-transparent hover:text-[rgb(0,153,168)] hover:bg-gray-50"
                )}
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </button>
              
              <button 
                onClick={() => handleNavigate('complexiteit')}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-gray-700 font-medium border-b-2 transition-colors",
                  activeTab === 'complexiteit' 
                    ? "border-[rgb(0,153,168)] text-[rgb(0,153,168)]" 
                    : "border-transparent hover:text-[rgb(0,153,168)] hover:bg-gray-50"
                )}
              >
                <Network className="h-5 w-5" />
                <span>Complexiteitsanalyse</span>
              </button>
              
              <button 
                onClick={() => handleNavigate('tijkdreeks')}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-gray-700 font-medium border-b-2 transition-colors",
                  activeTab === 'tijkdreeks' 
                    ? "border-[rgb(0,153,168)] text-[rgb(0,153,168)]" 
                    : "border-transparent hover:text-[rgb(0,153,168)] hover:bg-gray-50"
                )}
              >
                <Clock className="h-5 w-5" />
                <span>Tijkdreeksanalyse</span>
              </button>
              
              <button 
                onClick={() => handleNavigate('chronologisch')}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-gray-700 font-medium border-b-2 transition-colors",
                  activeTab === 'chronologisch' 
                    ? "border-[rgb(0,153,168)] text-[rgb(0,153,168)]" 
                    : "border-transparent hover:text-[rgb(0,153,168)] hover:bg-gray-50"
                )}
              >
                <Calendar className="h-5 w-5" />
                <span>Chronologische analyse</span>
              </button>
              
              <button 
                onClick={() => handleNavigate('topic')}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-gray-700 font-medium border-b-2 transition-colors",
                  activeTab === 'topic' 
                    ? "border-[rgb(0,153,168)] text-[rgb(0,153,168)]" 
                    : "border-transparent hover:text-[rgb(0,153,168)] hover:bg-gray-50"
                )}
              >
                <Newspaper className="h-5 w-5" />
                <span>Bronanalyse</span>
              </button>
              
              <button 
                onClick={() => handleNavigate('scenario')}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-gray-700 font-medium border-b-2 transition-colors",
                  activeTab === 'scenario' 
                    ? "border-[rgb(0,153,168)] text-[rgb(0,153,168)]" 
                    : "border-transparent hover:text-[rgb(0,153,168)] hover:bg-gray-50"
                )}
              >
                <GitBranch className="h-5 w-5" />
                <span>Scenario Generator</span>
              </button>
              
              <button 
                onClick={() => handleNavigate('aangrijpspunten')}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-gray-700 font-medium border-b-2 transition-colors",
                  activeTab === 'aangrijpspunten' 
                    ? "border-[rgb(0,153,168)] text-[rgb(0,153,168)]" 
                    : "border-transparent hover:text-[rgb(0,153,168)] hover:bg-gray-50"
                )}
              >
                <Target className="h-5 w-5" />
                <span>Aangrijpingsgebieden</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Content Section based on active tab */}
        <div className="w-full relative">
          {activeTab === 'landing' && (
            <>
              <CitationsBackground />
              <LandingPage onNavigate={handleNavigate} />
            </>
          )}
          
          {activeTab === 'complexiteit' && (
            <div className="relative w-full bg-gray-50">
              <MainContent settings={settings} />
            </div>
          )}
          
          {activeTab === 'tijkdreeks' && (
            <div className="bg-gray-50">
              {/* <TijkdreeksAnalyse /> */}
              <TimeSeriesAnalysis />
            </div>
          )}
          
          {activeTab === 'chronologisch' && (
            <div className="bg-gray-50">
              <ChronologicalAnalysis />
            </div>
          )}
          
          {activeTab === 'topic' && (
            <div className="bg-gray-50">
              <SourceAnalysis />
            </div>
          )}
          
          {activeTab === 'scenario' && (
            <div className="bg-gray-50">
              <ScenarioGenerator />
            </div>
          )}
          
          {activeTab === 'aangrijpspunten' && (
            <div className="bg-gray-50">
              <Aangrijpspunten />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NarrativeLayout;