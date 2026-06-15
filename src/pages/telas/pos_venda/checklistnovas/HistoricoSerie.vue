<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center justify-between q-mb-xl q-col-gutter-sm">
      <div class="row items-center q-gutter-sm">
        <q-btn flat round icon="arrow_back" color="orange-8" @click="voltar" />
        <div>
          <div class="text-h5 text-weight-bold">Histórico por Nº de Série</div>
          <div class="text-caption text-grey-5">Pesquise a vida completa de uma máquina</div>
        </div>
      </div>
    </div>

    <q-input
      v-model="serieBusca"
      label="Digite o número de série"
      dark
      outlined
      color="orange-8"
      class="q-mb-lg"
      @keyup.enter="pesquisarSerie()"
    >
      <template v-slot:append>
        <q-btn round dense flat icon="search" color="orange-8" @click="pesquisarSerie()" />
      </template>
    </q-input>

    <div v-if="resultado" class="column q-gutter-md">
      <q-card class="compact-card bg-grey-9 text-white">
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <div class="text-h6 text-weight-bold text-orange-8">{{ resultado.modelo }}</div>
              <div class="text-caption text-grey-5">Série: {{ resultado.serie }}</div>
            </div>
            <q-badge color="orange-8" class="text-black text-weight-bold">
              {{ resultado.totalEventos }} evento(s)
            </q-badge>
          </div>
        </q-card-section>
      </q-card>

      <q-timeline color="orange-8">
        <q-timeline-entry
          v-for="(evento, idx) in resultado.historico"
          :key="idx"
          :title="tituloEvento(evento.tipo)"
          :subtitle="`${formatarData(evento.dataConclusao || evento.data)} — ${evento.unidadeAtual || evento.unidade || evento.de || 'N/A'}`"
          :icon="iconeEvento(evento.tipo)"
          :color="corEvento(evento.tipo)"
        >
          <!-- Layout para eventos normais -->
          <div v-if="evento.tipo !== 'edicao'">
            <div class="text-grey-4 q-mb-sm">{{ evento.nomeMaquina }}</div>
            <div
              v-if="evento.para || evento.unidadeDestino || evento.cliente"
              class="text-caption text-orange q-mb-sm"
            >
              <q-icon name="local_shipping" size="xs" class="q-mr-xs" />
              {{ evento.de || evento.unidade || evento.unidadeAtual || 'Estoque' }} ➝
              {{ evento.para || evento.unidadeDestino || evento.cliente }}
            </div>
            <div class="text-grey-5 text-caption q-mb-xs">
              Responsável: {{ evento.responsavel || evento.assinaturas?.responsavelNome || 'N/A' }}
              <span v-if="evento.motorista"> / Motorista: {{ evento.motorista }}</span>
            </div>
          </div>

          <!-- Layout para edições do checklist -->
          <div v-else>
            <div class="text-grey-5 text-caption q-mb-xs">
              Responsável: {{ evento.responsavel || 'N/A' }} —
              {{ evento.unidadeAtual || evento.unidade || 'Local não registrado' }}
            </div>
            <div class="text-caption text-grey-5 q-mb-sm">
              {{ evento.observacao || 'Sem observação' }}
            </div>
            <div v-for="(alt, i) in evento.alteracoes" :key="i" class="text-caption text-orange">
              {{ alt.item || alt.campo }}: {{ alt.de }} → {{ alt.para }}
            </div>
          </div>

          <div class="row q-gutter-sm q-mt-sm">
            <q-btn
              v-if="evento.pdfNome"
              size="sm"
              color="grey-8"
              icon="picture_as_pdf"
              label="Ver PDF"
              @click="abrirPdfServidor(evento.pdfNome)"
            />
            <q-btn
              v-if="evento.tipo !== 'edicao'"
              size="sm"
              color="orange-8"
              text-color="black"
              icon="checklist"
              label="Ver Checklist"
              @click="abrirChecklist(evento)"
            />
            <q-btn
              v-if="evento.tipo === 'edicao'"
              size="sm"
              color="purple-6"
              text-color="white"
              icon="checklist"
              label="Ver Checklist Atual"
              @click="abrirChecklist(evento)"
            />
          </div>
        </q-timeline-entry>
      </q-timeline>
    </div>

    <div v-else-if="pesquisou" class="text-center q-mt-xl">
      <q-icon name="search_off" size="48px" color="grey-6" />
      <div class="text-grey-5 q-mt-sm">Nenhum histórico encontrado para esta série.</div>
    </div>

    <q-dialog
      v-model="dialogChecklistAberto"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-grey-10 text-white">
        <q-card-section class="bg-grey-9 row items-center justify-between">
          <div class="text-h6 text-orange-8">Checklist Cadastrado</div>
          <q-btn
            flat
            round
            dense
            icon="close"
            color="grey-5"
            @click="dialogChecklistAberto = false"
          />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div v-if="checklistItens.length === 0" class="text-center text-grey-5 q-mt-lg">
            Nenhum item de checklist registrado para esta máquina.
          </div>

          <q-list v-else separator>
            <q-item v-for="(item, idx) in checklistItens" :key="idx">
              <q-item-section>
                <q-item-label class="text-white">{{ item.texto }}</q-item-label>
                <q-item-label caption>
                  <span v-if="item.observacao" class="text-grey-5">{{ item.observacao }}</span>
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge :color="corChecklist(item.resposta)">
                  {{ item.resposta || 'N/A' }}
                </q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { doc, getDoc } from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import localforage from 'localforage'
