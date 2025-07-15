import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth , onAuthStateChanged } from "firebase/auth";


const firebaseConfig = {
    apiKey: "AIzaSyBunYAbzJ9hD6x6_kA3BqcKChXzwVRdsuM",
    authDomain: "cubemasters-a54b7.firebaseapp.com",
    projectId: "cubemasters-a54b7",
    storageBucket: "cubemasters-a54b7.firebasestorage.app",
    messagingSenderId: "194056847232",
    appId: "1:194056847232:web:5deaaaa03e7b1fc6ed4b65",
    measurementId: "G-KSG03GL2B7"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export { onAuthStateChanged };