
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CandidateProps {
  id: string;
  name: string;
  country: string;
  course: string;
  position: string;
  photoUrl?: string;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

const CandidateCard: React.FC<CandidateProps> = ({
  id,
  name,
  country,
  course,
  photoUrl,
  selected = false,
  onSelect
}) => {
  const handleSelect = () => {
    if (onSelect) {
      onSelect(id);
    }
  };

  return (
    <Card 
      className={cn(
        "candidate-card cursor-pointer transition-all duration-300 hover:translate-y-[-5px] relative overflow-hidden",
        selected && "candidate-selected"
      )}
      onClick={handleSelect}
    >
      {selected && (
        <div className="absolute top-2 right-2 z-10 bg-election-primary rounded-full text-white">
          <CheckCircle2 className="h-6 w-6" />
        </div>
      )}
      <div className="h-40 bg-gradient-election flex items-center justify-center overflow-hidden">
        {photoUrl ? (
          <img 
            src={photoUrl} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center">
            <span className="text-white text-3xl font-bold">
              {name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <CardContent className="pt-4">
        <h3 className="font-bold text-lg">{name}</h3>
        <div className="mt-2 text-sm text-gray-600 space-y-1">
          <p><span className="font-medium">Country:</span> {country}</p>
          <p><span className="font-medium">Course:</span> {course}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className={cn(
          "w-full py-1 px-2 text-xs font-medium rounded-full text-center",
          selected ? "bg-election-primary text-white" : "bg-election-light text-election-primary"
        )}>
          {selected ? "Selected" : "Click to select"}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CandidateCard;
