import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Document } from './chronologicalApi';

interface DocumentDialogProps {
  sourceCount: number;
  uniqueSources?: string[];
  documents?: Document[];
  eventTitle: string;
}

// Theme color
const themeColor = 'rgb(0,153,168)';

const DocumentDialog: React.FC<DocumentDialogProps> = ({ 
  sourceCount, 
  uniqueSources = [], 
  documents = [],
  eventTitle 
}) => {
  return (
    <Dialog>
      <DialogTrigger>
        <Badge 
          variant="outline" 
          className="text-gray-700 border-gray-300 cursor-pointer hover:border-teal-500 transition-colors"
        >
          {sourceCount} bronnen
        </Badge>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-col gap-2">
            <span style={{ color: themeColor }}>{eventTitle}</span>
            <span className="text-sm font-normal text-gray-500">Bronnen en documenten</span>
          </DialogTitle>
        </DialogHeader>
        
        {uniqueSources && uniqueSources.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2 text-gray-600">Unieke bronnen:</h4>
            <div className="flex flex-wrap gap-2">
              {uniqueSources.map((source, index) => (
                <Badge key={index} variant="secondary" className="bg-gray-100">
                  {source}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {documents && documents.length > 0 ? (
          <div>
            <h4 className="text-sm font-medium mb-2 text-gray-600">Documenten:</h4>
            <ul className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
              {documents.map((doc, index) => (
                <li key={index} className="border-b border-gray-100 pb-2">
                  <a 
                    href={doc.document_link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-start gap-2 hover:text-teal-600 transition-colors group"
                  >
                    <ExternalLink 
                      className="h-4 w-4 mt-1 flex-shrink-0 group-hover:text-teal-600" 
                      style={{ color: themeColor }}
                    />
                    <span className="text-sm">{doc.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            Geen documenten beschikbaar voor dit onderwerp.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentDialog;