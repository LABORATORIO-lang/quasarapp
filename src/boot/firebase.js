import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyChbl085tghoV0SaxG7xF5VtAZHJL9OxgQ',
  authDomain: 'comercialdinamica.firebaseapp.com',
  projectId: 'comercialdinamica',
  storageBucket: 'comercialdinamica.firebasestorage.app',
  messagingSenderId: '517651615384',
  appId: '1:517651615384:web:2508ed3e33501fb2ee4aed',
  measurementId: 'G-VBVYQM4BQH',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)

// 🧠 Inicializa o Firestore já com o Cache Offline Ativado de forma profissional!
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
})
