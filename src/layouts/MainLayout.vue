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
          <q-badge v-if="perfisUsuario.length" color="orange-8" class="q-mt-xs">{{
            perfilLabel
          }}</q-badge>
        </div>

        <q-separator color="grey-8" class="q-mb-sm" />

        <q-list padding class="text-white">
          <q-item clickable v-ripple to="/inicio" exact active-class="text-orange-8">
            <q-item-section avatar><q-icon name="home" color="orange-8" /></q-item-section>
            <q-item-section>Início</q-item-section>
          </q-item>

          <!-- COMERCIAL -->
          <q-item
            v-if="temAcesso('comercial')"
            clickable
            v-ripple
            @click="navegar('/inicio/comercial')"
          >
            <q-item-section avatar><q-icon name="agriculture" color="orange-8" /></q-item-section>
            <q-item-section>Comercial</q-item-section>
          </q-item>

          <!-- LOGÍSTICA -->
          <q-item
            v-if="temAcesso('logistica')"
            clickable
            v-ripple
            @click="navegar('/inicio/logistica')"
          >
            <q-item-section avatar
              ><q-icon name="local_shipping" color="orange-8"
            /></q-item-section>
            <q-item-section>Logística</q-item-section>
          </q-item>

          <!-- PÓS-VENDA -->
          <q-item
            v-if="temAcesso('pos_venda')"
            clickable
            v-ripple
            @click="navegar('/inicio/pos-venda')"
          >
            <q-item-section avatar><q-icon name="handyman" color="orange-8" /></q-item-section>
            <q-item-section>Pós-Venda</q-item-section>
          </q-item>

          <q-separator color="grey-8" class="q-my-sm" />

          <!-- PAINEL ADMIN -->
          <q-item v-if="temAcesso('admin')" clickable v-ripple @click="navegar('/admin/master')">
            <q-item-section avatar
              ><q-icon name="admin_panel_settings" color="orange-8"
            /></q-item-section>
            <q-item-section><q-item-label>Painel Admin</q-item-label></q-item-section>
          </q-item>
        </q-list>

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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from 'boot/firebase'
import { signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import localforage from 'localforage'

const leftDrawerOpen = ref(false)
const router = useRouter()

const userName = ref('Carregando...')
const userEmail = ref('')
const perfisUsuario = ref([])

// Mapa de permissões por perfil
const permissoes = {
  tecnico: ['starpes', 'calculo_plantio'],
  adm_pos_venda: ['pos_venda', 'maquinas', 'logistica'],
  vendedor: ['comercial', 'consorcio', 'usados'],
  gerente_comercial: ['admin', 'comercial'],
  gerente_pos_venda: ['admin', 'pos_venda', 'starpes'],
}

const perfilLabels = {
  tecnico: 'Técnico',
  adm_pos_venda: 'Adm. Pós-Venda',
  vendedor: 'Vendedor',
  gerente_comercial: 'Gerente Comercial',
  gerente_pos_venda: 'Gerente Pós-Venda',
  master: 'Master',
}

const perfilLabel = computed(() => {
  if (perfisUsuario.value.length === 0) return ''
  return perfisUsuario.value.map((p) => perfilLabels[p] || p).join(' | ')
})

const temAcesso = (modulo) => {
  if (perfisUsuario.value.includes('master')) return true
  const todosAcessos = perfisUsuario.value.flatMap((p) => permissoes[p] || [])
  return todosAcessos.includes(modulo)
}

onMounted(async () => {
  const sessao = await localforage.getItem('user_session')
  console.log('SESSÃO:', sessao)
  console.log('UNIDADE:', sessao?.unidade)
  console.log('PERFIS:', sessao?.perfis)
  if (sessao && sessao.email) {
    userEmail.value = sessao.email
    perfisUsuario.value = sessao.perfis || []

    if (sessao.nome) {
      userName.value = sessao.nome
    } else {
      const emailName = sessao.email.split('@')[0]
      userName.value = emailName.charAt(0).toUpperCase() + emailName.slice(1)
    }
  }

  if (navigator.onLine) {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        userEmail.value = user.email || userEmail.value

        if (user.uid === '6qiehRW7f0YfA2kZAWcpXR3NFWc2') {
          perfisUsuario.value = ['master']
        }

        try {
          const docRef = doc(db, 'usuarios', user.uid)
          const docSnap = await getDoc(docRef)

          if (docSnap.exists()) {
            const dados = docSnap.data()
            userName.value = dados.nome
            perfisUsuario.value = dados.perfis || perfisUsuario.value

            await localforage.setItem('user_session', {
              email: user.email,
              nome: dados.nome,
              perfis: [...perfisUsuario.value],
              unidade: dados.unidade || null,
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

async function logout() {
  try {
    await localforage.removeItem('user_session')
    if (navigator.onLine) {
      await signOut(auth)
    }
    router.replace('/')
  } catch (error) {
    console.error('Erro ao sair:', error)
    router.replace('/')
  }
}
</script>
