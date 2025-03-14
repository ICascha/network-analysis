import { useState } from 'react';
import { MainContent } from '../visualization/MainContent';
import { Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ModelSettings } from '@/types/settings';
import ModelExplanation from './ModelExplanation';

const initialSettings: ModelSettings = {
  productivity: 1.0,
  steering: 'with',
  workHours: 'noone',
  jobPriority: 'standard',
  nonSourceJobs: 'standard'
};

export const NarrativeLayout = () => {
  const [settings] = useState<ModelSettings>(initialSettings);
  
  const basePath = import.meta.env.BASE_URL;

  return (
    <div className="flex flex-col w-full min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
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
            <div className="relative w-16 h-16 rounded-full bg-cyan-600 flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer">
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
          <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center text-white text-center px-4">
            <h1 className="text-5xl font-bold mb-8">
              Netwerk Analyse
            </h1>
            <p className="text-xl max-w-3xl">
              WORK IN PROGRESS
            </p>
          </div>
        </div>

        {/* Full-width Visualization Section */}
        <div className="w-full">
          {/* Main Visualization Content - Full Width */}
          <div className="relative w-full">
            <MainContent settings={settings} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NarrativeLayout;