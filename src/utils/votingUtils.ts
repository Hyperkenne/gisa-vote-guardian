import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { db } from "../services/firebase";
import { 
  doc, setDoc, getDoc, updateDoc, increment, 
  collection, getDocs, Timestamp, onSnapshot 
} from "firebase/firestore";

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

// Vote storage constants - still keep in localStorage for backup
const VOTE_STORAGE_KEY = 'gisa_election_votes';
const VOTE_TIMESTAMP_KEY = 'gisa_election_vote_timestamp';
const VOTE_COUNTS_KEY = 'gisa_election_vote_counts';

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
  
  try {
    // Check in Firebase
    const userVoteRef = doc(db, "userVotes", visitorId);
    const userVoteDoc = await getDoc(userVoteRef);
    
    if (userVoteDoc.exists()) {
      const data = userVoteDoc.data() as VoteData;
      return data[position] !== null;
    }
    
    // Check local storage as backup
    const storedVotes = localStorage.getItem(`${VOTE_STORAGE_KEY}_${visitorId}`);
    if (storedVotes) {
      const votes = JSON.parse(storedVotes) as VoteData;
      return votes[position] !== null;
    }
    
    return false;
  } catch (error) {
    console.error("Error checking vote status:", error);
    // Fallback to localStorage if Firebase fails
    const storedVotes = localStorage.getItem(`${VOTE_STORAGE_KEY}_${visitorId}`);
    if (storedVotes) {
      const votes = JSON.parse(storedVotes) as VoteData;
      return votes[position] !== null;
    }
    return false;
  }
};

// Record a vote for a position
export const recordVote = async (position: keyof VoteData, candidateId: string): Promise<boolean> => {
  try {
    const visitorId = await getVisitorId();
    
    // Check if already voted
    if (await hasVoted(position)) {
      return false;
    }
    
    // Get user's current votes
    let votes: VoteData = initialVoteData;
    const userVoteRef = doc(db, "userVotes", visitorId);
    const userVoteDoc = await getDoc(userVoteRef);
    
    if (userVoteDoc.exists()) {
      votes = userVoteDoc.data() as VoteData;
    } else {
      // Get from local storage as backup
      const storedVotes = localStorage.getItem(`${VOTE_STORAGE_KEY}_${visitorId}`);
      if (storedVotes) {
        votes = JSON.parse(storedVotes) as VoteData;
      }
    }
    
    // Update user's vote in Firebase
    votes[position] = candidateId;
    await setDoc(userVoteRef, votes, { merge: true });
    
    // Update vote count in Firebase
    const voteCountRef = doc(db, "voteCounts", position);
    const voteCountDoc = await getDoc(voteCountRef);
    
    if (voteCountDoc.exists()) {
      await updateDoc(voteCountRef, {
        [candidateId]: increment(1),
        lastUpdated: Timestamp.now()
      });
    } else {
      await setDoc(voteCountRef, {
        [candidateId]: 1,
        lastUpdated: Timestamp.now()
      });
    }
    
    // Update local storage as backup
    localStorage.setItem(`${VOTE_STORAGE_KEY}_${visitorId}`, JSON.stringify(votes));
    setVoteTimestamp();
    
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

// Set the current timestamp for vote synchronization
export const setVoteTimestamp = (): void => {
  const timestamp = Date.now().toString();
  localStorage.setItem(VOTE_TIMESTAMP_KEY, timestamp);
};

// Get the last vote timestamp
export const getVoteTimestamp = (): number => {
  const timestamp = localStorage.getItem(VOTE_TIMESTAMP_KEY);
  return timestamp ? parseInt(timestamp, 10) : 0;
};

// Get vote counts for all positions and candidates from Firebase
export const getVoteCounts = async (): Promise<AllVoteCounts> => {
  const result: AllVoteCounts = {
    president: {},
    vicePresident: {},
    generalSecretary: {},
    sportsWelfare: {}
  };
  
  try {
    // Get all vote counts from Firebase
    const positions = Object.keys(result) as Array<keyof AllVoteCounts>;
    
    for (const position of positions) {
      const voteCountRef = doc(db, "voteCounts", position);
      const voteCountDoc = await getDoc(voteCountRef);
      
      if (voteCountDoc.exists()) {
        const data = voteCountDoc.data();
        // Filter out non-count fields like timestamp
        Object.entries(data).forEach(([key, value]) => {
          if (key !== "lastUpdated" && typeof value === "number") {
            result[position][key] = value;
          }
        });
      }
    }
    
    return result;
  } catch (error) {
    console.error("Error getting vote counts from Firebase:", error);
    // Return empty object
    return {
      president: {},
      vicePresident: {},
      generalSecretary: {},
      sportsWelfare: {}
    };
  }
};

// Set up a real-time listener for vote counts
export const subscribeToVoteCounts = (
  callback: (counts: AllVoteCounts) => void
): (() => void) => {
  const positions = ["president", "vicePresident", "generalSecretary", "sportsWelfare"];
  const unsubscribers: Array<() => void> = [];
  
  const combinedResults: AllVoteCounts = {
    president: {},
    vicePresident: {},
    generalSecretary: {},
    sportsWelfare: {}
  };
  
  positions.forEach((position) => {
    const unsubscribe = onSnapshot(
      doc(db, "voteCounts", position), 
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          // Filter out non-count fields
          Object.entries(data).forEach(([key, value]) => {
            if (key !== "lastUpdated" && typeof value === "number") {
              combinedResults[position as keyof AllVoteCounts][key] = value as number;
            }
          });
          callback({...combinedResults});
        }
      },
      (error) => {
        console.error(`Error in vote count listener for ${position}:`, error);
      }
    );
    
    unsubscribers.push(unsubscribe);
  });
  
  // Return function to unsubscribe from all listeners
  return () => {
    unsubscribers.forEach(unsubscribe => unsubscribe());
  };
};

// Get user votes based on visitor ID
export const getUserVotes = async (): Promise<VoteData> => {
  const visitorId = await getVisitorId();
  
  try {
    const userVoteRef = doc(db, "userVotes", visitorId);
    const userVoteDoc = await getDoc(userVoteRef);
    
    if (userVoteDoc.exists()) {
      return userVoteDoc.data() as VoteData;
    }
    
    // Check local storage as backup
    const storedVotes = localStorage.getItem(`${VOTE_STORAGE_KEY}_${visitorId}`);
    if (storedVotes) {
      return JSON.parse(storedVotes) as VoteData;
    }
    
    return initialVoteData;
  } catch (error) {
    console.error("Error getting user votes from Firebase:", error);
    // Fallback to localStorage
    const storedVotes = localStorage.getItem(`${VOTE_STORAGE_KEY}_${visitorId}`);
    if (storedVotes) {
      return JSON.parse(storedVotes) as VoteData;
    }
    return initialVoteData;
  }
};

// Force reload of data for all clients
export const forceDataReload = async (): Promise<void> => {
  try {
    const configRef = doc(db, "system", "refreshConfig");
    await setDoc(configRef, {
      lastRefresh: Timestamp.now(),
      refreshId: Math.random().toString(36).substring(2, 15)
    }, { merge: true });
    
    // Also update local timestamp
    setVoteTimestamp();
  } catch (error) {
    console.error("Error forcing data reload:", error);
    // Fallback to local timestamp
    setVoteTimestamp();
  }
};
