<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center bg-grey-10" style="background-color: #121212">
        <div class="column q-pa-lg" style="width: 100%; max-width: 400px">
          <div class="row justify-center q-mb-xl">
            <q-img
              src="~assets/logo_empresa.png"
              spinner-color="white"
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
              dark
              dense
              color="grey-5"
              label="Esqueceu a senha?"
              @click="router.push('/forgot-password')"
              no-caps
            />
          </div>

          <div class="row justify-center q-mt-xl">
            <q-btn
              flat
              dark
              color="orange-8"
              label="Primeiro acesso? Crie sua conta"
              @click="router.push('/register')"
              no-caps
              class="text-bold"
            />
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from 'boot/firebase'
// 1º AJUSTE: Adicionamos a função signOut na importação do firebase/auth
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()

const email = ref('')
const password = ref('')
const isPasswordHidden = ref(true)

const handleLogin = async () => {
  if (!email.value || !password.value) {
    $q.notify({ type: 'warning', message: 'Preencha todos os campos.' })
    return
  }

  const fullEmail = `${email.value.trim()}@dinamicamaquinas.com`
  $q.loading.show({ message: 'Autenticando...' })

  try {
    // 2º AJUSTE: Guardamos o resultado do login nesta variável "userCredential"
    const userCredential = await signInWithEmailAndPassword(auth, fullEmail, password.value)
    const user = userCredential.user

    // 3º AJUSTE: A barreira de verificação do email!
    if (!user.emailVerified) {
      await signOut(auth) // Desloga imediatamente por segurança
      $q.loading.hide() // Esconde a bolinha de carregamento

      $q.notify({
        type: 'warning',
        message:
          'Por favor, verifique seu email antes de fazer login. Verifique sua caixa de entrada ou spam.',
        timeout: 5000,
      })

      return // Interrompe o código aqui para não deixar ir para a tela de '/inicio'
    }

    // Se o emailVerified for "true", o código passa direto e o login acontece normalmente
    $q.loading.hide()
    $q.notify({ type: 'positive', message: 'Login realizado com sucesso!' })
    router.push('/inicio')
  } catch (error) {
    $q.loading.hide()
    let msgErro = 'Erro ao entrar: ' + error.message
    if (error.code === 'auth/invalid-credential') {
      msgErro = 'Usuário ou senha incorretos.'
    }
    $q.notify({ type: 'negative', message: msgErro })
  }
}
</script>
