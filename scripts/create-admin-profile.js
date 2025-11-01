// Create admin profile in Firestore
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

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

async function createAdminProfile() {
  try {
    console.log('📝 Creating admin profile in Firestore...');
    
    await setDoc(doc(db, 'profiles', '8SL2Eq5KcvZQnhmJxeI8rhD9Epv1'), {
      id: '8SL2Eq5KcvZQnhmJxeI8rhD9Epv1',
      email: 'fbozdag1989@gmail.com',
      full_name: 'Fatih Bozdag',
      role: 'admin',
      permissions: {
        canCreateQuestions: true,
        canManageUsers: true, 
        canViewAnalytics: true,
        canModerateContent: true,
        canAccessAdminPanel: true
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    console.log('✅ Admin profile created successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdminProfile();
