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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from 'boot/firebase'
import { signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import localforage from 'localforage' // <-- ADICIONADO: Importação para limpar a sessão

const leftDrawerOpen = ref(false)
const router = useRouter()

// Variáveis para o nome e e-mail
const userName = ref('Carregando...')
const userEmail = ref('')

// Dentro do <script setup> do MainLayout.vue
onMounted(async () => {
  // 1. AÇÃO IMEDIATA: Puxa do celular para mostrar o nome na hora
  const sessao = await localforage.getItem('user_session')

  if (sessao && sessao.email) {
    userEmail.value = sessao.email

    // Se já tivermos o nome salvo, usa ele. Se não, quebra o e-mail (ex: jackson@... vira Jackson)
    if (sessao.nome) {
      userName.value = sessao.nome
    } else {
      const emailName = sessao.email.split('@')[0]
      userName.value = emailName.charAt(0).toUpperCase() + emailName.slice(1)
    }
  }

  // 2. AÇÃO EM SEGUNDO PLANO: Só faz isso se o celular tiver internet
  if (navigator.onLine) {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        userEmail.value = user.email || userEmail.value

        try {
          // Vai no banco de dados buscar o nome real
          const docRef = doc(db, 'usuarios', user.uid)
          const docSnap = await getDoc(docRef)

          if (docSnap.exists()) {
            userName.value = docSnap.data().nome

            // Atualiza a memória do celular com o nome verdadeiro
            await localforage.setItem('user_session', {
              email: user.email,
              nome: userName.value,
            })
          }
        } catch (error) {
          console.error('Erro ao buscar dados no Firebase:', error)
        }
      }
    })
  }
})

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function navegar(path) {
  router.push(path)
  leftDrawerOpen.value = false
}

// <-- ADICIONADO: Função de logout corrigida -->
async function logout() {
  try {
    // 1. O segredo para quebrar o loop: apagar a sessão salva no celular
    await localforage.removeItem('user_session')

    // 2. Desloga do Firebase apenas se o celular tiver internet
    if (navigator.onLine) {
      await signOut(auth)
    }

    // 3. Volta para a tela de Login usando 'replace' para não deixar voltar pela seta do celular
    router.replace('/')
  } catch (error) {
    console.error('Erro ao sair:', error)
    // Se der erro, joga para o login de qualquer jeito
    router.replace('/')
  }
}
</script>
