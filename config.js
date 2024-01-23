import { getDatabase } from "firebase/database";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDLVNn0-LU5BBabTFyCIrRvffB1J0MqkrY",
  authDomain: "home-automation-740ec.firebaseapp.com",
  databaseURL: "https://home-automation-740ec-default-rtdb.firebaseio.com",
  projectId: "home-automation-740ec",
  storageBucket: "home-automation-740ec.appspot.com",
  messagingSenderId: "141649558064",
  appId: "1:141649558064:web:727d608a2f3dc825144bf5",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
