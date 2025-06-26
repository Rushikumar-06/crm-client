
'use client';

import { getIdToken, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';

export const getFirebaseIdToken = () => {
  return new Promise((resolve, reject) => {
    if (auth.currentUser) {
      getIdToken(auth.currentUser, true).then(resolve).catch(reject);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();

      if (user) {
        try {
          const token = await getIdToken(user, true);
          resolve(token);
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error('User not authenticated'));
      }
    });
  });
};
