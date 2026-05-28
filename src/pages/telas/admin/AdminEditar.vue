<template>
  <q-page class="q-pa-lg text-white bg-grey-10 flex column justify-between">
    <div class="col">
      <div class="row items-center justify-between q-mb-xl">
        <div class="row items-center q-gutter-md">
          <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.back()" />
          <q-avatar size="56px" color="grey-9" text-color="orange-8" class="border-orange">
            <q-icon :name="obterIconeMaquina(modeloNome)" size="30px" />
          </q-avatar>
          <div>
            <div class="text-h5 text-weight-bold text-capitalize">
              {{ formatarTitulo(modeloNome) }}
            </div>
          </div>
        </div>

        <q-badge
          color="grey-9"
          text-color="orange-8"
          class="q-pa-sm text-weight-bold text-subtitle2 border-grey"
        >
          {{ itens.length }} {{ itens.length === 1 ? 'Item' : 'Itens' }}
        </q-badge>
      </div>

      <div v-if="itens.length === 0" class="text-center q-pa-xl text-grey-6 column items-center">
        <q-icon name="playlist_add" size="64px" class="q-mb-md" />
        <div class="text-h6">Nenhuma pergunta cadastrada</div>
        <q-btn color="orange-8" label="Adicionar Novo" icon="add" no-caps @click="adicionarItem" />
      </div>

      <div class="q-gutter-y-md q-mb-xl">
        <q-card
          v-for="(item, index) in itens"
          :key="index"
          class="bg-grey-9 text-white item-card q-pa-md relative-position transition-card"
        >
          <div class="absolute-top-right q-pa-xs" style="z-index: 1">
            <q-badge
              v-if="item.jaSalvo"
              color="green-10"
              text-color="green-4"
              class="text-weight-bold text-caption q-px-sm border-green"
            >
              <q-icon name="check" size="12px" class="q-mr-xs" /> Salvo
            </q-badge>
            <q-badge
              v-else
              color="orange-10"
              text-color="orange-4"
              class="text-weight-bold text-caption q-px-sm border-orange-status animate-fade"
            >
              <q-icon name="edit_note" size="14px" class="q-mr-xs" /> Pendente
            </q-badge>
          </div>

          <div class="row items-center q-col-gutter-md q-mt-xs">
            <div class="col-auto">
              <div class="item-number text-weight-bold text-grey-6">{{ index + 1 }}</div>
            </div>
            <div class="col">
              <q-input
                v-model="item.texto"
                @update:model-value="item.jaSalvo = false"
                label="Descreva o item..."
                dark
                filled
                square
                dense
                class="premium-input"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-btn-toggle
                v-model="item.tipo"
                @update:model-value="item.jaSalvo = false"
                spread
                dense
                unelevated
                toggle-color="orange-8"
                toggle-text-color="black"
                color="grey-10"
                text-color="grey-4"
                :options="[
                  { value: 'TRAFFIC_LIGHT', slot: 'traffic' },
                  { value: 'YES_NO', slot: 'yesno' },
                ]"
              >
                <template v-slot:traffic>
                  <q-icon name="traffic" class="q-mr-xs" /> Semáforo
                </template>
                <template v-slot:yesno>
                  <q-icon name="flaky" class="q-mr-xs" /> Sim / Não
                </template>
              </q-btn-toggle>
            </div>
            <div class="col-auto">
              <q-btn
                icon="delete_outline"
                color="red-5"
                flat
                round
                dense
                class="delete-btn"
                @click="solicitarRemocao(index)"
              />
            </div>
          </div>
        </q-card>
      </div>
    </div>

    <div
      v-if="itens.length > 0"
      class="sticky-footer row no-wrap items-center bg-grey-9 q-pa-md border-top-grey"
    >
      <q-btn
        outline
        color="orange-8"
        label="Adicionar"
        icon="add"
        no-caps
        class="text-weight-bold"
        @click="adicionarItem"
      />

      <q-space />

      <q-btn
        color="orange-8"
        text-color="black"
        label="Salvar"
        icon="save"
        class="text-weight-bold"
        @click="salvarTudo()"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, onBeforeRouteLeave } from 'vue-router'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import { useQuasar } from 'quasar'

const route = useRoute()
const $q = useQuasar()
const itens = ref([])
const modeloNome = route.params.modelo

// Funções Auxiliares
const formatarTitulo = (slug) => (slug ? slug.replace('_', ' ').replace('-', ' ') : '')
const obterIconeMaquina = (m) =>
  ({
    distribuidor: 'grid_view',
    pulverizador: 'opacity',
    plantadeira: 'agriculture',
    plataforma: 'view_headline',
    trator: 'precision_manufacturing',
  })[m] || 'help_outline'

