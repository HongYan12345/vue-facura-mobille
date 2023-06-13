import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAxUj6C6LBIzBJ48gLJcQKYx5cB8_ZW1pc",
    authDomain: "vuefactura.firebaseapp.com",
    projectId: "vuefactura",
    storageBucket: "vuefactura.appspot.com",
    messagingSenderId: "43881118264",
    appId: "1:43881118264:web:beff07938c5a3a8fbd84cd",
    measurementId: "G-XH8HMT3M0M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);
console.log("init db")

export { db };