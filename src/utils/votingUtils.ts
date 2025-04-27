import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { db } from "../services/firebase";
import { 
  doc, setDoc, getDoc, updateDoc, increment, 
  collection, getDocs, Timestamp, onSnapshot,
  serverTimestamp
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
  try {
    const visitorId = await getVisitorId();
    
    // Check in Firebase
    const userVoteRef = doc(db, "userVotes", visitorId);
    const userVoteDoc = await getDoc(userVoteRef);
    
    if (userVoteDoc.exists()) {
      const data = userVoteDoc.data() as VoteData;
      return data[position] !== null;
    }
    
    return false;
  } catch (error) {
    console.error("Error checking vote status:", error);
    // In case of network error, assume not voted to allow retry
    return false;
  }
};

// Record a vote for a position - Fixed to ensure vote counts are properly updated
export const recordVote = async (position: keyof VoteData, candidateId: string): Promise<boolean> => {
  try {
    console.log(`Recording vote for ${position}: ${candidateId}`);
    const visitorId = await getVisitorId();
    
    // Check if already voted for this position
    if (await hasVoted(position)) {
      console.log(`User already voted for ${position}`);
      return false;
    }
    
    // Get user's current votes
    let votes: VoteData = {...initialVoteData};
    const userVoteRef = doc(db, "userVotes", visitorId);
    const userVoteDoc = await getDoc(userVoteRef);
    
    if (userVoteDoc.exists()) {
      votes = {...userVoteDoc.data() as VoteData};
    }
    
    // Update user's vote in Firebase
    votes[position] = candidateId;
    console.log(`Saving vote data for user:`, votes);
    await setDoc(userVoteRef, {
      ...votes,
      lastUpdated: serverTimestamp()
    }, { merge: true });
    
    // Update vote count in Firebase - ensure the document exists first
    const voteCountRef = doc(db, "voteCounts", position);
    const voteCountDoc = await getDoc(voteCountRef);
    
    // If the document exists, update it
    if (voteCountDoc.exists()) {
      console.log(`Updating existing vote count for ${position}, candidate ${candidateId}`);
      await updateDoc(voteCountRef, {
        [candidateId]: increment(1),
        lastUpdated: serverTimestamp()
      });
    } else {
      // If the document doesn't exist, create it with an initial value
      console.log(`Creating new vote count for ${position}, candidate ${candidateId}`);
      const initialData: any = {
        [candidateId]: 1,
        lastUpdated: serverTimestamp()
      };
      await setDoc(voteCountRef, initialData);
    }
    
    // Force data reload to update all clients
    await forceDataReload();
    
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

// Get vote counts for all positions and candidates from Firebase - improved error handling
export const getVoteCounts = async (): Promise<AllVoteCounts> => {
  const result: AllVoteCounts = {
    president: {},
    vicePresident: {},
    generalSecretary: {},
    sportsWelfare: {}
  };
  
  try {
    console.log("Fetching vote counts from Firebase");
    // Get all vote counts from Firebase
    const positions = Object.keys(result) as Array<keyof AllVoteCounts>;
    
    for (const position of positions) {
      const voteCountRef = doc(db, "voteCounts", position);
      const voteCountDoc = await getDoc(voteCountRef);
      
      if (voteCountDoc.exists()) {
        const data = voteCountDoc.data();
        console.log(`Vote counts for ${position}:`, data);
        // Filter out non-count fields like timestamp
        Object.entries(data).forEach(([key, value]) => {
          if (key !== "lastUpdated" && typeof value === "number") {
            result[position][key] = value;
          }
        });
      } else {
        console.log(`No vote count document exists for ${position}`);
      }
    }
    
    console.log("Final vote counts:", result);
    return result;
  } catch (error) {
    console.error("Error getting vote counts from Firebase:", error);
    // Return empty object on error
    return {
      president: {},
      vicePresident: {},
      generalSecretary: {},
      sportsWelfare: {}
    };
  }
};

// Set up a real-time listener for vote counts with improved error handling
export const subscribeToVoteCounts = (
  callback: (counts: AllVoteCounts) => void
): (() => void) => {
  const positions = ["president", "vicePresident", "generalSecretary", "sportsWelfare"];
  const unsubscribers: Array<() => void> = [];
  
  // Create a listener for system-wide refresh triggers
  const refreshUnsubscribe = onSnapshot(
    doc(db, "system", "refreshConfig"),
    (doc) => {
      console.log("System refresh triggered, fetching all vote counts");
      // When system refresh is triggered, fetch all vote counts
      getVoteCounts().then(counts => {
        callback({...counts});
      }).catch(error => {
        console.error("Error refreshing vote counts:", error);
      });
    },
    (error) => {
      console.error("Error in system refresh listener:", error);
    }
  );
  unsubscribers.push(refreshUnsubscribe);
  
  // Set up individual listeners for each position
  positions.forEach((position) => {
    console.log(`Setting up listener for ${position}`);
    const unsubscribe = onSnapshot(
      doc(db, "voteCounts", position),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          console.log(`Real-time update for ${position}:`, data);
          
          // Get the current combined result first
          getVoteCounts().then(fullCounts => {
            callback({...fullCounts});
          }).catch(error => {
            console.error(`Error getting full counts after update to ${position}:`, error);
          });
        } else {
          console.log(`No document exists for ${position} in real-time update`);
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
    console.log("Fetching user votes with visitor ID:", visitorId);
    const userVoteRef = doc(db, "userVotes", visitorId);
    const userVoteDoc = await getDoc(userVoteRef);
    
    if (userVoteDoc.exists()) {
      const data = userVoteDoc.data() as VoteData;
      console.log("User votes found:", data);
      return data;
    }
    
    console.log("No user votes found, returning initial vote data");
    return initialVoteData;
  } catch (error) {
    console.error("Error getting user votes from Firebase:", error);
    return initialVoteData;
  }
};

// Force reload of data for all clients
export const forceDataReload = async (): Promise<void> => {
  try {
    console.log("Forcing data reload for all clients");
    const configRef = doc(db, "system", "refreshConfig");
    await setDoc(configRef, {
      lastRefresh: serverTimestamp(),
      refreshId: Math.random().toString(36).substring(2, 15)
    }, { merge: true });
  } catch (error) {
    console.error("Error forcing data reload:", error);
  }
};

// New function to reset vote counts for all positions
export const resetVoteCounts = async (): Promise<boolean> => {
  try {
    console.log("Resetting all vote counts");
    
    // Positions to reset
    const positions = ['president', 'vicePresident', 'generalSecretary', 'sportsWelfare'];
    
    // Reset each position's vote count
    for (const position of positions) {
      const voteCountRef = doc(db, "voteCounts", position);
      
      // Set the document with empty vote counts
      await setDoc(voteCountRef, {
        lastUpdated: serverTimestamp()
      });
      
      console.log(`Reset vote count for ${position}`);
    }
    
    // Reset user votes collection
    const userVotesRef = collection(db, "userVotes");
    const userVotesSnapshot = await getDocs(userVotesRef);
    
    // Delete all existing user vote documents
    const deletePromises = userVotesSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);
    
    console.log("Deleted all user vote documents");
    
    // Force data reload to update all clients
    await forceDataReload();
    
    return true;
  } catch (error) {
    console.error('Error resetting vote counts:', error);
    return false;
  }
};
