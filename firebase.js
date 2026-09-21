// Existing ARMS Firebase project. Public web-app identifiers; authorization is enforced by Firebase rules.
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyD4q-miaUBqueH4U6NoQeJlPGPh_jxwK1I",
  authDomain: "arms-1eff6.firebaseapp.com",
  projectId: "arms-1eff6",
  storageBucket: "arms-1eff6.firebasestorage.app",
  messagingSenderId: "964016133777",
  appId: "1:964016133777:web:cd99fc553b937f76e09130",
  measurementId: "G-200MES0NPT"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

