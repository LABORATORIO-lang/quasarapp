<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-grey-9">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>Dinâmica Máquinas</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-10 text-white">
      <q-scroll-area class="fit">
        <div class="q-pa-md text-center">
          <q-avatar size="80px" color="orange-8" class="q-mb-sm">
            <q-icon name="person" size="40px" color="white" />
          </q-avatar>
          <div class="text-weight-bold text-subtitle1">{{ userName }}</div>
          <div class="text-caption text-grey-5">{{ userEmail }}</div>
        </div>

        <q-separator color="grey-8" class="q-mb-sm" />

        <q-list padding class="text-white">
          <q-item clickable v-ripple to="/inicio" exact active-class="text-orange-8">
            <q-item-section avatar><q-icon name="home" color="orange-8" /></q-item-section>
            <q-item-section>Início</q-item-section>
          </q-item>

          <q-item clickable v-ripple @click="navegar('/inicio/comercial')">
            <q-item-section avatar><q-icon name="agriculture" color="orange-8" /></q-item-section>
            <q-item-section>Comercial</q-item-section>
          </q-item>

          <q-item clickable v-ripple @click="navegar('/inicio/logistica')">
            <q-item-section avatar>
              <q-icon name="local_shipping" color="orange-8" />
            </q-item-section>
            <q-item-section>Logística</q-item-section>
          </q-item>

          <q-separator color="grey-8" class="q-my-sm" />

          <q-item clickable v-ripple @click="navegar('/admin/master')">
            <q-item-section avatar>
              <q-icon name="admin_panel_settings" color="orange-8" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Painel Admin</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <div class="absolute-bottom q-pa-md">
          <q-item clickable v-ripple @click="logout" class="text-red">
            <q-item-section avatar><q-icon name="logout" /></q-item-section>
            <q-item-section>Sair</q-item-section>
          </q-item>
        </div>

        <div class="absolute-bottom q-pa-md">
          <q-item clickable v-ripple @click="logout" class="text-red">
            <q-item-section avatar><q-icon name="logout" /></q-item-section>
            <q-item-section>Sair</q-item-section>
          </q-item>
        </div>
      </q-scroll-area>
    </q-drawer>

    <q-page-container class="bg-grey-10">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue' // onMounted é usado aqui
import { useRouter } from 'vue-router'
import { auth, db } from 'boot/firebase' // db é usado aqui
import { signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore' // doc e getDoc são usados aqui

const leftDrawerOpen = ref(false)
const router = useRouter()

// Variáveis para o nome e e-mail
const userName = ref('Carregando...')
const userEmail = ref('')

// AQUI é onde o 'onMounted', 'db', 'doc' e 'getDoc' são usados:
onMounted(async () => {
  const user = auth.currentUser
  if (user) {
    userEmail.value = user.email || ''

    try {
      const docRef = doc(db, 'usuarios', user.uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        userName.value = docSnap.data().nome
      } else {
        userName.value = 'Usuário Dinâmica'
      }
    } catch (error) {
      console.error('Erro ao buscar nome:', error)
      userName.value = 'Usuário'
    }
  }
})

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function navegar(path) {
  router.push(path)
  leftDrawerOpen.value = false
}

async function logout() {
  await signOut(auth)
  router.push('/')
}
</script>
