// Admin account creation script
// Run this with: node scripts/create-admin.js

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Firebase config (same as in .env.local)
const firebaseConfig = {
  apiKey: "AIzaSyC9BKoqgdsRBiozhglIUxgL77cOvMGtrvA",
  authDomain: "yds-platform-ab83d.firebaseapp.com", 
  projectId: "yds-platform-ab83d",
  storageBucket: "yds-platform-ab83d.firebasestorage.app",
  messagingSenderId: "84122935363",
  appId: "1:84122935363:web:9b9c22bc715725b5f074f6",
  measurementId: "G-G1C4DNNYNZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminAccount() {
  try {
    console.log('🔥 Creating admin account...');
    
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      'fbozdag1989@gmail.com', 
      'FA89atih.!'
    );
    
    const user = userCredential.user;
    console.log('✅ Admin user created with ID:', user.uid);
    
    // Update display name
    await updateProfile(user, {
      displayName: 'Fatih Bozdag (Admin)'
    });
    
    // Create admin profile in Firestore
    await setDoc(doc(db, 'profiles', user.uid), {
      id: user.uid,
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
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    
    console.log('✅ Admin profile created in Firestore');
    console.log('');
    console.log('🎉 Admin Account Created Successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: fbozdag1989@gmail.com');
    console.log('🔑 Role: admin');
    console.log('👤 Name: Fatih Bozdag');
    console.log('🆔 UID:', user.uid);
    console.log('');
    console.log('✨ You can now sign in with these credentials!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating admin account:', error.message);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('💡 Email already exists. User may already be created.');
    }
    
    process.exit(1);
  }
}

createAdminAccount();
