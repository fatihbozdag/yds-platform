// Test Firestore connection
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyC9BKoqgdsRBiozhglIUxgL77cOvMGtrvA",
  authDomain: "yds-platform-ab83d.firebaseapp.com", 
  projectId: "yds-platform-ab83d",
  storageBucket: "yds-platform-ab83d.firebasestorage.app",
  messagingSenderId: "84122935363",
  appId: "1:84122935363:web:9b9c22bc715725b5f074f6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirestore() {
  try {
    console.log('🔥 Testing Firestore connection...');
    
    // Try to read profiles collection
    console.log('📋 Listing profiles collection...');
    const profilesSnapshot = await getDocs(collection(db, 'profiles'));
    
    console.log(`✅ Found ${profilesSnapshot.size} profiles`);
    
    profilesSnapshot.forEach((doc) => {
      console.log(`📄 Profile ID: ${doc.id}`);
      console.log(`📊 Data:`, doc.data());
    });
    
    // Try to read specific admin profile
    console.log('\n🔍 Reading admin profile...');
    const adminDoc = await getDoc(doc(db, 'profiles', '8SL2Eq5KcvZQnhmJxeI8rhD9Epv1'));
    
    if (adminDoc.exists()) {
      console.log('✅ Admin profile found!');
      console.log('📊 Admin data:', adminDoc.data());
    } else {
      console.log('❌ Admin profile not found');
    }
    
    console.log('\n🎉 Firestore test completed successfully!');
    
  } catch (error) {
    console.error('❌ Firestore test failed:', error.message);
    console.error('Error code:', error.code);
  }
}

testFirestore();
