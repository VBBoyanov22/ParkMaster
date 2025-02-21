import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDtiKVaSNMLzrIIQDu1CXip2Exzhss0it4",
  authDomain: "parkmaster-ef5ac.firebaseapp.com",
  projectId: "parkmaster-ef5ac",
  storageBucket: "parkmaster-ef5ac.appspot.com",
  messagingSenderId: "404576962945",
  appId: "1:404576962945:web:1a874ab6245bd84d2f0080",
  measurementId: "G-967S11S32Y",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
