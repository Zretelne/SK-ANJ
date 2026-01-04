import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// TOTO SI MUSÍŠ VYPLNIŤ PODĽA SVOJEJ FIREBASE KONZOLY
// Choď na console.firebase.google.com -> Project Settings -> General -> Your apps
const firebaseConfig = {
  apiKey: "AIzaSyBz2Mmj7Nl4fR6Jj6uaU6LI5jdBR3J66-A",
  authDomain: "sk-anj.firebaseapp.com",
  projectId: "sk-anj",
  storageBucket: "sk-anj.firebasestorage.app",
  messagingSenderId: "636040798438",
  appId: "1:636040798438:web:562db28ee7106e8f9f9b27",
  measurementId: "G-B53N1NRN20"
};

// Inicializácia iba ak máme config (aby aplikácia nespadla, ak to ešte nemáš nastavené)
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let googleProvider: GoogleAuthProvider | undefined;

try {
  // Kontrola, či je config vyplnený (naivná kontrola dĺžky)
  if (firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10 && !firebaseConfig.apiKey.includes('AIzaSy...')) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    console.log('Firebase initialized successfully');
  } else {
    console.warn('Firebase config is missing or invalid. App allows usage but will fallback to LocalStorage only.');
  }
} catch (e) {
  console.error('Error initializing Firebase:', e);
}

export { auth, db, googleProvider };