import { getAuth } from 'firebase/auth'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const perfisUsuario = ref([])
const dialogChecklistAberto = ref(false)
const checklistItens = ref([])
const serieBusca = ref('')
const resultado = ref(null)
const pesquisou = ref(false)

import { API_BASE_URL } from 'src/utils/ServidorApi.js'
const voltar = async () => {
  try {
    // Tenta resgatar os perfis do usuário na sessão local ou Firebase
    let perfis = perfisUsuario.value
    if (!perfis || perfis.length === 0) {
      const sessao = await localforage.getItem('user_session')
      perfis = sessao?.perfis || []
    }
    if (!perfis || perfis.length === 0) {
      const auth = getAuth()
      const user = auth.currentUser
      if (user) {
        const snap = await getDoc(doc(db, 'usuarios', user.uid))
        if (snap.exists()) {
          perfis = snap.data().perfis || []
          perfisUsuario.value = perfis
        }
      }
    }

    // Perfis que visualizam o Controle de Máquinas (ajuste conforme os seus perfis reais)
    const perfisComAcesso = ['master', 'adm_pos_venda', 'gerente_comercial']
    const temAcesso = Array.isArray(perfis) && perfis.some((p) => perfisComAcesso.includes(p))

    if (temAcesso) {
      router.push('/inicio/pos-venda/maquinas')
    } else {
      router.push('/inicio')
    }
  } catch (e) {
    console.error('Erro ao verificar perfil para voltar:', e)
    router.push('/inicio')
  }
}

const pesquisarSerie = async (serieParam = null) => {
  const serie =
    (typeof serieParam === 'string' ? serieParam : null) || serieBusca.value.trim().toUpperCase()
  if (!serie) return

  pesquisou.value = true
  serieBusca.value = serie

  try {
    const docRef = doc(db, 'maquinas', serie)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      resultado.value = null
      return
    }

    const dados = docSnap.data()
    const historico = dados.historico || []
    const edicoes = dados.edicoesChecklist || []

    // Converte edições para formato da timeline
    const edicoesFormatadas = edicoes.map((ed) => ({
      tipo: 'edicao',
      dataConclusao: ed.data,
      responsavel: ed.responsavel,
      observacao: ed.observacao,
      nomeMaquina: dados.modelo || 'Máquina',
      alteracoes: ed.alteracoes,
      pdfNome: ed.pdfNome,
    }))

    const timeline = [...historico, ...edicoesFormatadas]

    // Remove duplicados entre histórico e edições (mesmo pdfNome = mesma edição)
    const vistos = new Set()
    const timelineUnica = timeline.filter((item) => {
      const chave = item.pdfNome || item.idUnicoAcao || JSON.stringify(item.alteracoes)
      if (vistos.has(chave)) return false
      vistos.add(chave)
      return true
    })

    ordenarPorData(timelineUnica)

    resultado.value = {
      serie: serie,
      modelo: dados.modelo || 'Máquina',
      totalEventos: timelineUnica.length,
      historico: timelineUnica,
      checklistEntrada: dados.checklistEntrada || [],
    }
  } catch (e) {
    console.error('Erro ao buscar histórico:', e)
    $q.notify({ type: 'negative', message: 'Erro ao buscar histórico da série.' })
  }
}