const adicionarItem = () => itens.value.push({ texto: '', tipo: 'TRAFFIC_LIGHT', jaSalvo: false })

// Diálogo de Exclusão Premium (Dark Mode) + Salvar Automático
const solicitarRemocao = (index) => {
  $q.dialog({
    dark: true,
    title: 'Excluir Pergunta',
    message: 'Tem certeza que deseja remover este item do checklist?',
    color: 'red-5',
    cancel: { label: 'Cancelar', color: 'grey-5', flat: true },
    ok: { label: 'Excluir', color: 'red-5', flat: true },
    persistent: true,
  }).onOk(async () => {
    // 1. Remove da tela
    itens.value.splice(index, 1)

    // 2. Salva e envia a mensagem personalizada de exclusão
    await salvarTudo('Excluído com sucesso!')
  })
}

// Proteção de Rota Premium (Dark Mode)
// Proteção de Rota Premium (Ignora itens vazios)
onBeforeRouteLeave((to, from, next) => {
  // Verifica se há algum item não salvo que TENHA texto escrito
  const temAlteracoesReais = itens.value.some((i) => !i.jaSalvo && i.texto.trim() !== '')

  if (temAlteracoesReais) {
    $q.dialog({
      dark: true,
      title: 'Alterações Pendentes',
      message: 'Você tem perguntas não salvas. Deseja sair e perder essas alterações?',
      color: 'orange-8',
      cancel: { label: 'Ficar na página', color: 'grey-5', flat: true },
      ok: { label: 'Sair mesmo assim', color: 'orange-8', flat: true },
    })
      .onOk(() => next())
      .onCancel(() => next(false))
  } else {
    next()
  }
})

// Firebase
const carregarDados = async () => {
  const docRef = doc(db, route.params.colecao, route.params.modelo)
  const docSnap = await getDoc(docRef)
  itens.value = docSnap.exists() ? docSnap.data().itens.map((i) => ({ ...i, jaSalvo: true })) : []
}

async function salvarTudo(mensagem = 'Salvo com sucesso!') {
  // Limpeza automática: remove da tela itens que estão 100% vazios
  itens.value = itens.value.filter((i) => i.texto.trim() !== '')

  // LIMPEZA PARA O BANCO: Cria uma cópia dos itens removendo o 'jaSalvo'
  const itensParaSalvar = itens.value.map((item) => {
    return {
      texto: item.texto,
      tipo: item.tipo,
    }
  })

  $q.loading.show()
  try {
    // Agora mandamos apenas os "itensParaSalvar" (limpos) para o Firebase
    await setDoc(
      doc(db, route.params.colecao, route.params.modelo),
      { itens: itensParaSalvar },
      { merge: true },
    )

    // A tela continua usando o itens.value normal com o jaSalvo
    itens.value.forEach((i) => (i.jaSalvo = true))

    $q.notify({ icon: 'check_circle', message: mensagem, color: 'green-8', position: 'top-right' })
  } catch {
    $q.notify({ icon: 'error', message: 'Erro ao salvar', color: 'red-8', position: 'top-right' })
  } finally {
    $q.loading.hide()
  }
}

onMounted(carregarDados)
</script>

<style scoped>
.border-orange {
  border: 1px solid #ff9800;
}
.border-grey {
  border: 1px solid #424242;
}
.border-top-grey {
  border-top: 1px solid #424242;
}
.border-green {
  border: 1px solid #2e7d32;
}
.border-orange-status {
  border: 1px solid #ef6c00;
}

.item-card {
  border: 1px solid #333333;
  border-radius: 8px;
}

.transition-card {
  transition:
    border-color 0.3s,
    transform 0.2s;
}

.item-card:hover {
  border-color: #555555;
  transform: translateX(2px);
}

.item-number {
  font-size: 1.1rem;
  min-width: 24px;
}

.premium-input :deep(.q-field__control) {
  background-color: #121212 !important;
  border-radius: 6px;
  border: 1px solid #333333;
  transition: border-color 0.3s;
}

.premium-input :deep(.q-field__control:before),
.premium-input :deep(.q-field__control:after) {
  display: none;
}

.premium-input:focus-within :deep(.q-field__control) {
  border-color: #ff9800 !important;
}

.delete-btn:hover {
  background-color: rgba(244, 67, 54, 0.1);
}

.sticky-footer {
  margin: 40px -24px -24px -24px;
  border-radius: 0 0 12px 12px;
}

.animate-fade {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.8;
  }
}
</style>
