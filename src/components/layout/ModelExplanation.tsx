import { AlertTriangle, Network, FileText, BrainCircuit, ArrowRightCircle, Database } from 'lucide-react';

const ModelExplanation = () => {
  return (
    <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
      <div className="flex flex-col space-y-2">
        <h3 className="font-semibold text-xl flex items-center gap-2 text-cyan-700">
          <AlertTriangle className="h-6 w-6" /> 
          Nationale Dreigingsanalyse
        </h3>
        <p className="text-gray-700 leading-relaxed">
          Dit interactieve model visualiseert de verbanden tussen verschillende nationale dreigingen, 
          gebaseerd op officiële overheidsdocumenten. Het doel is om inzicht te krijgen in hoe 
          dreigingen elkaar beïnvloeden en welke prioriteiten gesteld kunnen worden in het veiligheidsbeleid.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2 text-cyan-700">
          <FileText className="h-5 w-5" />
          Databronnen:
        </h3>
        <p className="text-gray-700 leading-relaxed">
          De analyse is gebaseerd op 500 relevante overheidsdocumenten verzameld via open.overheid.nl 
          met de zoekterm "dreiging". Alle informatie in het model is direct herleidbaar naar officiële 
          bronnen via verbatim citaten uit deze documenten.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2 text-cyan-700">
          <BrainCircuit className="h-5 w-5" />
          Methodologie:
        </h3>
        <div className="pl-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-cyan-100 rounded-full p-2 mt-1 flex-shrink-0">
              <Database className="h-4 w-4 text-cyan-700" />
            </div>
            <p className="text-gray-700">
              <span className="font-medium">Dataverzameling:</span> 500 meest relevante documenten met de term "dreiging" van open.overheid.nl
            </p>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-cyan-100 rounded-full p-2 mt-1 flex-shrink-0">
              <BrainCircuit className="h-4 w-4 text-cyan-700" />
            </div>
            <p className="text-gray-700">
              <span className="font-medium">AI-analyse:</span> GPT-4o-mini is gebruikt om concrete dreigingen en semantisch causale verbanden te identificeren, 
              ondersteund door verbatim citaten
            </p>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-cyan-100 rounded-full p-2 mt-1 flex-shrink-0">
              <Network className="h-4 w-4 text-cyan-700" />
            </div>
            <p className="text-gray-700">
              <span className="font-medium">Topic modeling:</span> Ongeveer 1000 specifieke dreigingen zijn gegroepeerd in algemene dreigingscategorieën
            </p>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-cyan-100 rounded-full p-2 mt-1 flex-shrink-0">
              <ArrowRightCircle className="h-4 w-4 text-cyan-700" />
            </div>
            <p className="text-gray-700">
              <span className="font-medium">Verbanden analyse:</span> De semantisch causale relaties tussen dreigingscategorieën zijn gevisualiseerd in het netwerk
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2 text-cyan-700">
          <Network className="h-5 w-5" />
          Interpretatie van het model:
        </h3>
        <p className="text-gray-700 leading-relaxed">
          In de netwerkvisualisatie vertegenwoordigt elke knoop (node) een dreigingscategorie. Pijlen tussen 
          knopen geven causale verbanden aan: als er een pijl loopt van dreiging A naar dreiging B, betekent 
          dit dat er in de overheidsdocumenten minstens één causaal verband is gelegd waarbij dreiging A 
          bijdraagt aan of leidt tot dreiging B.
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4 mt-6">
        <p className="text-gray-600 text-sm">
          Let op: Dit is een MVP (Minimum Viable Product) ontwikkeld om de haalbaarheid van het concept 
          te testen.
        </p>
      </div>
    </div>
  );
};

export default ModelExplanation;