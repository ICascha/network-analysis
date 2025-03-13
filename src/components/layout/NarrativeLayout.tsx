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
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
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
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle>Over Denkwerk</DialogTitle>
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
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle>Toelichting model</DialogTitle>
            </DialogHeader>
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <p className="text-gray-700 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>

              <div>
                <h3 className="font-semibold text-lg mb-2">Lorem ipsum:</h3>
                <p className="text-gray-700 leading-relaxed">
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                </p>
                <p className="text-gray-700 leading-relaxed mt-2">
                  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
              </div>

              <p className="text-gray-700 leading-relaxed mt-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
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
          <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-white text-center px-4">
            <h1 className="text-5xl font-bold mb-8">
              Netwerk Analyse
            </h1>
            <p className="text-xl max-w-3xl">
              WORK IN PROGRESS
            </p>
          </div>
        </div>

        {/* Main Content with partial grey background */}
        <div className="w-full">
          <div className="max-w-[2400px] mx-auto px-8 relative">
            <div className="absolute left-8 right-8 top-0 bottom-0 bg-white shadow-lg" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
              {/* Empty Settings Section with border */}
              <div
                className="relative pt-8 border-t border-gray-200"
              >
                <div className="space-y-8 mb-16">
                  <MainContent settings={settings} />
                  {/* Empty content area */}
                </div>

                <div className="text-center mt-12">
                  <p className="text-gray-600">
                    Meer weten?{' '}
                    <a
                      href="https://denkwerk.online/rapporten/kiezen-én-delen-januari-2025/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[rgb(0,153,168)] hover:text-[rgb(0,123,138)] underline"
                    >
                      Vind hier het volledige rapport
                    </a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NarrativeLayout;