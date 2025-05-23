
import { db, APP_ID } from '@/lib/firebase-config';
import type { Auth, UserCredential } from 'firebase/auth';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { collection, addDoc, query, onSnapshot, doc, deleteDoc, serverTimestamp, orderBy, Timestamp, setDoc } from 'firebase/firestore';
import type { BannerData, SavedBannerData, AiContentData, AmazonContentData } from '@/lib/types';

// --- Authentication ---
export const emailPasswordSignUp = async (auth: Auth, email: string, password: string): Promise<UserCredential> => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const emailPasswordSignIn = async (auth: Auth, email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const appSignOut = async (auth: Auth): Promise<void> => {
  return firebaseSignOut(auth);
};

// --- Banners ---
export const saveBannerToFirestore = async (userId: string, bannerData: BannerData): Promise<string> => {
  if (!userId) throw new Error("User not authenticated.");
  const sanitizedBannerData = Object.fromEntries(
    Object.entries(bannerData).filter(([, value]) => value !== undefined)
  );
  const bannersCollectionRef = collection(db, `artifacts/${APP_ID}/users/${userId}/banners`);
  const docRef = await addDoc(bannersCollectionRef, { 
    ...sanitizedBannerData, 
    createdAt: serverTimestamp() 
  });
  return docRef.id;
};

export const getUserBanners = (
  userId: string,
  callback: (banners: SavedBannerData[]) => void,
  onError: (error: Error) => void
): (() => void) => {
  if (!userId) {
    // Non chiamare onError qui, semplicemente non recuperare i banner se non c'è userId
    // La UI gestirà lo stato di "utente non loggato"
    callback([]); // Restituisce un array vuoto se non c'è utente
    return () => {};
  }
  const userBannersCollectionRef = collection(db, `artifacts/${APP_ID}/users/${userId}/banners`);
  const q = query(userBannersCollectionRef, orderBy("createdAt", "desc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const banners = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        } as SavedBannerData;
    });
    callback(banners);
  }, (error) => {
    console.error("[firebase-service] Error fetching banners:", error);
    onError(error);
  });

  return unsubscribe;
};

export const deleteBannerFromFirestore = async (userId: string, bannerId: string): Promise<void> => {
  if (!userId) throw new Error("User not authenticated.");
  const bannerDocRef = doc(db, `artifacts/${APP_ID}/users/${userId}/banners`, bannerId);
  await deleteDoc(bannerDocRef);
};

// --- Shared Content ---
export const shareAiContentToFirestore = async (userId: string, contentData: Omit<AiContentData, 'id' | 'sharedBy' | 'sharedAt'>): Promise<string> => {
  if (!userId) {
    console.error("[firebase-service] shareAiContentToFirestore called without userId.");
    throw new Error("User not authenticated for sharing AI content.");
  }
  const sharedAiContentCollectionRef = collection(db, `artifacts/${APP_ID}/public/sharedAiContent`);
  const docRef = await addDoc(sharedAiContentCollectionRef, {
    ...contentData,
    sharedBy: userId,
    sharedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const shareAmazonContentToFirestore = async (userId: string, contentData: Omit<AmazonContentData, 'id' | 'sharedBy' | 'sharedAt'>): Promise<string> => {
  if (!userId) {
    console.error("[firebase-service] shareAmazonContentToFirestore called without userId.");
    throw new Error("User not authenticated for sharing Amazon content.");
  }
  const sharedAmazonContentCollectionRef = collection(db, `artifacts/${APP_ID}/public/sharedAmazonContent`);
  const docRef = await addDoc(sharedAmazonContentCollectionRef, {
    ...contentData,
    sharedBy: userId,
    sharedAt: serverTimestamp(),
  });
  return docRef.id;
};
