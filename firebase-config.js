// Firebase bağlantı ayarları
const firebaseConfig = {
  apiKey: "AIzaSyA_RJyKfjzv2lICbo27GlsyxcEx6A4trRo",
  authDomain: "uzel-prestij-garaj.firebaseapp.com",
  projectId: "uzel-prestij-garaj",
  storageBucket: "uzel-prestij-garaj.firebasestorage.app",
  messagingSenderId: "970518621544",
  appId: "1:970518621544:web:e8cdfd85a7b442ff293add"
};

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);

// Servisler
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
