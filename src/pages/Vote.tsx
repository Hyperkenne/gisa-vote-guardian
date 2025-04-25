import React, { useEffect, useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import VoteSection from '@/components/VoteSection';
import { initialVoteData, VoteData, getUserVotes, recordVote, hasVoted } from '@/utils/votingUtils';
import { AlertCircle, CheckCircle } from 'lucide-react';

// Presidential candidates
const presidentialCandidates = [
  {
    id: "pres_01",
    name: "Sophiya Sharma",
    country: "Nepal",
    course: "BBA",
    position: "President",
    photoUrl: "/lovable-uploads/365932a8-6f51-4d68-86a2-6a60724ef7a6.png"
  },
  {
    id: "pres_02",
    name: "Mohammed Lamin Jabba",
    country: "Gambia",
    course: "MBA",
    position: "President",
    photoUrl: "/lovable-uploads/49d8a889-3789-4e61-92f1-65c195464800.png"
  },
];

// Vice President candidates
const vicePresidentCandidates = [
  {
    id: "vp_01",
    name: "Yak Majok",
    country: "South Sudan",
    course: "B-Tech CSE",
    position: "Vice President",
    photoUrl: "/lovable-uploads/1addf34f-ba63-4210-8d73-f995b08360df.png"
  },
  {
    id: "vp_02",
    name: "Ibrahim Hafez",
    country: "Syria",
    course: "B-Tech CSE",
    position: "Vice President",
    photoUrl: "/lovable-uploads/55682ff6-96fb-4ea7-87d0-08ce14e240e5.png"
  },
  {
    id: "vp_03",
    name: "Hrishita Rauniyar",
    country: "Nepal",
    course: "MBA",
    position: "Vice President",
    photoUrl: "/lovable-uploads/169cd655-183e-4866-9173-38e822889a2e.png"
  },
];

// General Secretary candidates
const generalSecretaryCandidates = [
  {
    id: "gs_01",
    name: "Malinga Aaron",
    country: "Uganda",
    course: "B-Tech Civil Engineering",
    position: "General Secretary",
    photoUrl: "/lovable-uploads/a6903830-cad0-4769-94e1-4c53713f6aba.png"
  },
  {
    id: "gs_02",
    name: "Kusum Patel",
    country: "Nepal",
    course: "BBA",
    position: "General Secretary",
    photoUrl: "/lovable-uploads/e2d9eb48-7707-43ae-9e94-d5170b2e1edb.png"
  },
];

// Sports & Welfare candidates
const sportsWelfareCandidates = [
  {
    id: "sw_01",
    name: "Sylvester Mbah",
    country: "Cameroon",
    course: "B-Tech Mechanical Engineering",
    position: "Sports & Welfare",
  },
];

const Vote = () => {
  const [votes, setVotes] = useState<VoteData>(initialVoteData);
  const [votedPositions, setVotedPositions] = useState<Record<keyof VoteData, boolean>>({
    president: false,
    vicePresident: false,
    generalSecretary: false,
    sportsWelfare: false,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Load previous votes
  useEffect(() => {
    const loadVotes = async () => {
      try {
        // Get user votes
        const userVotes = await getUserVotes();
        setVotes(userVotes);
        
        // Check which positions have been voted for
        const president = await hasVoted('president');
        const vicePresident = await hasVoted('vicePresident');
        const generalSecretary = await hasVoted('generalSecretary');
        const sportsWelfare = await hasVoted('sportsWelfare');
        
        setVotedPositions({
          president,
          vicePresident,
          generalSecretary,
          sportsWelfare,
        });
      } catch (error) {
        console.error('Error loading votes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadVotes();
  }, []);
  
  // Handle vote for a position
  const handleVote = async (position: keyof VoteData, candidateId: string) => {
    if (votedPositions[position]) {
      toast({
        title: "Already voted",
        description: `You have already voted for this position.`,
        variant: "destructive",
      });
      return;
    }
    
    try {
      const success = await recordVote(position, candidateId);
      
      if (success) {
        setVotes(prev => ({
          ...prev,
          [position]: candidateId,
        }));
        
        setVotedPositions(prev => ({
          ...prev,
          [position]: true,
        }));
        
        toast({
          title: "Vote recorded!",
          description: "Your vote has been successfully recorded.",
        });
      } else {
        toast({
          title: "Vote failed",
          description: "You may have already voted for this position.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error recording vote:', error);
      toast({
        title: "Error recording vote",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-election-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="bg-election-light py-8">
        <div className="election-container">
          <h1 className="text-3xl md:text-4xl font-bold text-election-dark">Cast Your Vote</h1>
          <p className="text-gray-600 mt-2">
            Select one candidate for each position. You can only vote once per position.
          </p>
        </div>
      </div>
      
      <div className="election-container py-8">
        {Object.values(votedPositions).every(voted => voted) ? (
          <Card className="bg-green-50 p-6 mb-8 border-green-200">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
              <h2 className="text-xl font-bold text-green-800">Thank you for voting!</h2>
            </div>
            <p className="text-green-700 mb-4">
              You have successfully voted for all positions. Your voice matters!
            </p>
            <Button 
              variant="outline" 
              className="bg-white text-green-700 border-green-300 hover:bg-green-50"
              onClick={() => window.location.href = '/results'}
            >
              View Results
            </Button>
          </Card>
        ) : (
          <Alert className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You can only vote once for each position. Your vote is anonymous but secured.
            </AlertDescription>
          </Alert>
        )}
        
        <VoteSection
          title="Presidential Candidates"
          description="Select one candidate for President"
          candidates={presidentialCandidates}
          selectedCandidate={votes.president}
          onVote={(id) => handleVote('president', id)}
          votingComplete={votedPositions.president}
        />
        
        <Separator className="my-8" />
        
        <VoteSection
          title="Vice Presidential Candidates"
          description="Select one candidate for Vice President"
          candidates={vicePresidentCandidates}
          selectedCandidate={votes.vicePresident}
          onVote={(id) => handleVote('vicePresident', id)}
          votingComplete={votedPositions.vicePresident}
        />
        
        <Separator className="my-8" />
        
        <VoteSection
          title="General Secretary Candidates"
          description="Select one candidate for General Secretary"
          candidates={generalSecretaryCandidates}
          selectedCandidate={votes.generalSecretary}
          onVote={(id) => handleVote('generalSecretary', id)}
          votingComplete={votedPositions.generalSecretary}
        />
        
        <Separator className="my-8" />
        
        <VoteSection
          title="Sports & Welfare Candidates"
          description="Select one candidate for Sports & Welfare"
          candidates={sportsWelfareCandidates}
          selectedCandidate={votes.sportsWelfare}
          onVote={(id) => handleVote('sportsWelfare', id)}
          votingComplete={votedPositions.sportsWelfare}
        />
      </div>
    </>
  );
};

export default Vote;
