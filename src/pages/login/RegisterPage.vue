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

          <div class="text-h5 text-bold text-center text-white q-mb-lg">Primeiro Acesso</div>

          <q-input
            v-model="fullName"
            label="Nome Completo"
            outlined
            dark
            color="orange-8"
            bg-color="grey-9"
            class="q-mb-md"
            label-color="orange-8"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="orange-8" />
            </template>
          </q-input>

          <q-select
            v-model="selectedCity"
            :options="cities"
            label="Selecione sua Cidade"
            outlined
            dark
            color="orange-8"
            bg-color="grey-9"
            class="q-mb-md"
            label-color="orange-8"
            emit-value
            map-options
          >
            <template v-slot:prepend>
              <q-icon name="location_on" color="orange-8" />
            </template>
          </q-select>
          <q-input
            v-model="email"
            label="Definir Usuário"
            suffix="@dinamicamaquinas.com"
            autocomplete="off"
            outlined
            dark
            color="orange-8"
            bg-color="grey-9"
            class="q-mb-md"
            label-color="orange-8"
          />

          <q-input
            v-model="emailConfirm"
            label="Confirmar Usuário"
            suffix="@dinamicamaquinas.com"
            autocomplete="off"
            outlined
            dark
            color="orange-8"
            bg-color="grey-9"
            class="q-mb-md"
            label-color="orange-8"
          />
          <q-input
            v-model="password"
            label="Definir Senha"
            :type="isPasswordHidden ? 'password' : 'text'"
            outlined
            dark
            color="orange-8"
            bg-color="grey-9"
            class="q-mb-md"
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

          <q-input
            v-model="passwordConfirm"
            label="Confirmar Senha"
            :type="isPasswordConfirmHidden ? 'password' : 'text'"
            outlined
            dark
            color="orange-8"
            bg-color="grey-9"
            class="q-mb-lg"
            label-color="orange-8"
          >
            <template v-slot:append>
              <q-icon
                :name="isPasswordConfirmHidden ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPasswordConfirmHidden = !isPasswordConfirmHidden"
              />
            </template>
          </q-input>

          <q-btn
            style="background-color: #e65100; color: white"
            label="CRIAR MINHA CONTA"
            @click="handleRegister"
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
              label="Já tem uma conta? Voltar ao Login"
              @click="router.push('/')"
              no-caps
            />
          </div>
        </div>

        <q-dialog v-model="showSuccessDialog" persistent>
          <q-card dark style="width: 350px; background-color: #1d1d1d; border: 1px solid #e65100">
            <q-card-section class="row items-center justify-center q-pt-lg">
              <q-icon name="mark_email_read" color="orange-8" size="4rem" />
            </q-card-section>

            <q-card-section class="text-center q-px-md">
              <div class="text-h6 text-bold text-white q-mb-sm">Acesso Criado!</div>
              <p class="text-body2 text-grey-4">
                Um e-mail de validação foi enviado para o seu endereço corporativo. Por favor,
                valide o login antes de acessar.
              </p>

              <q-banner rounded class="bg-orange-10 text-white text-left text-weight-bold q-mt-md">
                <q-icon name="warning" class="q-mr-xs" />
                IMPORTANTE: Caso o e-mail não chegue em instantes, confira se o seu WEBMAIL não está
                cheio!
              </q-banner>

              <div class="q-mt-md">
                <q-btn
                  outline
                  color="orange-8"
                  icon="open_in_new"
                  label="IR PARA O WEBMAIL (OPCIONAL)"
                  href="http://webmail.dinamicamaquinas.com/"
                  target="_blank"
                  class="full-width text-bold"
                  size="sm"
                  rounded
                />
              </div>
            </q-card-section>

            <q-card-actions align="center" class="q-pb-lg">
              <q-btn
                label="ENTENDI e IR PARA LOGIN"
                color="orange-8"
                class="px-lg text-bold full-width"
                style="max-width: 280px"
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
import { auth, db } from 'boot/firebase'
// Adicionado 'updateProfile' nos imports
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()

const fullName = ref('')
const selectedCity = ref(null)
const email = ref('')
const emailConfirm = ref('')
const password = ref('')
const passwordConfirm = ref('')

const isPasswordHidden = ref(true)
const isPasswordConfirmHidden = ref(true)
const showSuccessDialog = ref(false)

const cities = ['Campo Novo do Parecis', 'Tangará da Serra', 'Nova Mutum', 'Juína']

const handleRegister = async () => {
  if (!fullName.value.trim()) {
    $q.notify({ type: 'warning', message: 'Por favor, digite seu nome completo.' })
    return
  }
  if (!selectedCity.value) {
    $q.notify({ type: 'warning', message: 'Por favor, selecione uma cidade.' })
    return
  }
  if (!email.value || !emailConfirm.value || !password.value || !passwordConfirm.value) {
    $q.notify({ type: 'warning', message: 'Preencha todos os campos do formulário.' })
    return
  }

  if (email.value.trim().toLowerCase() !== emailConfirm.value.trim().toLowerCase()) {
    $q.notify({ type: 'negative', message: 'Os usuários digitados não são iguais.' })
    return
  }

  if (password.value !== passwordConfirm.value) {
    $q.notify({ type: 'negative', message: 'As senhas digitadas não são iguais.' })
    return
  }

  if (password.value.length < 6) {
    $q.notify({ type: 'warning', message: 'A senha deve ter no mínimo 6 caracteres.' })
    return
  }

  const fullEmail = `${email.value.trim()}@dinamicamaquinas.com`
  $q.loading.show({ message: 'Processando seu primeiro acesso...' })

  try {
    // 1. Cria a conta
    const userCredential = await createUserWithEmailAndPassword(auth, fullEmail, password.value)
    const user = userCredential.user

    // 2. SALVA O NOME no perfil do Firebase Auth (ESSENCIAL para o InicioPage)
    await updateProfile(user, {
      displayName: fullName.value.trim(),
    })

    // 3. Envia e-mail de verificação
    await sendEmailVerification(user)

    // 4. Salva dados extras no Firestore
    await setDoc(doc(db, 'usuarios', user.uid), {
      nome: fullName.value.trim(),
      usuario: email.value.trim(),
      email: fullEmail,
      cidade: selectedCity.value,
      dataCriacao: new Date().toISOString(),
      perfil: null,
      acessoAprovado: false,
      unidade: null,
    })

    $q.loading.hide()
    showSuccessDialog.value = true
  } catch (error) {
    $q.loading.hide()
    let msgErro = 'Erro ao cadastrar: ' + error.message
    if (error.code === 'auth/email-already-in-use') {
      msgErro = 'Este usuário já possui um cadastro ativo.'
    }
    $q.notify({ type: 'negative', message: msgErro })
  }
}

const closeDialogAndGoToLogin = () => {
  showSuccessDialog.value = false
  router.push('/')
}
</script>
