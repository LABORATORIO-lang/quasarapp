<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center bg-grey-10">
        <div class="column q-pa-lg" style="width: 100%; max-width: 400px">
          <div class="row justify-center q-mb-xl">
            <q-img
              src="~assets/logo_empresa.png"
              style="height: 140px; max-width: 480px"
              fit="contain"
            />
          </div>

          <div class="text-h5 text-bold text-center text-white q-mb-lg">Login - Dinâmica</div>

          <q-input
            v-model="email"
            label="Usuário"
            outlined
            dark
            color="orange-8"
            bg-color="grey-9"
            class="q-mb-md"
            label-color="orange-8"
          >
            <template v-slot:append>
              <div class="text-caption text-grey-5">@dinamicamaquinas.com</div>
            </template>
          </q-input>

          <q-input
            v-model="password"
            label="Senha"
            :type="isPasswordHidden ? 'password' : 'text'"
            outlined
            dark
            color="orange-8"
            bg-color="grey-9"
            class="q-mb-lg"
            label-color="orange-8"
          >
            <template v-slot:append>
              <q-icon
                :name="isPasswordHidden ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPasswordHidden = !isPasswordHidden"
              />
            </template>
          </q-input>

          <q-btn
            style="background-color: #e65100; color: white"
            label="ENTRAR"
            @click="handleLogin"
            size="lg"
            class="full-width q-py-sm text-bold"
            rounded
          />

          <div class="row justify-center q-mt-md">
            <q-btn
              flat
              color="grey-5"
              label="Esqueceu a senha?"
              @click="router.push('/forgot-password')"
              no-caps
            />
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from 'boot/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useQuasar } from 'quasar'
import localforage from 'localforage'

const $q = useQuasar()
const router = useRouter()

const email = ref('')
const password = ref('')
const isPasswordHidden = ref(true)

// Ao carregar a tela de login, verifica se já existe uma sessão salva
onMounted(async () => {
  const sessao = await localforage.getItem('user_session')

  if (sessao) {
    // Se achou a sessão, faz o login automático (funciona offline e online)
    router.push('/inicio')
  }
})

const handleLogin = async () => {
  if (!email.value || !password.value) {
    $q.notify({
      type: 'warning',
      message: 'Preencha todos os campos.',
    })
    return
  }

  const emailFormatado = `${email.value.trim()}@dinamicamaquinas.com`

  // 1. Lógica para quando tenta logar sem internet e por algum motivo não logou automático
  if (!navigator.onLine) {
    const sessaoSalva = await localforage.getItem('user_session')
    if (sessaoSalva && sessaoSalva.email === emailFormatado) {
      $q.notify({
        type: 'positive',
        message: 'Modo Offline: Acesso permitido.',
      })
      router.push('/inicio')
      return
    } else {
      $q.notify({
        type: 'negative',
        message: 'Você está offline. Conecte-se para o primeiro acesso.',
      })
      return
    }
  }

  // 2. Lógica normal (Online via Firebase)
  $q.loading.show({
    message: 'Autenticando...',
  })

  try {
    const userCredential = await signInWithEmailAndPassword(auth, emailFormatado, password.value)

    if (userCredential.user.emailVerified) {
      // Salva a sessão para garantir o login automático na próxima vez (offline ou online)
      await localforage.setItem('user_session', {
        email: userCredential.user.email,
      })

      $q.loading.hide()
      router.push('/inicio')
    } else {
      $q.loading.hide()
      $q.notify({
        type: 'warning',
        message: 'Confirme seu e-mail antes de acessar.',
      })
    }
  } catch (error) {
    console.error(error)
    $q.loading.hide()
    $q.notify({
      type: 'negative',
      message: 'Usuário ou senha inválidos.',
    })
  }
}
</script>
