// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDBmv2t6tB_LwdQLMXmtQQPjaKDjOE8w_U",
  authDomain: "tuckshop-preorder.firebaseapp.com",
  databaseURL: "https://tuckshop-preorder-default-rtdb.firebaseio.com",
  projectId: "tuckshop-preorder",
  storageBucket: "tuckshop-preorder.firebasestorage.app",
  messagingSenderId: "781439361302",
  appId: "1:781439361302:web:c4934745468ffb9718f037",
  measurementId: "G-CZL8PFF61P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
