<template>
  <q-page class="flex flex-center bg-grey-10">
    <div class="column items-center text-center q-pa-md">
      <q-img
        src="~assets/logo_empresa.png"
        style="height: 140px; max-width: 480px"
        fit="contain"
        class="q-mb-lg"
      />

      <div class="text-h4 text-white text-weight-bold q-mt-md">Seja bem-vindo(a)!</div>

      <div class="text-h5 text-orange-8 q-mt-sm">
        {{ userName }}
      </div>

      <div class="text-subtitle1 text-grey-5 q-mt-sm">Sistema Dinâmica Máquinas</div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { auth } from 'boot/firebase'
import localforage from 'localforage'
const userName = ref('Carregando...')

// Lembre-se de importar o localforage lá no topo!
// import localforage from 'localforage'

onMounted(async () => {
  // 1. AÇÃO IMEDIATA: Puxa do celular para a tela não ficar com "Visitante"
  const sessao = await localforage.getItem('user_session')

  if (sessao && sessao.email) {
    if (sessao.nome) {
      userName.value = sessao.nome
    } else {
      const emailName = sessao.email.split('@')[0]
      userName.value = emailName.charAt(0).toUpperCase() + emailName.slice(1)
    }
  } else {
    userName.value = 'Visitante'
  }

  // 2. AÇÃO EM SEGUNDO PLANO: Se tiver online, atualiza com os dados reais
  if (navigator.onLine) {
    auth.onAuthStateChanged((user) => {
      if (user) {
        // Se o firebase tiver o displayName, atualiza
        if (user.displayName) {
          userName.value = user.displayName
        }
        // Se não tiver, o nome que já puxamos do localforage continua lá, perfeito!
      }
    })
  }
})
</script>
