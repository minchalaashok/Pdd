import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../config/firebase';

/**
 * Firebase Authentication & Firestore Service for LifeLink
 */

export const firebaseAuthService = {
  async register(userData) {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase credentials are not configured. Falling back to local backend/mock authentication.');
    }

    const { email, password, full_name, role, phone, city, blood_group, organ_needed, organs_registered, hospital_name, license_number } = userData;

    // 1. Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Update display name
    await updateProfile(user, { displayName: full_name || email.split('@')[0] });

    // 3. Create Firestore User Profile document
    const userProfile = {
      uid: user.uid,
      email: email.toLowerCase(),
      full_name: full_name || '',
      role: role || 'donor',
      phone: phone || '',
      city: city || 'Mumbai',
      blood_group: blood_group || 'O+',
      organ_needed: organ_needed || '',
      organs_registered: organs_registered || '',
      hospital_name: role === 'hospital' ? hospital_name || 'General Hospital' : '',
      license_number: license_number || '',
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);

    // If role is donor, add entry to donors collection
    if (role === 'donor') {
      await setDoc(doc(db, 'donors', user.uid), {
        uid: user.uid,
        name: full_name,
        blood_group: blood_group || 'O+',
        organs: organs_registered ? organs_registered.split(',') : ['Kidney'],
        city: city || 'Mumbai',
        status: 'Available',
        created_at: new Date().toISOString()
      });
    }

    return {
      success: true,
      user: userProfile,
      token: await user.getIdToken()
    };
  },

  async login(email, password) {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Falling back to local backend.');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch user profile from Firestore
    const userDocSnap = await getDoc(doc(db, 'users', user.uid));
    
    let userProfile;
    if (userDocSnap.exists()) {
      userProfile = userDocSnap.data();
    } else {
      userProfile = {
        uid: user.uid,
        email: user.email,
        full_name: user.displayName || user.email.split('@')[0],
        role: 'donor',
        is_verified: true,
        created_at: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', user.uid), userProfile);
    }

    const token = await user.getIdToken();
    return {
      success: true,
      user: userProfile,
      token
    };
  },

  async logout() {
    if (isFirebaseConfigured()) {
      await firebaseSignOut(auth);
    }
  },

  async resetPassword(email) {
    if (isFirebaseConfigured()) {
      await sendPasswordResetEmail(auth, email);
    }
  }
};

/**
 * Firestore Database Operations for LifeLink Collections
 */
export const firebaseFirestoreService = {
  async getCollection(collectionName) {
    if (!isFirebaseConfigured()) return [];
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async addDocument(collectionName, data) {
    if (!isFirebaseConfigured()) return null;
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      created_at: serverTimestamp()
    });
    return docRef.id;
  },

  async updateDocument(collectionName, docId, data) {
    if (!isFirebaseConfigured()) return;
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updated_at: serverTimestamp()
    });
  },

  async getWhere(collectionName, field, operator, value) {
    if (!isFirebaseConfigured()) return [];
    const q = query(collection(db, collectionName), where(field, operator, value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  }
};
