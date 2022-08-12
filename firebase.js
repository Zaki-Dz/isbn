import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAyzOTBKEG7HFMm4k9Pi9ulC2jZuDjcEiQ",
  authDomain: "phonic-obelisk-317915.firebaseapp.com",
  databaseURL:
    "https://phonic-obelisk-317915-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "phonic-obelisk-317915",
  storageBucket: "phonic-obelisk-317915.appspot.com",
  messagingSenderId: "74712443565",
  appId: "1:74712443565:web:a993daf35ac92a3d087424",
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);

export const auth = getAuth(app);
