import { FirebaseApp } from 'firebase/app';
import { Auth, GoogleAuthProvider } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

// Firebase je momentálne vypnutý pre LocalStorage režim.
const app: FirebaseApp | undefined = undefined;
const auth: Auth | undefined = undefined;
const db: Firestore | undefined = undefined;
const googleProvider: GoogleAuthProvider | undefined = undefined;

console.log('Firebase disabled. App running in LocalStorage mode.');

export { auth, db, googleProvider };