import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Theme color
const themeColor = 'rgb(0,153,168)';

interface TimelineEvent {
  date: string;
  formattedDate: string;
  title: string;
  summary: string;
  messageCount: number;
  sourceCount: number;
  id: number;
}

interface CustomTimelineProps {
  events: TimelineEvent[];
}

const CustomTimeline: React.FC<CustomTimelineProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return <div>Geen gebeurtenissen om weer te geven</div>;
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div 
        className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-transparent via-teal-500 to-transparent"
        style={{ backgroundColor: themeColor, opacity: 0.7 }}
      ></div>
      
      {/* Timeline events */}
      <div className="relative py-8">
        {events.map((event, index) => {
          const isEven = index % 2 === 0;
          return (
            <div key={event.id || index} className="mb-16 relative">
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
                  {event.formattedDate}
                </span>
              </div>
              
              {/* Content card - alternating left/right */}
              <div className={`flex ${isEven ? 'justify-end' : 'justify-start'}`}>
                <div className={`w-5/12 ${isEven ? 'mr-12' : 'ml-12'}`}>
                  <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold mb-2" style={{ color: themeColor }}>
                        {event.title}
                      </h3>
                      
                      <div className="flex space-x-2 mb-3">
                        <Badge style={{ backgroundColor: themeColor }} className="text-white">
                          {event.messageCount} berichten
                        </Badge>
                        <Badge variant="outline" className="text-gray-700 border-gray-300">
                          {event.sourceCount} bronnen
                        </Badge>
                      </div>
                      
                      <p className="text-gray-700">{event.summary}</p>
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

export default CustomTimeline;