const firebaseConfig = {
  apiKey: "AIzaSyA_RJyKfjzv2lICbo27GlsyxcEx6A4trRo",
  authDomain: "uzel-prestij-garaj.firebaseapp.com",
  projectId: "uzel-prestij-garaj",
  storageBucket: "uzel-prestij-garaj.firebasestorage.app",
  messagingSenderId: "970518621544",
  appId: "1:970518621544:web:97b1034977a77ff6293add",
  measurementId: "G-Z0EEHH99XH"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