const abrirChecklist = (evento) => {
  if (evento.checklistEntrada && evento.checklistEntrada.length > 0) {
    checklistItens.value = evento.checklistEntrada
  } else if (evento.respostasChecklist && evento.respostasChecklist.length > 0) {
    checklistItens.value = evento.respostasChecklist
  } else {
    checklistItens.value = resultado.value.checklistEntrada || []
  }
  dialogChecklistAberto.value = true
}

const corChecklist = (resposta) => {
  const map = {
    BOM: 'positive',
    ATENCAO: 'warning',
    RUIM: 'negative',
    SIM: 'positive',
    NAO: 'negative',
  }
  return map[resposta] || 'grey'
}

const ordenarPorData = (lista) => {
  lista.sort((a, b) => {
    const dataA = (a.dataConclusao || a.data || '').slice(0, 10)
    const dataB = (b.dataConclusao || b.data || '').slice(0, 10)

    if (dataA !== dataB) {
      const [aA, mA, dA] = dataA.split('-')
      const [aB, mB, dB] = dataB.split('-')
      return new Date(aA, mA - 1, dA) - new Date(aB, mB - 1, dB)
    }

    return (a.numero || 0) - (b.numero || 0)
  })
}
const formatarData = (dataStr) => {
  if (!dataStr) return ''

  // Se for ISO completo (com T ou Z), extrai só a data
  const dataLimpa = dataStr.includes('T') ? dataStr.split('T')[0] : dataStr

  // Cria data LOCAL (sem interpretar como UTC)
  const [ano, mes, dia] = dataLimpa.split('-')
  const d = new Date(Number(ano), Number(mes) - 1, Number(dia))

  return d.toLocaleDateString('pt-BR')
}

// Melhoria #8 Mapeamento exato das strings salvas no Firebase para labels elegantes na interface
const tituloEvento = (tipo) => {
  const map = {
    recebimento: 'Recebimento de Máquina',
    recebimento_transferencia: 'Recebimento por Transferência',
    transferencia: 'Transferência de Máquina',
    venda: 'Venda / Saída de NF',
    entrega_cliente: 'Entrega Efetuada ao Cliente',
    // NOVO:
    edicao: 'Edição de Checklist',
  }
  return map[tipo] || 'Evento Operacional'
}

const iconeEvento = (tipo) => {
  const map = {
    recebimento: 'download_done',
    transferencia: 'local_shipping',
    venda: 'handshake',
    recebimento_transferencia: 'move_to_inbox',
    entrega_cliente: 'task_alt',
    // NOVO:
    edicao: 'edit_note',
  }
  return map[tipo] || 'help'
}

const corEvento = (tipo) => {
  const map = {
    recebimento: 'positive',
    transferencia: 'warning',
    venda: 'orange',
    recebimento_transferencia: 'positive',
    entrega_cliente: 'green-6',
    // NOVO:
    edicao: 'purple-6',
  }
  return map[tipo] || 'grey'
}

const abrirPdfServidor = (pdfNome) => {
  if (!pdfNome) return
  const url = `${API_BASE_URL}/api/pos-venda/pdf/${encodeURIComponent(pdfNome)}`
  window.open(url, '_blank')
}

onMounted(async () => {
  try {
    const sessao = await localforage.getItem('user_session')
    perfisUsuario.value = sessao?.perfis || []
  } catch (e) {
    console.warn('Erro ao carregar perfis da sessão:', e)
  }

  if (route.query.serie) {
    pesquisarSerie(route.query.serie)
  }
})
</script>

<style scoped>
.compact-card {
  border: 1px solid #333;
  border-radius: 8px;
}
</style>
