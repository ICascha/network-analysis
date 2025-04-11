import React from 'react';
import { useChronologicalData, EmergingThreat } from './chronologicalApi';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DocumentDialog from './DocumentDialog';

// Animation styles
const pulseAnimation = `
  @keyframes subtle-pulse {
    0% { box-shadow: 0 0 0 1px rgba(0,153,168, 0.2); }
    50% { box-shadow: 0 0 0 2px rgba(0,153,168, 0.2); }
    100% { box-shadow: 0 0 0 1px rgba(0,153,168, 0.2); }
  }
`;

// Theme color
const themeColor = 'rgb(0,153,168)';

// Format date for display
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('nl-NL', { 
    year: 'numeric', 
    month: 'long'
  });
};

const CustomTimeline: React.FC<{ events: EmergingThreat[] }> = ({ events }) => {
  if (!events || events.length === 0) {
    return <div>Geen gebeurtenissen om weer te geven</div>;
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div 
        className="absolute left-1/2 transform -translate-x-1/2 h-full w-1"
        style={{ backgroundColor: themeColor, opacity: 0.7 }}
      ></div>
      
      {/* Timeline events */}
      <div className="relative py-8">
        {events.map((event, index) => {
          const isEven = index % 2 === 0;
          // Create a unique key combining topic_id and index
          const uniqueKey = `${event.topic_id}-${index}`;
          return (
            <div key={uniqueKey} className="mb-16 relative">
              {/* Timeline dot */}
              <div 
                className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full z-10 shadow-md"
                style={{ backgroundColor: themeColor, top: '2rem' }}
              ></div>
              
              {/* Date display */}
              <div className="text-center mb-8">
                <span 
                  className="inline-block px-4 py-1 rounded-full font-medium text-white text-sm"
                  style={{ backgroundColor: themeColor }}
                >
                  {formatDate(event.emergence_date)}
                </span>
              </div>
              
              {/* Content card - alternating left/right */}
              <div className={`flex ${isEven ? 'justify-end' : 'justify-start'}`}>
                <div className={`w-5/12 ${isEven ? 'mr-12' : 'ml-12'}`}>
                  <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold mb-2" style={{ color: themeColor }}>
                        {event.keyword}
                      </h3>
                      
                      <div className="flex space-x-2 mb-3">
                        <Badge style={{ backgroundColor: themeColor }} className="text-white">
                          {event.aantal_berichten} berichten
                        </Badge>
                        <DocumentDialog 
                          sourceCount={event.bronnen}
                          uniqueSources={event.unieke_bronnen}
                          documents={event.documenten}
                          eventTitle={event.keyword}
                        />
                      </div>
                      
                      <p className="text-gray-700">{event.samenvatting}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ChronologicalAnalysis: React.FC = () => {
  const { data, isLoading, error } = useChronologicalData();

  // Sort data to have most recent dates on top
  const sortedData = [...data].sort((a, b) => 
    new Date(b.emergence_date).getTime() - new Date(a.emergence_date).getTime()
  );

  // Debug information
  console.log("Chronological data (sorted):", sortedData);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="flex items-center justify-center p-10">
            <div className="text-center">
              <p className="text-gray-500">Tijdlijn wordt geladen...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
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

  if (data.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="flex items-center justify-center p-10">
            <div className="text-center">
              <p className="text-gray-500">Geen chronologische gegevens beschikbaar</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white shadow-md px-8 py-6 mb-8">
        <h1 className="text-2xl font-bold mb-4" style={{ color: themeColor }}>
          Chronologische Analyse
        </h1>
        <div className="prose max-w-none mb-6">
          <p className="text-gray-600 leading-relaxed">
            Hier ziet u de opkomst van verschillende dreigingen in chronologische volgorde. 
            Deze tijdlijn toont wanneer specifieke dreigingen voor het eerst werden geïdentificeerd, 
            wat hun bereik is, en wat de belangrijkste aandachtspunten zijn. Elke gebeurtenis is 
            gebaseerd op analyse van duizenden rapporten en nieuwsberichten.
          </p>
        </div>

        <style>{pulseAnimation}</style>
        
        {/* Custom timeline implementation instead of react-chrono */}
        <div className="relative mt-8 animate-[subtle-pulse_3s_ease-in-out_infinite] bg-white p-4 rounded-md">
          <div style={{ minHeight: '600px' }}>
            <CustomTimeline events={sortedData} />
          </div>
        </div>
        
        {/* Debug display - only in development */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-md">
            <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
            <p className="mb-2">Data items count: {data.length}</p>
            {data.length > 0 && (
              <div className="overflow-auto max-h-40">
                <pre className="text-xs">{JSON.stringify(data[0], null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChronologicalAnalysis;