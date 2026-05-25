<template>
  <q-page class="flex flex-center bg-grey-10">
    <div class="column items-center text-center q-pa-md">
      <q-img
        src="~assets/logo_empresa.png"
        style="width: 450px; height: 150px"
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

const userName = ref('Carregando...')

onMounted(() => {
  // O Firebase mantém o usuário logado na sessão automaticamente
  const user = auth.currentUser

  if (user) {
    // 1. Prioriza o displayName (nome definido no perfil do Firebase Auth)
    // 2. Se não tiver, usa a primeira parte do e-mail (antes do @)
    if (user.displayName) {
      userName.value = user.displayName
    } else if (user.email) {
      // Pega o e-mail e corta a partir do @, transformando a primeira letra em maiúscula
      const emailName = user.email.split('@')[0]
      userName.value = emailName.charAt(0).toUpperCase() + emailName.slice(1)
    } else {
      userName.value = 'Usuário'
    }
  } else {
    userName.value = 'Visitante'
  }
})
</script>
