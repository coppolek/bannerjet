
import { db } from '@/lib/firebase-config';
import type { Auth, UserCredential } from 'firebase/auth';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  doc, 
  deleteDoc, 
  serverTimestamp, 
  orderBy, 
  Timestamp, 
  setDoc,
  updateDoc,
  getDoc 
} from 'firebase/firestore';
import type { BannerData, SavedBannerData, AiContentData, AmazonContentData, SocialLinks, UserProfile } from '@/lib/types';

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

// --- User Profile & Social Links ---
export const updateUserSocialLinks = async (userId: string, socialLinks: SocialLinks): Promise<void> => {
  if (!userId) throw new Error("User not authenticated.");
  const userDocRef = doc(db, `users/${userId}`);
  // Use updateDoc to avoid overwriting other fields like isAdmin, email, createdAt
  await updateDoc(userDocRef, { socialLinks }); 
};

export const getUserSocialLinks = async (userId: string): Promise<SocialLinks | undefined> => {
  if (!userId) return undefined;
  const userDocRef = doc(db, `users/${userId}`);
  const docSnap = await getDoc(userDocRef);
  if (docSnap.exists()) {
    const userData = docSnap.data() as UserProfile;
    return userData.socialLinks;
  }
  return undefined;
};

// --- Banners ---
export const saveBannerToFirestore = async (userId: string, bannerData: BannerData): Promise<string> => {
  console.log("[firebase-service] saveBannerToFirestore called. User ID:", userId);
  if (!userId) {
    console.error("[firebase-service] saveBannerToFirestore called without userId.");
    throw new Error("User not authenticated for saving banner.");
  }
  const sanitizedBannerData = Object.fromEntries(
    Object.entries(bannerData).filter(([, value]) => value !== undefined)
  );
  const bannersCollectionRef = collection(db, `users/${userId}/banners`);
  const docRef = await addDoc(bannersCollectionRef, { 
    ...sanitizedBannerData, 
    createdAt: serverTimestamp() 
  });
  console.log("[firebase-service] Banner saved to Firestore. Doc ID:", docRef.id);
  return docRef.id;
};

export const getUserBanners = (
  userId: string,
  callback: (banners: SavedBannerData[]) => void,
  onError: (error: Error) => void
): (() => void) => {
  if (!userId) {
    callback([]); 
    return () => {};
  }
  const userBannersCollectionRef = collection(db, `users/${userId}/banners`);
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
  const bannerDocRef = doc(db, `users/${userId}/banners`, bannerId);
  await deleteDoc(bannerDocRef);
};

// --- Shared Content ---
export const shareAiContentToFirestore = async (userId: string, contentData: Omit<AiContentData, 'id' | 'sharedBy' | 'sharedAt'>): Promise<string> => {
  console.log("[firebase-service] shareAiContentToFirestore called. User ID:", userId);
  if (!userId) {
    console.error("[firebase-service] shareAiContentToFirestore called without userId.");
    throw new Error("User not authenticated for sharing AI content.");
  }
  const sharedAiContentCollectionRef = collection(db, "publicSharedAiContent");
  const docRef = await addDoc(sharedAiContentCollectionRef, {
    ...contentData,
    sharedBy: userId, 
    sharedAt: serverTimestamp(),
  });
  console.log("[firebase-service] AI Content shared to Firestore. Doc ID:", docRef.id);
  return docRef.id;
};

export const shareAmazonContentToFirestore = async (userId: string, contentData: Omit<AmazonContentData, 'id' | 'sharedBy' | 'sharedAt'>): Promise<string> => {
  console.log("[firebase-service] shareAmazonContentToFirestore called. User ID:", userId);
  if (!userId) {
    console.error("[firebase-service] shareAmazonContentToFirestore called without userId.");
    throw new Error("User not authenticated for sharing Amazon content.");
  }
  const sharedAmazonContentCollectionRef = collection(db, "publicSharedAmazonContent");
  const docRef = await addDoc(sharedAmazonContentCollectionRef, {
    ...contentData,
    sharedBy: userId,
    sharedAt: serverTimestamp(),
  });
  console.log("[firebase-service] Amazon Content shared to Firestore. Doc ID:", docRef.id);
  return docRef.id;
};
