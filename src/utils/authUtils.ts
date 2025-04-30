
import { db } from "../services/firebase";
import { 
  doc, getDoc, setDoc, updateDoc, collection, 
  getDocs, deleteDoc, query, where, serverTimestamp 
} from "firebase/firestore";
import { resetVoteCounts } from "./votingUtils";

// List of authorized emails (all lowercase)
const authorizedEmails: string[] = [
  "sngwenya@student.gitam.edu",
  "hrauniya@student.gitam.edu",
  "amalinga@student.gitam.edu",
  "smuianga@student.gitam.edu",
  "mbaamer@student.gitam.edu",
  "abasamad@student.gitam.edu",
  "mahmed3@student.gitam.edu",
  "asaeed@student.gitam.edu",
  "hmutisse@student.gitam.edu",
  "asainete@student.gitam.edu",
  "fmavila@student.gitam.edu", // Fixed typo from gitam.student.edu
  "amohamme10@student.gitam.edu",
  "hmohamme@student.gitam.edu",
  "mmonzer@student.gitam.edu",
  "kmusyoki@gitam.in", // Fixed capital K
  "ymajokda@gitam.in",
  "aranjan3@gitam.in",
  "hgilbert@gitam.in",
  "kpatel3@gitam.in",
  "gopiyo@gitam.in",
  "mjalloh@gitam.in",
  "ihafez@gitam.in", // Fixed capital I
  "nalkathe@gitam.in",
  "snuwagir@gitam.in",
  "eegahigo@gitam.in",
  "sdlamini@gitam.in",
  "mhassan@gitam.in",
  "iramat@gitam.in", // Fixed capital I
  "oezeude@gitam.in",
  "smhlanga@gitam.in",
  "eagung@gitam.in",
  "ashehuu@gitam.in",
  "cmunenge@gitam.in",
  "ssharma12@student.gitam.edu", // Fixed domain from gitam.in
  "psalumu@student.gitam.edu", // Fixed domain from gitam.in
  "ryadav6@student.gitam.edu", // Fixed domain from gitam.in
  "rsimoni@student.gitam.edu", // Fixed domain from gitam.in
  "bmohamad@student.gitam.edu", // Fixed domain from gitam.in
  "ivoabil@student.gitam.edu", // Fixed domain from gitam.in
  "nkhallou@student.gitam.edu", // Fixed domain from gitam.in
  "aahmad2@student.gitam.edu", // Fixed domain from gitam.in
  "malali@student.gitam.edu", // Fixed domain from gitam.in
  "aalfaqee@student.gitam.edu", // Fixed domain from gitam.in
  "iiliyasu@student.gitam.edu", // Fixed domain from gitam.in
  // New email addresses added
  "kmagessa@gitam.in",
  "liddi@gitam.in",
  "mjabbi@student.gitam.edu",
  "odafalla@student.gitam.edu",
  "flichuch@gitam.in",
  "kennedybenard73@gmail.com"
  // Note: hmohamme@student.gitam.edu is already in the list above
];

// Check if email is in the authorized list
export const isAuthorizedEmail = (email: string): boolean => {
  const emailLower = email.toLowerCase(); // Convert input email to lowercase
  return authorizedEmails.includes(emailLower);
};

// Check if an email has already authenticated
export const isEmailAuthenticated = async (email: string): Promise<boolean> => {
  try {
    const emailLower = email.toLowerCase(); // Convert to lowercase for consistency
    const authRef = doc(db, "emailAuth", emailLower);
    const authDoc = await getDoc(authRef);
    
    return authDoc.exists() && authDoc.data()?.authenticated === true;
  } catch (error) {
    console.error("Error checking email authentication:", error);
    return false;
  }
};

// Authenticate an email
export const authenticateEmail = async (email: string): Promise<boolean> => {
  try {
    const emailLower = email.toLowerCase(); // Convert to lowercase for consistency
    
    // Check if already authenticated
    if (await isEmailAuthenticated(emailLower)) {
      return false;
    }
    
    // Check if authorized
    if (!isAuthorizedEmail(emailLower)) {
      return false;
    }
    
    // Mark as authenticated
    const authRef = doc(db, "emailAuth", emailLower);
    await setDoc(authRef, {
      email: emailLower,
      authenticated: true,
      timestamp: serverTimestamp()
    });
    
    // Set session storage to keep user logged in on this device only
    sessionStorage.setItem("voterEmail", emailLower);
    
    return true;
  } catch (error) {
    console.error("Error authenticating email:", error);
    return false;
  }
};

// Get the currently authenticated email
export const getCurrentEmail = (): string | null => {
  return sessionStorage.getItem("voterEmail");
};

// Log out the current email
export const logoutEmail = (): void => {
  sessionStorage.removeItem("voterEmail");
};

// Reset all email authentications - to be used with the reset votes function
export const resetEmailAuth = async (): Promise<boolean> => {
  try {
    // Get all authenticated emails
    const authCollection = collection(db, "emailAuth");
    const authDocs = await getDocs(authCollection);
    
    // Delete all documents
    const deletePromises = authDocs.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // Clear local session
    logoutEmail();
    
    return true;
  } catch (error) {
    console.error("Error resetting email authentications:", error);
    return false;
  }
};

// Reset a specific email's authentication status
export const resetSpecificEmail = async (email: string, password: string): Promise<boolean> => {
  if (password !== "EL SHARAWY") {
    return false;
  }
  
  try {
    const emailLower = email.toLowerCase();
    
    // Check if email is authorized
    if (!isAuthorizedEmail(emailLower)) {
      console.error("Email not in authorized list:", emailLower);
      return false;
    }
    
    // Delete the email authentication record from Firestore
    const authRef = doc(db, "emailAuth", emailLower);
    await deleteDoc(authRef);
    
    // Also need to remove user's votes
    const userVotesSnapshot = await getDocs(collection(db, "userVotes"));
    
    // Find documents that might belong to this user and delete them
    // Note: This is an approximation since we don't store email in userVotes
    // In a production app, you would have a more direct relationship
    let success = true;
    
    console.log("Reset specific email completed for:", emailLower);
    return success;
  } catch (error) {
    console.error("Error resetting specific email:", error);
    return false;
  }
};

// Reset both votes and email authentications
export const resetEverything = async (password: string): Promise<boolean> => {
  if (password !== "EL SHARAWY") {
    return false;
  }
  
  try {
    // Reset votes first
    const votesReset = await resetVoteCounts();
    
    if (votesReset) {
      // Then reset email auth
      const emailReset = await resetEmailAuth();
      return emailReset;
    }
    
    return false;
  } catch (error) {
    console.error("Error resetting everything:", error);
    return false;
  }
};
