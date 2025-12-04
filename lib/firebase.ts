import { getApp, getApps, initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAPmGLyMQWh17wtcBexJm8vulBvBi8yxak",
    authDomain: "mangroveapp-d5409.firebaseapp.com",
    databaseURL: "https://mangroveapp-d5409-default-rtdb.firebaseio.com",
    projectId: "mangroveapp-d5409",
    storageBucket: "mangroveapp-d5409.firebasestorage.app",
    messagingSenderId: "406030584238",
    appId: "1:406030584238:web:830b3278b345eff2d1e03f",
    measurementId: "G-RT0BCEFHET"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const db = getDatabase(app);
const storage = getStorage(app);

export { app, db, storage, firebaseConfig };

