// Replace with your actual Firebase config
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCHaFVOA7NENAS9KQtNSeMHYuxSmq0g-YM',
  authDomain: 'splitbill-8caa8.firebaseapp.com',
  projectId: 'splitbill-8caa8',
  appId: '1:541093318762:web:21dad9f93127ad636a7a13',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
