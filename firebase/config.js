import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAmFAR0r0-QB1Fj0Gi0rmSLwN8Xu7MKNgI",
  authDomain: "project-crm-342b0.firebaseapp.com",
  projectId: 'project-crm-342b0',
  appId: '1:216099338217:web:de3eeffe3bcda54e803d78',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account',
});

export const googleProvider = provider;