import firebase from 'firebase'
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
    apiKey: "AIzaSyDFdufe8a1esRNZxo55kDixOhuzpEg2rf0",
    authDomain: "timecounter-3e1ea.firebaseapp.com",
    projectId: "timecounter-3e1ea",
    storageBucket: "timecounter-3e1ea.appspot.com",
    messagingSenderId: "1043908992178",
    appId: "1:1043908992178:web:07ca67acb0ae1311177dab",
    measurementId: "G-X84QZVRERM"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
const db = firebase.firestore()
db.settings({timestampsInSnapshot: true})

export default firebase
