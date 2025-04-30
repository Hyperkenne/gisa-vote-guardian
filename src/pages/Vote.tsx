import React, { useEffect, useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import VoteSection from '@/components/VoteSection';
import { initialVoteData, VoteData, getUserVotes, recordVote, hasVoted } from '@/utils/votingUtils';
import { resetEverything, getCurrentEmail, logoutEmail } from '@/utils/authUtils';
import { AlertCircle, CheckCircle, Settings, LogOut, UserX } from 'lucide-react';
import LoginForm from '@/components/LoginForm';
import ResetEmailForm from '@/components/ResetEmailForm';
import { useIsMobile } from '@/hooks/use-mobile';

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
    name: "Muhammed Lamin Jabbi",
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
  {
    id: "sw_02",
    name: "Elsa Farhan Agung",
    country: "Indonesia",
    course: "BBA",
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
  const [resetPassword, setResetPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [showResetEmailDialog, setShowResetEmailDialog] = useState(false);
  
  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = () => {
      const email = getCurrentEmail();
      if (email) {
        setAuthenticated(true);
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Load previous votes if authenticated
  useEffect(() => {
    const loadVotes = async () => {
      if (!authenticated) return;
      
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
    
    if (authenticated) {
      loadVotes();
    }
  }, [authenticated]);
  
  // Handle vote for a position
  const handleVote = async (position: keyof VoteData, candidateId: string) => {
    if (!authenticated) {
      toast({
        title: "Authentication required",
        description: "Please login before voting.",
        variant: "destructive",
      });
      return;
    }
    
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

  const handleReset = async () => {
    // Check if password is correct
    if (resetPassword !== "EL SHARAWY") {
      setPasswordError(true);
      toast({
        title: "Incorrect Password",
        description: "The password you entered is incorrect.",
        variant: "destructive",
      });
      return;
    }
    
    setPasswordError(false);
    
    try {
      const success = await resetEverything(resetPassword);
      if (success) {
        toast({
          title: "System Reset",
          description: "All votes and email authentications have been successfully reset.",
        });
        // Reset local state
        setVotes(initialVoteData);
        setVotedPositions({
          president: false,
          vicePresident: false,
          generalSecretary: false,
          sportsWelfare: false,
        });
        // Clear password field and log out
        setResetPassword('');
        setAuthenticated(false);
      } else {
        toast({
          title: "Reset Failed",
          description: "Failed to reset the system. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error resetting votes:', error);
      toast({
        title: "Error",
        description: "An error occurred while resetting the system.",
        variant: "destructive",
      });
    }
  };
  
  const handleLogout = () => {
    logoutEmail();
    setAuthenticated(false);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };
  
  const handleLoginSuccess = () => {
    setAuthenticated(true);
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
  
  // Show login form if not authenticated
  if (!authenticated) {
    return (
      <div className="bg-election-light min-h-screen py-12">
        <div className="election-container max-w-md">
          <LoginForm onSuccess={handleLoginSuccess} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-election-light py-8">
        <div className="election-container px-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-election-dark">Cast Your Vote</h1>
              <p className="text-gray-600 mt-2 text-sm md:text-base">
                Select one candidate for each position. You can only vote once per position.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 text-xs md:text-sm"
                onClick={handleLogout}
                size={isMobile ? "sm" : "default"}
              >
                <LogOut className="h-3 w-3 md:h-4 md:w-4" />
                Logout
              </Button>
              
              <Dialog open={showResetEmailDialog} onOpenChange={setShowResetEmailDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="gap-2 text-xs md:text-sm bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
                    size={isMobile ? "sm" : "default"}
                  >
                    <UserX className="h-3 w-3 md:h-4 md:w-4" />
                    Reset Email
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <ResetEmailForm onClose={() => setShowResetEmailDialog(false)} />
                </DialogContent>
              </Dialog>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="gap-2 text-xs md:text-sm"
                    size={isMobile ? "sm" : "default"}
                  >
                    <Settings className="h-3 w-3 md:h-4 md:w-4" />
                    Reset All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[90vw] md:max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset All Votes?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will reset all votes and email authentications to zero and allow re-voting. This cannot be undone.
                      Please enter the administrator password to continue.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-4">
                    <Input
                      type="password"
                      placeholder="Enter password"
                      value={resetPassword}
                      onChange={(e) => setResetPassword(e.target.value)}
                      className={passwordError ? "border-red-500" : ""}
                    />
                    {passwordError && (
                      <p className="text-red-500 text-sm mt-1">Incorrect password</p>
                    )}
                  </div>
                  <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                    <AlertDialogCancel onClick={() => {
                      setPasswordError(false);
                      setResetPassword('');
                    }}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleReset}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Reset
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
      
      <div className="election-container py-8 px-4">
        <Alert className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You are logged in with your email. You can only vote once for each position.
          </AlertDescription>
        </Alert>
        
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
        ) : null}
        
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
