<template>
  <q-page class="q-pa-md bg-grey-10 text-white">
    <!-- Cabeçalho -->
    <div class="row items-center q-mb-lg">
      <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.back()" />
      <div class="q-ml-sm">
        <div class="text-h6 text-weight-bold text-orange-8">Em Andamento</div>
        <div class="text-caption text-grey-5">Checklists salvos aguardando conclusão</div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="carregando" class="flex flex-center q-py-xl">
      <q-spinner color="orange-8" size="48px" />
    </div>

    <!-- Lista vazia -->
    <div v-else-if="rascunhos.length === 0" class="flex flex-center column q-py-xl text-center">
      <q-icon name="pending_actions" size="72px" color="grey-7" class="q-mb-md" />
      <div class="text-h6 text-grey-5 q-mb-sm">Nenhum rascunho salvo</div>
      <div class="text-body2 text-grey-6 q-mb-lg">
        Quando você sair de um checklist em andamento, ele será salvo aqui automaticamente.
      </div>
      <q-btn
        color="orange-8"
        label="Iniciar Novo Checklist"
        icon="add"
        unelevated
        style="border-radius: 8px"
        @click="$router.push('/inicio/comercial/checklist/selecionar')"
      />
    </div>

    <!-- Lista de rascunhos -->
    <div v-else class="q-gutter-md">
      <q-card
        v-for="rascunho in rascunhos"
        :key="rascunho.id"
        class="bg-grey-9 text-white"
        style="border-radius: 12px; border: 1px solid #424242"
      >
        <q-card-section class="q-pb-sm">
          <div class="row items-start justify-between no-wrap">
            <div class="col">
              <!-- Nome do cliente -->
              <div class="text-subtitle1 text-weight-bold text-white ellipsis">
                {{ rascunho.formulario?.cliente || 'Sem cliente' }}
              </div>
              <!-- Nome da máquina -->
              <div class="row items-center q-mt-xs">
                <q-icon name="precision_manufacturing" size="14px" color="orange-8" class="q-mr-xs" />
                <span class="text-body2 text-orange-8 text-weight-medium">
                  {{ rascunho.nomeMaquina || rascunho.tipoMaquina || 'Máquina desconhecida' }}
                </span>
              </div>
              <!-- Data salvo -->
              <div class="row items-center q-mt-xs">
                <q-icon name="schedule" size="13px" color="grey-5" class="q-mr-xs" />
                <span class="text-caption text-grey-5">
                  Salvo em {{ formatarData(rascunho.dataSalvo) }}
                </span>
              </div>
            </div>

            <!-- Badge de progresso -->
            <div class="col-auto q-ml-sm">
              <q-badge color="orange-9" text-color="white" rounded class="q-px-sm q-py-xs">
                <q-icon name="edit_note" size="12px" class="q-mr-xs" />
                Rascunho
              </q-badge>
            </div>
          </div>
        </q-card-section>

        <!-- Indicadores de preenchimento -->
        <q-card-section class="q-pt-xs q-pb-sm">
          <div class="row q-gutter-xs">
            <q-chip
              dense
              :color="temFotosGerais(rascunho) ? 'green-9' : 'grey-8'"
              text-color="white"
              icon="photo_camera"
              size="sm"
            >
              Fotos
            </q-chip>
            <q-chip
              dense
              :color="temAssinaturas(rascunho) ? 'green-9' : 'grey-8'"
              text-color="white"
              icon="draw"
              size="sm"
            >
              Assinaturas
            </q-chip>
            <q-chip
              dense
              :color="progressoItens(rascunho) > 0 ? 'blue-9' : 'grey-8'"
              text-color="white"
              icon="checklist"
              size="sm"
            >
              {{ progressoItens(rascunho) }} itens
            </q-chip>
          </div>
        </q-card-section>

        <q-separator color="grey-8" />

        <q-card-actions align="right" class="bg-grey-10 q-pa-sm">
          <!-- Excluir -->
          <q-btn
            flat
            color="red-4"
            icon="delete_outline"
            label="Excluir"
            size="sm"
            @click="confirmarExclusao(rascunho)"
          />
          <!-- Continuar -->
          <q-btn
            flat
            color="orange-8"
            icon-right="arrow_forward"
            label="Continuar"
            size="sm"
            @click="continuarRascunho(rascunho)"
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import localforage from 'localforage'

const $q = useQuasar()
const router = useRouter()

const CHAVE_RASCUNHOS = 'rascunhos_checklist'

const rascunhos = ref([])
const carregando = ref(true)

onMounted(async () => {
  await carregarRascunhos()
})

const carregarRascunhos = async () => {
  carregando.value = true
  try {
    const salvos = (await localforage.getItem(CHAVE_RASCUNHOS)) || []
    // Ordena do mais recente para o mais antigo
    rascunhos.value = salvos.sort((a, b) => new Date(b.dataSalvo) - new Date(a.dataSalvo))
  } catch (e) {
    console.error('Erro ao carregar rascunhos:', e)
    $q.notify({ type: 'negative', message: 'Erro ao carregar rascunhos.' })
  } finally {
    carregando.value = false
  }
}

const normalizarSetor = (setor) => {
  if (!setor) return 'comercial'
  return setor === 'pos-venda' ? 'pos_venda' : setor
}

const continuarRascunho = (rascunho) => {
  const setor = normalizarSetor(rascunho.setor)
  const tipo = rascunho.tipoMaquina || 'desconhecido'
  router.push({
    path: `/inicio/${setor}/checklist/formulario/${tipo}`,
    query: { rascunho: rascunho.id },
  })
}

const confirmarExclusao = (rascunho) => {
  $q.dialog({
    title: 'Excluir Rascunho',
    message: `Deseja excluir o rascunho de "${rascunho.formulario?.cliente || 'Sem cliente'}"? Esta ação não pode ser desfeita.`,
    cancel: 'Cancelar',
    ok: { label: 'Excluir', color: 'red' },
    persistent: true,
  }).onOk(async () => {
    await excluirRascunho(rascunho.id)
  })
}

const excluirRascunho = async (id) => {
  try {
    const todos = (await localforage.getItem(CHAVE_RASCUNHOS)) || []
    const filtrados = todos.filter((r) => r.id !== id)
    await localforage.setItem(CHAVE_RASCUNHOS, filtrados)
    rascunhos.value = rascunhos.value.filter((r) => r.id !== id)
    $q.notify({ type: 'positive', message: 'Rascunho excluído.' })
  } catch (e) {
    console.error('Erro ao excluir rascunho:', e)
    $q.notify({ type: 'negative', message: 'Erro ao excluir rascunho.' })
  }
}

const formatarData = (isoString) => {
  if (!isoString) return 'Data desconhecida'
  try {
    const data = new Date(isoString)
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Data inválida'
  }
}

const temFotosGerais = (rascunho) => {
  if (!rascunho.fotosGerais) return false
  return Object.values(rascunho.fotosGerais).some((f) => f !== null && f !== undefined)
}

const temAssinaturas = (rascunho) => {
  if (!rascunho.assinaturas) return false
  return !!(rascunho.assinaturas.vendedorImagem || rascunho.assinaturas.clienteImagem)
}

const progressoItens = (rascunho) => {
  if (!rascunho.itens || !Array.isArray(rascunho.itens)) return 0
  return rascunho.itens.filter((i) => i.resposta !== null && i.resposta !== undefined).length
}
</script>
