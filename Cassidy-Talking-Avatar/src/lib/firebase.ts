import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  User,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { encrypt, decrypt } from './crypto/encryption';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Sign in with Google
export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Create user document if it doesn't exist
    await createUserDocument(user);
    
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Create user document in Firestore
const createUserDocument = async (user: User): Promise<void> => {
  if (!user) return;
  
  const userDocRef = doc(db, 'users', user.uid);
  const userSnapshot = await getDoc(userDocRef);
  
  if (!userSnapshot.exists()) {
    const { displayName, email, photoURL } = user;
    try {
      await setDoc(userDocRef, {
        displayName,
        email,
        photoURL,
        userHistory: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  }
};

// Message history interface
export interface MessageHistoryItem {
  message: string;
  role: 'user' | 'assistant';
}

// Helper function to decrypt message history
async function decryptMessageHistory(encryptedHistory: any[], userEmail: string): Promise<MessageHistoryItem[]> {
  const decryptedHistory: MessageHistoryItem[] = []
  
  for (const item of encryptedHistory) {
    try {
      let message = ""
      
      // Decrypt the message if it's encrypted
      if (item.encryptedMessage) {
        message = await decrypt(item.encryptedMessage, userEmail)
      } else {
        // Fallback to unencrypted message for backward compatibility
        message = item.message || "Unable to decrypt message"
      }
      
      decryptedHistory.push({
        message,
        role: item.role
      })
    } catch (error) {
      console.error("Error decrypting message:", error)
      // Add a fallback message if decryption fails
      decryptedHistory.push({
        message: "Unable to decrypt message",
        role: item.role || 'user'
      })
    }
  }
  
  return decryptedHistory
}

// Helper function to encrypt message history
async function encryptMessageHistory(history: MessageHistoryItem[], userEmail: string): Promise<any[]> {
  const encryptedHistory = []
  
  for (const item of history) {
    try {
      const encryptedMessage = await encrypt(item.message, userEmail)
      encryptedHistory.push({
        encryptedMessage,
        role: item.role
      })
    } catch (error) {
      console.error("Error encrypting message:", error)
      // Fallback to unencrypted for this item if encryption fails
      encryptedHistory.push({
        message: item.message,
        role: item.role
      })
    }
  }
  
  return encryptedHistory
}


// Get message history for a user
export const getMessageHistory = async (
): Promise<MessageHistoryItem[]> => {
  try {
    let userId = auth.currentUser?.uid;
    let userEmail = auth.currentUser?.email;
    
    if (!userId || !userEmail) {
      const currentUser = await waitForAuthState()
      if(currentUser){
        userId = currentUser.uid;
        userEmail = currentUser.email;
      }else{
      throw new Error('User is not authenticated');
    }}
    
    const userDocRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userDocRef);
    
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      const encryptedHistory = userData.userHistory || [];
      
      // Decrypt the message history before returning
      return await decryptMessageHistory(encryptedHistory, userEmail);
    } else {
      console.log('No user document found');
      return [];
    }
  } catch (error) {
    console.error('Error getting message history:', error);
    throw error;
  }
};

// Add a single message to history
export const addMessageToHistory = async (
  newMessage: MessageHistoryItem
): Promise<void> => {
  try {
    const userId = auth.currentUser?.uid;
    const userEmail = auth.currentUser?.email;
    
    if (!userId || !userEmail) {
      throw new Error('User is not authenticated');
    }
    const prevMessage = await getMessageHistory();
    if(newMessage == prevMessage[prevMessage.length - 1] || (prevMessage.length >= 2 && newMessage == prevMessage[prevMessage.length - 2])){
      console.log("Message already exists in history, skipping addition.");
      return
    }
    console.log(prevMessage[prevMessage.length - 1], newMessage)
    
    // Get the current encrypted history directly from Firestore
    const userDocRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userDocRef);
    
    let currentEncryptedHistory = [];
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      currentEncryptedHistory = userData.userHistory || [];
    }
    
    // Encrypt only the new message
    const encryptedNewMessage = await encrypt(newMessage.message, userEmail);
    const newEncryptedItem = {
      encryptedMessage: encryptedNewMessage,
      role: newMessage.role
    };
    
    // Add the new encrypted message to the existing encrypted history
    const updatedEncryptedHistory = [...currentEncryptedHistory, newEncryptedItem];
    
    await updateDoc(userDocRef, {
      userHistory: updatedEncryptedHistory,
      updatedAt: serverTimestamp()
    });
    console.log('Message added to history successfully');
    const updateRef = doc(db, "users", userId)

    await updateDoc(updateRef, {
      updatePersona: true
    })
    
    //track progress
    fetch( "https://cassidyadk-d5afltb5ba-em.a.run.app/track_progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "user_id": userId,
      }),
    })
    
  } catch (error) {
    console.error('Error adding message to history:', error);
    throw error;
  }
};


// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const waitForAuthState = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChange((user) => {
      unsubscribe(); // Clean up listener
      resolve(user);
    });
  });
};
export const requireAuth = async (redirectTo: string = '/login') => {
  const user = await waitForAuthState();
  
  if (!user) {
    // Redirect to login page
    window.location.href = redirectTo;
    return false;
  }
  
  return true;
};
export default app;