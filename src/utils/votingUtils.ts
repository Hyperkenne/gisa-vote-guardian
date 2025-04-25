
import FingerprintJS from "@fingerprintjs/fingerprintjs";

// Initialize the fingerprint agent
let fpPromise: Promise<any>;

// Initialize the browser fingerprinting
const initializeFingerprinting = () => {
  if (!fpPromise) {
    fpPromise = FingerprintJS.load();
  }
  return fpPromise;
};

// Generate a visitor ID based on browser fingerprinting
export const getVisitorId = async (): Promise<string> => {
  const fp = await initializeFingerprinting();
  const result = await fp.get();
  return result.visitorId;
};

// Vote storage constants
const VOTE_STORAGE_KEY = 'gisa_election_votes';

// Interface for vote data
export interface VoteData {
  president: string | null;
  vicePresident: string | null;
  generalSecretary: string | null;
  sportsWelfare: string | null;
}

// Initial vote data
export const initialVoteData: VoteData = {
  president: null,
  vicePresident: null,
  generalSecretary: null,
  sportsWelfare: null,
};

// Check if the user has already voted
export const hasVoted = async (position: keyof VoteData): Promise<boolean> => {
  const visitorId = await getVisitorId();
  const storedVotes = localStorage.getItem(`${VOTE_STORAGE_KEY}_${visitorId}`);
  
  if (!storedVotes) return false;
  
  const votes = JSON.parse(storedVotes) as VoteData;
  return votes[position] !== null;
};

// Record a vote for a position
export const recordVote = async (position: keyof VoteData, candidateId: string): Promise<boolean> => {
  try {
    const visitorId = await getVisitorId();
    let votes: VoteData = initialVoteData;
    
    const storedVotes = localStorage.getItem(`${VOTE_STORAGE_KEY}_${visitorId}`);
    if (storedVotes) {
      votes = JSON.parse(storedVotes) as VoteData;
    }
    
    // Check if already voted for this position
    if (votes[position] !== null) {
      return false;
    }
    
    // Record vote
    votes[position] = candidateId;
    localStorage.setItem(`${VOTE_STORAGE_KEY}_${visitorId}`, JSON.stringify(votes));
    
    // Update global vote count in localStorage (simulating a database)
    updateVoteCount(position, candidateId);
    
    return true;
  } catch (error) {
    console.error('Error recording vote:', error);
    return false;
  }
};

// Interface for vote counts
interface VoteCounts {
  [candidateId: string]: number;
}

export interface AllVoteCounts {
  president: VoteCounts;
  vicePresident: VoteCounts;
  generalSecretary: VoteCounts;
  sportsWelfare: VoteCounts;
}

const VOTE_COUNTS_KEY = 'gisa_election_vote_counts';

// Update vote count for a candidate
const updateVoteCount = (position: keyof VoteData, candidateId: string): void => {
  const storedCounts = localStorage.getItem(VOTE_COUNTS_KEY);
  let counts: AllVoteCounts = {
    president: {},
    vicePresident: {},
    generalSecretary: {},
    sportsWelfare: {}
  };
  
  if (storedCounts) {
    counts = JSON.parse(storedCounts) as AllVoteCounts;
  }
  
  // Initialize if needed
  if (!counts[position]) counts[position] = {};
  if (!counts[position][candidateId]) counts[position][candidateId] = 0;
  
  // Increment vote count
  counts[position][candidateId]++;
  
  localStorage.setItem(VOTE_COUNTS_KEY, JSON.stringify(counts));
};

// Get vote counts for all positions and candidates
export const getVoteCounts = (): AllVoteCounts => {
  const storedCounts = localStorage.getItem(VOTE_COUNTS_KEY);
  if (!storedCounts) {
    return {
      president: {},
      vicePresident: {},
      generalSecretary: {},
      sportsWelfare: {}
    };
  }
  
  return JSON.parse(storedCounts) as AllVoteCounts;
};

// Get user votes based on visitor ID
export const getUserVotes = async (): Promise<VoteData> => {
  const visitorId = await getVisitorId();
  const storedVotes = localStorage.getItem(`${VOTE_STORAGE_KEY}_${visitorId}`);
  
  if (!storedVotes) return initialVoteData;
  
  return JSON.parse(storedVotes) as VoteData;
};
