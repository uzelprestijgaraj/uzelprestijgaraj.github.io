// Firebase bağlantı ayarları
const firebaseConfig = {
  apiKey: "AIzaSyA_RJyKfjzv2LICbo27GlsyxcEx6A4trRo",
  authDomain: "uzel-prestij-garaj.firebaseapp.com",
  projectId: "uzel-prestij-garaj",
  storageBucket: "uzel-prestij-garaj.firebasestorage.app",
  messagingSenderId: "970518621544",
  appId: "1:970518621544:web:c1c26307c2a69c05293add",
  measurementId: "G-3JMZHLFY6Y"
};

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);

// Servisler
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();