import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            ?? 'AIzaSyBpiGb8lOhiPoKR50AfrcJtgemqQUT2WpM',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        ?? 'askussolutions-ad063.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         ?? 'askussolutions-ad063',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     ?? 'askussolutions-ad063.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '624094388729',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             ?? '1:624094388729:web:af5d9a53a15bb1143ddd28',
};

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
