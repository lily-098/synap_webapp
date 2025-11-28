import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAEY0AMMQqw76ueTr2R94XYatVuiCBLJLI",
  authDomain: "synapauth1.firebaseapp.com",
  projectId: "synapauth1",
  storageBucket: "synapauth1.firebasestorage.app",
  messagingSenderId: "622035420074",
  appId: "1:622035420074:web:16776f3dcfb25bbc4761d3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth instance
export const auth = getAuth(app);

// Google provider
export const googleProvider = new GoogleAuthProvider();
