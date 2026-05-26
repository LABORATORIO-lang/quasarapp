<template>
  <q-page class="q-pa-lg text-white bg-grey-10 flex column justify-between">
    <div class="col">
      <div class="row items-center justify-between q-mb-xl">
        <div class="row items-center q-gutter-md">
          <q-btn flat round icon="arrow_back" color="orange-8" @click="confirmarVoltar" />
          <q-avatar size="56px" color="grey-9" text-color="orange-8" class="border-orange">
            <q-icon :name="obterIconeMaquina(modeloNome)" size="30px" />
          </q-avatar>
          <div>
            <div class="text-h5 text-weight-bold text-capitalize">
              {{ formatarTitulo(modeloNome) }}
            </div>
            <div class="text-caption text-grey-5">
              Configuração dos itens do checklist comercial
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
        <div class="text-caption q-mb-lg">
          Adicione manualmente ou cole sua lista de perguntas pronta.
        </div>

        <div class="row q-gutter-md">
          <q-btn
            outline
            color="grey-5"
            label="Adicionar 1 por vez"
            icon="add"
            no-caps
            @click="adicionarItem"
          />
          <q-btn
            color="orange-8"
            text-color="black"
            label="Colar Lista Pronta"
            icon="content_paste"
            no-caps
            class="text-weight-bold"
            @click="abrirImportacaoEmMassa"
          />
        </div>
      </div>

      <div class="q-gutter-y-md q-mb-xl">
        <q-card
          v-for="(item, index) in itens"
          :key="index"
          class="bg-grey-9 text-white item-card q-pa-md transition-card relative-position"
        >
          <div class="absolute-top-right q-pa-xs">
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
              <q-icon name="fiber_new" size="14px" class="q-mr-xs" /> Novo Item
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
                label="Descreva o item de verificação..."
                label-color="grey-5"
                dark
                filled
                square
                dense
                class="premium-input"
              />
            </div>

            <div class="col-12 col-md-4">
              <div class="text-caption text-grey-5 q-mb-xs">Formato da Resposta</div>
              <q-btn-toggle
                v-model="item.tipo"
                @update:model-value="item.jaSalvo = false"
                spread
                no-caps
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
                  <q-icon name="traffic" class="q-mr-xs" />
                  <span class="text-weight-medium">Semáforo</span>
                </template>
                <template v-slot:yesno>
                  <q-icon name="flaky" class="q-mr-xs" />
                  <span class="text-weight-medium">Sim / Não</span>
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
              >
                <q-tooltip class="bg-red text-white">Excluir Pergunta</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card>
      </div>
    </div>

    <div
      v-if="itens.length > 0"
      class="sticky-footer row justify-between items-center bg-grey-9 q-pa-md border-top-grey"
    >
      <div class="row q-gutter-sm">
        <q-btn
          outline
          color="orange-8"
          label="Adicionar Novo"
          icon="add"
          no-caps
          class="text-weight-bold"
          @click="adicionarItem"
        />
        <q-btn
          outline
          color="grey-5"
          label="Colar Mais Itens"
          icon="content_paste"
          no-caps
          @click="abrirImportacaoEmMassa"
        />
      </div>
      <q-btn
        color="orange-8"
        text-color="black"
        label="Salvar Alterações"
        icon="save"
        no-caps
        class="text-weight-bold q-px-xl"
        @click="confirmarSalvar"
      />
      <q-btn
        color="orange-8"
        text-color="black"
        label="Salvar Alterações"
        icon="save"
        class="text-weight-bold"
        @click="salvarTudo"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import { useQuasar } from 'quasar'

const route = useRoute()
const $q = useQuasar()
const itens = ref([])

// Esta função busca no Firestore usando o parâmetro da URL
const carregarDados = async () => {
  const colecao = route.params.colecao // ex: 'checklistcomercial'
  const modelo = route.params.modelo // ex: 'distribuidor'

  try {
    const docRef = doc(db, colecao, modelo)
    const docSnap = await getDoc(docRef)
    itens.value = docSnap.exists() ? docSnap.data().itens.map((i) => ({ ...i, jaSalvo: true })) : []
  } catch (e) {
    console.error(e)
  }
}

async function salvarTudo() {
  const colecao = route.params.colecao
  const modelo = route.params.modelo

  $q.loading.show()
  try {
    await setDoc(doc(db, colecao, modelo), { itens: itens.value }, { merge: true })
    itens.value.forEach((i) => (i.jaSalvo = true))
    $q.notify({ message: 'Salvo!', color: 'positive' })
  } catch {
    $q.notify({ message: 'Erro ao salvar', color: 'negative' })
  } finally {
    $q.loading.hide()
  }
}

onMounted(carregarDados)
watch(() => route.params, carregarDados)

defineExpose({
  itens,
  salvarTudo,
  adicionarItem: () => itens.value.push({ texto: '', tipo: 'TRAFFIC_LIGHT', jaSalvo: false }),
})
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
