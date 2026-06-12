<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <!-- Cabeçalho da Tela -->
    <div class="row items-center justify-between q-mb-xl q-col-gutter-sm">
      <div class="row items-center q-gutter-sm">
        <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
        <div>
          <div class="text-h5 text-weight-bold">Selecionar Modelo</div>
          <div class="text-caption text-grey-5">Escolha o tipo de máquina recebida</div>
        </div>
      </div>
    </div>

    <!-- Lista de Modelos/Categorias Disponíveis -->
    <div class="row q-col-gutter-md">
      <div v-for="modelo in modelos" :key="modelo.id" class="col-12 col-sm-4">
        <q-card
          class="bg-grey-9 text-white custom-card"
          clickable
          @click="solicitarConfirmacaoInicio(modelo)"
        >
          <q-card-section class="q-pa-sm">
            <div class="row items-center no-wrap q-col-gutter-sm">
              <!-- Ícone Redondo Lateral -->
              <div class="col-auto">
                <q-avatar size="36px" color="grey-10" text-color="orange-8" class="icon-box">
                  <q-icon name="agriculture" />
                </q-avatar>
              </div>

              <!-- Textos do Card -->
              <div class="col">
                <div class="text-subtitle1 text-weight-bold text-capitalize text-orange-8">
                  {{ modelo.nome }}
                </div>
                <div class="text-caption text-grey-5 card-description">
                  {{ modelo.descricao }}
                </div>
              </div>

              <!-- Seta Indicativa -->
              <div class="col-auto">
                <q-icon name="arrow_forward" color="orange-8" size="20px" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { collection, getDocs } from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import localforage from 'localforage'

const $q = useQuasar()
const router = useRouter()

// Estados Reativos
const modelos = ref([])
const unidadeUsuario = ref('')
const nomeUsuario = ref('')

/**
 * Etapa 1: Carrega as informações do usuário logado e os modelos do Firebase
 */
const inicializarTela = async () => {
  $q.loading.show({ message: 'Carregando modelos disponíveis...' })
  try {
    // [Melhoria #11 Prevenção] - Normaliza a busca dos dados da sessão do usuário
    const sessao = await localforage.getItem('user_session')
    if (sessao) {
      // Garante a leitura tanto de unidade quanto de cidade para evitar conflitos
      unidadeUsuario.value = sessao.unidade || sessao.cidade || ''
      nomeUsuario.value = sessao.nome || ''
      console.log(`📌 Usuário operando na unidade: ${unidadeUsuario.value}`)
    }

    // Busca os modelos de checklist salvos no banco de dados
    const querySnapshot = await getDocs(collection(db, 'checklists_pos_venda'))
    const lista = []

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data()
      lista.push({
        id: docSnap.id,
        nome: data.nome || docSnap.id,
        descricao: data.descricao || `Checklist de recebimento para ${data.nome || docSnap.id}`,
      })
    })

    modelos.value = lista
  } catch (e) {
    console.error('Erro ao buscar modelos:', e)
    $q.notify({ type: 'negative', message: 'Erro ao carregar modelos do Firebase.' })
  } finally {
    $q.loading.hide()
  }
}

/**
 * Etapa 2: [Melhoria #14] Caixa de diálogo para confirmação antes de abrir o formulário
 * @param {Object} modelo - O objeto do modelo selecionado
 */
const solicitarConfirmacaoInicio = (modelo) => {
  $q.dialog({
    dark: true,
    title: '📋 Iniciar Checklist',
    message: `Deseja abrir o formulário para o modelo "${modelo.nome}"? Isso irá preparar uma nova verificação.`,
    cancel: { label: 'Voltar', color: 'grey-5', flat: true },
    ok: { label: 'Iniciar', color: 'orange-8', flat: true },
    persistent: true,
  }).onOk(() => {
    iniciarChecklist(modelo.id)
  })
}

/**
 * Etapa 3: Limpa os caches temporários e redireciona o usuário para o formulário
 * @param {String} idModelo - ID do documento no Firestore
 */
const iniciarChecklist = async (idModelo) => {
  try {
    // Limpa assinaturas antigas de segurança local
    await localforage.removeItem('assinatura_responsavel')
    await localforage.removeItem('assinatura_motorista')

    // Direciona o aplicativo para a rota do formulário dinâmico
    router.push(`/inicio/pos-venda/checklist/formulario/${idModelo}`)
  } catch (err) {
    console.error('Erro ao preparar checklist:', err)
  }
}

// Inicializa os dados quando o componente é montado na tela
onMounted(inicializarTela)
</script>

<style scoped>
.custom-card {
  border: 1px solid #333;
  border-radius: 8px;
  transition:
    transform 0.2s,
    border-color 0.2s;
  cursor: pointer;
}
.custom-card:hover {
  border-color: #ff9800;
  transform: translateY(-2px); /* Sutil efeito visual ao passar o mouse */
}
.icon-box {
  border: 1px solid #ff9800;
}
.card-description {
  line-height: 1.35;
}
</style>
