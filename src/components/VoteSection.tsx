
import React from 'react';
import CandidateCard, { CandidateProps } from './CandidateCard';

interface VoteSectionProps {
  title: string;
  description: string;
  candidates: Omit<CandidateProps, 'onSelect' | 'selected'>[];
  selectedCandidate: string | null;
  onVote: (candidateId: string) => void;
  votingComplete: boolean;
}

const VoteSection: React.FC<VoteSectionProps> = ({
  title,
  description,
  candidates,
  selectedCandidate,
  onVote,
  votingComplete
}) => {
  const handleSelect = (id: string) => {
    if (votingComplete) return;
    onVote(id);
  };

  return (
    <section className="mb-8 md:mb-16">
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-3xl font-bold text-election-dark">{title}</h2>
        <p className="text-sm md:text-base text-gray-600 mt-1">{description}</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            {...candidate}
            selected={selectedCandidate === candidate.id}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </section>
  );
};

export default VoteSection;
