<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center justify-between q-mb-xl q-col-gutter-sm">
      <div class="row items-center q-gutter-sm">
        <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
        <div>
          <div class="text-h5 text-weight-bold">Rascunhos Pós-Venda</div>
          <div class="text-caption text-grey-5">
            Continue checklists que ainda não foram finalizados
          </div>
        </div>
      </div>
    </div>

    <div v-if="rascunhos.length === 0" class="text-center text-grey-5 q-mt-xl">
      <q-icon name="inventory_2" size="48px" class="q-mb-md" />
      <div class="text-h6">Nenhum rascunho encontrado</div>
      <div class="text-caption">Seus rascunhos salvos aparecerão aqui.</div>
    </div>

    <div v-else class="column q-gutter-sm">
      <q-card
        v-for="rascunho in rascunhos"
        :key="rascunho.id"
        class="compact-card bg-grey-9 text-white"
      >
        <q-card-section class="row items-center no-wrap q-pa-sm">
          <q-avatar size="36px" color="grey-10" text-color="orange-8" class="icon-box">
            <q-icon name="edit_note" size="20px" />
          </q-avatar>

          <div class="q-ml-md col cursor-pointer" @click="continuarRascunho(rascunho)">
            <div class="text-subtitle1 text-weight-bold text-orange-8">{{ rascunho.tipo }}</div>
            <div class="text-caption text-grey-5">
              {{ rascunho.modelo }} — {{ formatarData(rascunho.data) }}
            </div>
          </div>

          <!-- Botão Excluir -->
          <q-btn
            flat
            round
            dense
            color="red-5"
            icon="delete"
            size="sm"
            @click="confirmarExclusao(rascunho)"
          >
            <q-tooltip class="bg-red text-white">Excluir Rascunho</q-tooltip>
          </q-btn>

          <q-icon
            name="chevron_right"
            color="grey-6"
            size="24px"
            class="cursor-pointer"
            @click="continuarRascunho(rascunho)"
          />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import localforage from 'localforage'

const router = useRouter()
const $q = useQuasar()
const rascunhos = ref([])

const formatarData = (dataStr) => {
  if (!dataStr) return ''
  const d = new Date(dataStr)
  return d.toLocaleDateString('pt-BR')
}

const carregarRascunhos = async () => {
  try {
    const todasChaves = await localforage.keys()
    const chavesRascunho = todasChaves.filter((k) => k.startsWith('rascunho_pos_venda'))
    const lista = []
    for (const chave of chavesRascunho) {
      const dados = await localforage.getItem(chave)
      if (dados) {
        lista.push({ id: chave.replace('rascunho_pos_venda_', ''), ...dados })
      }
    }
    rascunhos.value = lista.sort((a, b) => new Date(b.data) - new Date(a.data))
  } catch (e) {
    console.error('Erro ao carregar rascunhos:', e)
  }
}

const continuarRascunho = (rascunho) => {
  router.push(`/inicio/pos-venda/checklist/formulario/${rascunho.tipo}?rascunho=${rascunho.id}`)
}

const confirmarExclusao = (rascunho) => {
  $q.dialog({
    dark: true,
    title: '⚠️ Excluir Rascunho',
    message: `Tem certeza que deseja excluir o rascunho "${rascunho.tipo}"?\n\nEsta ação não poderá ser desfeita.`,
    cancel: { label: 'Cancelar', color: 'grey-5', flat: true },
    ok: { label: 'Excluir', color: 'red-5', flat: true },
    color: 'red-5',
    persistent: true,
  }).onOk(async () => {
    try {
      await localforage.removeItem(`rascunho_pos_venda_${rascunho.id}`)

      // Remove da lista local
      const index = rascunhos.value.findIndex((r) => r.id === rascunho.id)
      if (index >= 0) {
        rascunhos.value.splice(index, 1)
      }

      $q.notify({
        icon: 'check_circle',
        message: 'Rascunho excluído!',
        color: 'green-8',
        position: 'top-right',
      })
    } catch (e) {
      console.error('Erro ao excluir rascunho:', e)
      $q.notify({
        icon: 'error',
        message: 'Erro ao excluir rascunho.',
        color: 'red-8',
        position: 'top-right',
      })
    }
  })
}

onMounted(carregarRascunhos)
</script>

<style scoped>
.compact-card {
  border: 1px solid #333;
  border-radius: 8px;
  transition: border-color 0.2s;
}
.compact-card:hover {
  border-color: #ff9800;
}
.icon-box {
  border: 1px solid #ff9800;
}
</style>
