import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDarr-k8k2XkGr6ea301ciVDKd7cdqKxZI",
  authDomain: "kolp-capstone.firebaseapp.com",
  projectId: "kolp-capstone",
  storageBucket: "kolp-capstone.firebasestorage.app",
  messagingSenderId: "813957490880",
  appId: "1:813957490880:web:d5ec4fa0030fffcab16525",
  measurementId: "G-K1BFH587TS",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);