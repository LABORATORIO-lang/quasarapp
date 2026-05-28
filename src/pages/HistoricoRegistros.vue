<template>
  <q-page class="q-pa-md bg-grey-10 text-white">
    <div class="row items-center q-mb-lg">
      <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.back()" />
      <div class="text-h6 text-weight-bold text-uppercase text-orange-8 q-ml-sm">
        Histórico Offline - {{ tituloSetor }}
      </div>
    </div>

    <q-card class="bg-grey-9 shadow-3" style="border-radius: 12px; border: 1px solid #424242">
      <q-list separator dark>
        <q-item v-if="checklists.length === 0" class="q-pa-md text-center text-grey-5">
          Nenhum registo guardado para o setor {{ tituloSetor }}.
        </q-item>

        <q-item v-for="chk in checklists" :key="chk.id" class="q-py-md">
          <q-item-section avatar>
            <q-avatar color="orange-8" text-color="white" icon="offline_pin" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-bold text-white">
              {{ chk.formulario?.cliente || chk.cliente || 'Sem Nome' }}
              {{ chk.nomeMaquina ? '- ' + chk.nomeMaquina : '' }}
            </q-item-label>
            <q-item-label caption class="text-grey-4">
              Data: {{ formatarData(chk.dataCriacao) }}
            </q-item-label>
            <q-item-label caption class="text-grey-5">
              Modelo: {{ chk.formulario?.modelo || 'N/A' }} | Série:
              {{ chk.formulario?.serie || 'N/A' }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="row q-gutter-sm">
              <q-btn
                outline
                round
                color="red-5"
                icon="delete"
                size="sm"
                @click="excluirRegisto(chk.id)"
              />
              <q-btn
                outline
                color="orange-8"
                icon="picture_as_pdf"
                label="Ver PDF"
                size="sm"
                @click="abrirPDF(chk)"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import localforage from 'localforage'

// Aqui importamos o nosso gerador de PDF (mais tarde poderá importar os de outros setores)
import { gerarChecklistPdf } from 'src/utils/pdfGenerator'

const $q = useQuasar()
const route = useRoute()
const checklists = ref([])

// 1. Descobrimos qual é o setor olhando para o URL (ex: 'comercial', 'pos-venda')
const setorAtual = route.params.setor || 'geral'

// 2. Criamos o nome da "gaveta" na memória onde estão os ficheiros (ex: 'historico_comercial')
const chaveArmazenamento = `historico_${setorAtual}`

// 3. Título bonito para mostrar no ecrã
const tituloSetor = computed(() => {
  return setorAtual.charAt(0).toUpperCase() + setorAtual.slice(1).replace('-', ' ')
})

onMounted(async () => {
  await carregarHistoricoOffline()
})

const carregarHistoricoOffline = async () => {
  $q.loading.show({ message: 'A carregar ficheiros...' })
  try {
    // Procura dinamicamente a chave correspondente ao setor!
    const dadosLocais = await localforage.getItem(chaveArmazenamento)
    checklists.value = dadosLocais || []
  } catch (error) {
    console.error('Erro ao buscar histórico:', error)
    $q.notify({ message: 'Erro ao carregar o histórico local', color: 'red' })
  } finally {
    $q.loading.hide()
  }
}

const abrirPDF = async (dadosDoRegisto) => {
  $q.loading.show({ message: 'A processar PDF...' })
  try {
    // Esta inteligência permite-lhe no futuro gerar PDFs diferentes dependendo do setor
    if (setorAtual === 'comercial') {
      await gerarChecklistPdf(dadosDoRegisto)
    } else if (setorAtual === 'pos-venda') {
      // Quando criar o PDF do Pós-venda, chame-o aqui!
      $q.notify({ message: 'PDF do Pós-Venda ainda em desenvolvimento.', color: 'info' })
    } else {
      await gerarChecklistPdf(dadosDoRegisto) // Fallback
    }
  } catch (error) {
    console.error(error)
    $q.notify({ message: 'Erro ao abrir o PDF', color: 'red' })
  } finally {
    $q.loading.hide()
  }
}

const excluirRegisto = (id) => {
  $q.dialog({
    title: 'Confirmar Exclusão',
    message: 'Tem a certeza que deseja apagar este registo do dispositivo?',
    cancel: true,
    persistent: true,
    ok: { color: 'red', label: 'Apagar' },
  }).onOk(async () => {
    checklists.value = checklists.value.filter((chk) => chk.id !== id)
    // Atualiza a gaveta correta na memória
    await localforage.setItem(chaveArmazenamento, checklists.value)
    $q.notify({ message: 'Registo removido do dispositivo.', color: 'positive' })
  })
}

const formatarData = (dataIso) => {
  if (!dataIso) return '-'
  const data = new Date(dataIso)
  return data.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
