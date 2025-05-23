
import { db, APP_ID } from '@/lib/firebase-config';
import type { Auth } from 'firebase/auth';
import { collection, addDoc, query, onSnapshot, doc, deleteDoc, serverTimestamp, orderBy, Timestamp, setDoc } from 'firebase/firestore';
import type { BannerData, SavedBannerData, AiContentData, AmazonContentData } from '@/lib/types';

// Banners
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
    onError(new Error("User not authenticated for fetching banners."));
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
            // Convert Firestore Timestamp to ISO string if it exists
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        } as SavedBannerData;
    });
    callback(banners);
  }, (error) => {
    console.error("Error fetching banners:", error);
    onError(error);
  });

  return unsubscribe;
};

export const deleteBannerFromFirestore = async (userId: string, bannerId: string): Promise<void> => {
  if (!userId) throw new Error("User not authenticated.");
  const bannerDocRef = doc(db, `artifacts/${APP_ID}/users/${userId}/banners`, bannerId);
  await deleteDoc(bannerDocRef);
};

// Shared Content
export const shareAiContentToFirestore = async (userId: string, contentData: Omit<AiContentData, 'id' | 'sharedBy' | 'sharedAt'>): Promise<string> => {
  const sharedAiContentCollectionRef = collection(db, `artifacts/${APP_ID}/public/sharedAiContent`);
  const docRef = await addDoc(sharedAiContentCollectionRef, {
    ...contentData,
    sharedBy: userId || "anonymous",
    sharedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const shareAmazonContentToFirestore = async (userId: string, contentData: Omit<AmazonContentData, 'id' | 'sharedBy' | 'sharedAt'>): Promise<string> => {
  const sharedAmazonContentCollectionRef = collection(db, `artifacts/${APP_ID}/public/sharedAmazonContent`);
  const docRef = await addDoc(sharedAmazonContentCollectionRef, {
    ...contentData,
    sharedBy: userId || "anonymous",
    sharedAt: serverTimestamp(),
  });
  return docRef.id;
};
