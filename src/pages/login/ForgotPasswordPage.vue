<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center bg-grey-10" style="background-color: #121212">
        <div class="column q-pa-lg" style="width: 100%; max-width: 400px">
          <div class="row justify-center q-mb-xl">
            <q-img
              src="~assets/logo_empresa.png"
              spinner-color="white"
              style="height: 140px; max-width: 280px"
              fit="contain"
            />
          </div>

          <div class="text-h5 text-bold text-center text-white q-mb-md">Recuperar Senha</div>

          <div class="text-body2 text-grey-5 text-center q-mb-xl">
            Introduza o seu utilizador abaixo para receber um link de redefinição de senha no seu
            e-mail.
          </div>

          <q-input
            v-model="emailUser"
            label="Usuário"
            outlined
            dark
            color="orange-8"
            bg-color="grey-9"
            class="q-mb-lg"
            label-color="orange-8"
          >
            <template v-slot:append>
              <div class="text-caption text-grey-5 q-pt-md" style="font-size: 13px">
                @dinamicamaquinas.com
              </div>
            </template>
          </q-input>

          <q-btn
            style="background-color: #e65100; color: white"
            label="ENVIAR"
            :loading="isLoading"
            @click="handleResetPassword"
            size="lg"
            class="full-width q-py-sm text-bold q-mb-md"
            rounded
          />

          <div class="row justify-center">
            <q-btn
              flat
              dark
              dense
              color="grey-5"
              label="CANCELAR"
              @click="router.push('/')"
              no-caps
            />
          </div>
        </div>

        <q-dialog v-model="showSuccessDialog" persistent>
          <q-card
            dark
            bg-color="grey-9"
            style="width: 350px; background-color: #1d1d1d; border: 1px solid #e65100"
          >
            <q-card-section class="row items-center justify-center q-pt-lg">
              <q-icon name="mark_email_read" color="orange-8" size="4rem" />
            </q-card-section>

            <q-card-section class="text-center q-px-md">
              <div class="text-h6 text-bold text-white q-mb-sm">E-mail Enviado!</div>
              <p class="text-body2 text-grey-4">
                O link de redefinição foi enviado para o seu e-mail corporativo.
              </p>
              <q-banner rounded class="bg-orange-10 text-white text-left text-weight-bold q-mt-md">
                <q-icon name="warning" class="q-mr-xs" />
                ATENÇÃO: Caso não receba, confira se o seu WEBMAIL não está cheio!
              </q-banner>
            </q-card-section>

            <q-card-actions align="center" class="q-pb-lg">
              <q-btn
                label="ENTENDI"
                color="orange-8"
                class="px-lg text-bold"
                rounded
                @click="closeDialogAndGoToLogin"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from 'boot/firebase'
import { sendPasswordResetEmail } from 'firebase/auth'

// Removeu a linha do useQuasar para o ESLint não reclamar
const router = useRouter()

const emailUser = ref('')
const showSuccessDialog = ref(false)
const isLoading = ref(false)

const handleResetPassword = async () => {
  const userClean = emailUser.value.trim().toLowerCase()

  if (!userClean) {
    alert('Por favor, introduza o seu utilizador.')
    return
  }

  const fullEmail = `${userClean}@dinamicamaquinas.com`
  isLoading.value = true

  try {
    await sendPasswordResetEmail(auth, fullEmail)
    isLoading.value = false
    showSuccessDialog.value = true
  } catch (error) {
    isLoading.value = false

    // ATENÇÃO: Agora vamos imprimir o erro real no console do navegador (F12)
    console.error('ERRO DETALHADO:', error)

    // Mostramos uma mensagem mais útil caso o erro seja conhecido
    if (error.code === 'auth/user-not-found') {
      alert('Utilizador não encontrado no sistema.')
    } else {
      alert('Erro ao enviar e-mail: ' + error.message)
    }
  }
}

const closeDialogAndGoToLogin = () => {
  showSuccessDialog.value = false
  router.push('/')
}
</script>
