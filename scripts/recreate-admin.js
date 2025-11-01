// Recreate admin account with better error handling
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyC9BKoqgdsRBiozhglIUxgL77cOvMGtrvA",
  authDomain: "yds-platform-ab83d.firebaseapp.com", 
  projectId: "yds-platform-ab83d",
  storageBucket: "yds-platform-ab83d.firebasestorage.app",
  messagingSenderId: "84122935363",
  appId: "1:84122935363:web:9b9c22bc715725b5f074f6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function recreateAdmin() {
  const email = 'fbozdag1989@gmail.com';
  const password = 'FA89atih.!';
  
  try {
    console.log('🔑 Testing existing login...');
    
    // First try to sign in (maybe user already exists)
    try {
      const existing = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ User already exists! UID:', existing.user.uid);
      
      // Create/update profile
      await setDoc(doc(db, 'profiles', existing.user.uid), {
        id: existing.user.uid,
        email: email,
        full_name: 'Fatih Bozdag',
        role: 'admin',
        permissions: {
          canCreateQuestions: true,
          canManageUsers: true,
          canViewAnalytics: true,
          canModerateContent: true,
          canAccessAdminPanel: true
        },
        created_at: new Date().toISOString()
      });
      
      console.log('✅ Profile updated in Firestore');
      console.log('🎉 Ready to login with:', email);
      
    } catch (signInError) {
      console.log('⚠️ User doesn\'t exist, creating new...');
      
      // Create new user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ New admin created! UID:', user.uid);
      
      // Create profile
      await setDoc(doc(db, 'profiles', user.uid), {
        id: user.uid,
        email: email,
        full_name: 'Fatih Bozdag',
        role: 'admin',
        permissions: {
          canCreateQuestions: true,
          canManageUsers: true,
          canViewAnalytics: true,
          canModerateContent: true,
          canAccessAdminPanel: true
        },
        created_at: new Date().toISOString()
      });
      
      console.log('✅ Profile created in Firestore');
      console.log('🎉 Ready to login with:', email);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.code, error.message);
    process.exit(1);
  }
}

recreateAdmin();
