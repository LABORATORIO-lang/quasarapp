<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <!-- Cabeçalho -->
    <div class="row items-center justify-between q-mb-xl q-col-gutter-sm">
      <div class="row items-center q-gutter-sm">
        <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
        <div>
          <div class="text-h5 text-weight-bold">Programação de Coleta</div>
          <div class="text-caption text-grey-5">Máquinas avaliadas — criar ou alterar coleta</div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="carregando" class="flex flex-center q-py-xl">
      <q-spinner color="orange-8" size="48px" />
    </div>

    <!-- Sem acesso -->
    <div v-else-if="!temAcesso" class="flex flex-center column q-py-xl text-center">
      <q-icon name="block" size="72px" color="red-7" class="q-mb-md" />
      <div class="text-h6 text-grey-5">Acesso restrito</div>
      <div class="text-body2 text-grey-6">Apenas master e gerente comercial.</div>
    </div>

    <!-- Lista vazia -->
    <div v-else-if="avaliacoes.length === 0" class="flex flex-center column q-py-xl text-center">
      <q-icon name="pending_actions" size="72px" color="grey-7" class="q-mb-md" />
      <div class="text-h6 text-grey-5 q-mb-sm">Nenhuma avaliação encontrada</div>
      <div class="text-body2 text-grey-6">Não há máquinas avaliadas na sua unidade no momento.</div>
    </div>

    <!-- Lista de avaliações -->
    <div v-else class="q-gutter-md">
      <q-card
        v-for="av in avaliacoes"
        :key="av.serie"
        class="bg-grey-9 text-white"
        style="border-radius: 12px; border: 1px solid #424242"
      >
        <q-card-section class="q-pb-sm">
          <div class="row items-start justify-between no-wrap">
            <div class="col">
              <div class="text-h6 text-weight-bold text-orange-8">{{ av.modelo }}</div>
              <div class="text-caption text-grey-5">Série: {{ av.serie }}</div>
              <div class="text-caption text-grey-5 q-mt-xs">
                <q-icon name="person" size="13px" color="grey-5" class="q-mr-xs" />
                Vendedor: {{ av.vendedor }} — Cliente: {{ av.cliente }}
              </div>
              <div class="text-caption text-grey-5 q-mt-xs">
                <q-icon name="place" size="13px" color="grey-5" class="q-mr-xs" />
                Unidade: {{ av.unidade || 'Não informada' }}
              </div>
              <div class="text-caption text-grey-6 q-mt-xs">
                <q-icon name="schedule" size="13px" color="grey-5" class="q-mr-xs" />
                Avaliado em {{ formatarData(av.dataAvaliacao) }}
              </div>

              <!-- Status do despacho -->
              <div v-if="av.status !== 'avaliada'" class="q-mt-sm">
                <div class="text-caption text-grey-5">Coleta programada para:</div>
                <div class="text-caption text-orange-4">
                  <q-icon name="local_shipping" size="13px" class="q-mr-xs" />
                  {{ av.motoristaNome || 'Não informado' }} →
                  {{ av.unidadeDestino || 'Não informada' }}
                </div>
              </div>
            </div>

            <div class="col-auto q-ml-sm">
              <q-badge
                :color="corStatus(av.status)"
                text-color="white"
                rounded
                class="q-px-sm q-py-xs"
              >
                {{ labelStatus(av.status) }}
              </q-badge>
            </div>
          </div>
        </q-card-section>

        <q-separator color="grey-8" />

        <q-card-actions align="right" class="bg-grey-10 q-pa-sm">
          <q-btn
            v-if="av.status === 'avaliada'"
            flat
            color="orange-8"
            icon="local_shipping"
            label="Programar Coleta"
            @click="abrirDialogoDespacho(av)"
          />
          <q-btn
            v-else-if="av.status === 'despachada'"
            flat
            color="orange-8"
            icon="edit"
            label="Alterar Coleta"
            @click="abrirDialogoDespacho(av, true)"
          />
        </q-card-actions>
      </q-card>
    </div>

    <!-- Dialog de Despacho -->
    <q-dialog v-model="dialogDespachoAberto" persistent>
      <q-card class="bg-grey-9 text-white" style="min-width: 350px; border-radius: 12px">
        <q-card-section class="row items-center">
          <div class="text-h6 text-orange-8">
            {{ modoEdicao ? 'Alterar Coleta' : 'Programar Coleta' }}
          </div>
          <q-space />
          <q-btn
            flat
            round
            dense
            icon="close"
            color="grey-5"
            @click="dialogDespachoAberto = false"
          />
        </q-card-section>

        <q-card-section class="q-gutter-y-md">
          <div class="text-caption text-grey-5">
            <strong>{{ maquinaSelecionada?.modelo }}</strong> — {{ maquinaSelecionada?.serie }}
          </div>

          <q-select
            v-model="despacho.unidadeDestino"
            :options="unidades"
            label="Unidade de Destino"
            dark
            outlined
            dense
            color="orange-8"
            :rules="[(val) => !!val || 'Obrigatório']"
          />

          <q-select
            v-model="despacho.motorista"
            :options="motoristas"
            label="Motorista"
            option-label="nome"
            option-value="uid"
            dark
            outlined
            dense
            color="orange-8"
            :rules="[(val) => !!val || 'Obrigatório']"
          />

          <q-input
            v-model="despacho.observacao"
            label="Observação (opcional)"
            dark
            outlined
            dense
            color="orange-8"
            autogrow
          />
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-10">
          <q-btn
            v-if="modoEdicao"
            flat
            color="red-5"
            label="Cancelar Coleta"
            @click="cancelarDespacho"
            :loading="salvando"
          />
          <q-space />
          <q-btn flat color="grey-5" label="Fechar" @click="dialogDespachoAberto = false" />
          <q-btn
            color="orange-8"
            text-color="black"
            :label="modoEdicao ? 'Salvar Alterações' : 'Confirmar Coleta'"
            @click="confirmarDespacho"
            :loading="salvando"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import { getAuth } from 'firebase/auth'
import localforage from 'localforage'

const $q = useQuasar()

const carregando = ref(true)
const temAcesso = ref(false)
const avaliacoes = ref([])
const motoristas = ref([])
const unidades = ref([])
const dialogDespachoAberto = ref(false)
const maquinaSelecionada = ref(null)
const modoEdicao = ref(false)
const salvando = ref(false)
const despachoAtualId = ref(null)

const despacho = ref({
  unidadeDestino: '',
  motorista: null,
  observacao: '',
})

const formatarData = (iso) => {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('pt-BR')
  } catch {
    return ''
  }
}

const corStatus = (status) => {
  const map = {
    avaliada: 'orange-9',
    despachada: 'purple-6',
    carregado: 'green-8',
    recebido: 'blue-8',
  }
  return map[status] || 'grey-8'
}

const labelStatus = (status) => {
  const map = {
    avaliada: 'Aguardando coleta',
    despachada: 'Coleta Programada',
    carregado: 'Coletada',
    recebido: 'Recebida',
  }
  return map[status] || status
}

// Juína e Campo Novo são a mesma gerência
const getGrupoUnidade = (cidade) => {
  const c = (cidade || '').toString().trim().toLowerCase()
  const grupoJuinaCampoNovo = ['juína', 'juina', 'campo novo', 'campo novo do parecis']
  if (grupoJuinaCampoNovo.includes(c)) return 'juina-campo-novo'
  return c
}

const verificarAcesso = async () => {
  const sessao = (await localforage.getItem('user_session')) || {}
  const perfis = sessao.perfis || []
  temAcesso.value = perfis.includes('master') || perfis.includes('gerente_comercial')
  return {
    perfis,
    cidade: sessao.unidade || sessao.cidade || '',
  }
}

const carregarUnidades = async () => {
  try {
    const snap = await getDoc(doc(db, 'configuracoes', 'geral'))
    if (snap.exists()) {
      const dados = snap.data()
      if (Array.isArray(dados.unidades) && dados.unidades.length > 0) {
        unidades.value = dados.unidades.filter((u) => u !== 'Todas')
        return
      }
    }
    unidades.value = []
  } catch (e) {
    console.error('Erro ao carregar unidades do Firebase:', e)
    unidades.value = []
  }
}

const buscarMotoristas = async () => {
  try {
    const q = query(collection(db, 'usuarios'), where('perfis', 'array-contains', 'motorista'))
    const snap = await getDocs(q)
    motoristas.value = snap.docs.map((d) => ({
      uid: d.id,
      nome: d.data().nome || 'Sem nome',
      ...d.data(),
    }))
  } catch (e) {
    console.warn('Erro ao buscar motoristas:', e)
  }
}

const buscarAvaliacoes = async (userCidade) => {
  carregando.value = true
  try {
    const userGrupo = getGrupoUnidade(userCidade)

    const snap = await getDocs(collection(db, 'avaliacoes_usadas'))
    const todas = snap.docs.map((d) => d.data())

    avaliacoes.value = todas.filter((av) => {
      const grupoAv = getGrupoUnidade(av.unidade)
      return grupoAv === userGrupo && ['avaliada', 'despachada'].includes(av.status)
    })
  } catch (e) {
    console.error('Erro ao buscar avaliações:', e)
    $q.notify({ type: 'negative', message: 'Erro ao carregar avaliações.' })
  } finally {
    carregando.value = false
  }
}

const abrirDialogoDespacho = (maquina, edicao = false) => {
  maquinaSelecionada.value = maquina
  modoEdicao.value = edicao
  despachoAtualId.value = maquina.despachoId || null

  if (edicao && maquina.unidadeDestino && maquina.motoristaNome) {
    despacho.value = {
      unidadeDestino: maquina.unidadeDestino,
      motorista: motoristas.value.find((m) => m.nome === maquina.motoristaNome) || null,
      observacao: maquina.observacaoGerente || '',
    }
  } else {
    despacho.value = { unidadeDestino: '', motorista: null, observacao: '' }
  }

  dialogDespachoAberto.value = true
}

const confirmarDespacho = async () => {
  if (!despacho.value.unidadeDestino) {
    $q.notify({ type: 'warning', message: 'Selecione a unidade de destino.' })
    return
  }
  if (!despacho.value.motorista) {
    $q.notify({ type: 'warning', message: 'Selecione o motorista.' })
    return
  }

  salvando.value = true
  try {
    const av = maquinaSelecionada.value
    const auth = getAuth()

    if (modoEdicao.value && despachoAtualId.value) {
      // ALTERAÇÃO
      await updateDoc(doc(db, 'despachos_usados', despachoAtualId.value), {
        unidadeDestino: despacho.value.unidadeDestino,
        motoristaUid: despacho.value.motorista.uid,
        motoristaNome: despacho.value.motorista.nome,
        observacaoGerente: despacho.value.observacao || '',
      })

      await updateDoc(doc(db, 'avaliacoes_usadas', av.serie), {
        motoristaNome: despacho.value.motorista.nome,
        unidadeDestino: despacho.value.unidadeDestino,
        observacaoGerente: despacho.value.observacao || '',
      })

      $q.notify({ type: 'positive', message: 'Despacho atualizado!' })
    } else {
      // NOVO
      const docDespacho = await addDoc(collection(db, 'despachos_usados'), {
        serie: av.serie,
        modelo: av.modelo,
        marca: av.marca || '',
        ano: av.ano || '',
        horimetro: av.horimetro || '',
        checklistAvaliacao: av.checklistAvaliacao || [],
        cliente: av.cliente || '',
        unidadeOrigem: av.cidade || 'Não informada',
        unidadeDestino: despacho.value.unidadeDestino,
        motoristaUid: despacho.value.motorista.uid,
        motoristaNome: despacho.value.motorista.nome,
        dataDespacho: Timestamp.now(),
        status: 'despachado',
        observacaoGerente: despacho.value.observacao || '',
        dataCarregamento: null,
        fotosCarregamento: null,
        assinaturaMotoristaImagem: null,
        observacoesMotorista: {},
        dataRecebimento: null,
        recebidoPor: '',
        assinaturaRecebedorImagem: null,
        checklistRecebimento: [],
        pdfDespachoNome: null,
        pdfRecebimentoNome: null,
        despachadoPor: auth.currentUser?.uid || '',
        nomeDespachador: auth.currentUser?.displayName || '',
      })

      await updateDoc(doc(db, 'avaliacoes_usadas', av.serie), {
        status: 'despachada',
        despachoId: docDespacho.id,
        motoristaNome: despacho.value.motorista.nome,
        unidadeDestino: despacho.value.unidadeDestino,
        observacaoGerente: despacho.value.observacao || '',
      })

      $q.notify({ type: 'positive', message: 'Coleta atualizada!' })
    }

    dialogDespachoAberto.value = false
    await buscarAvaliacoes(av.cidade)
  } catch (e) {
    console.error('Erro ao salvar coleta:', e)
    $q.notify({ type: 'negative', message: 'Erro ao salvar coleta.' })
  } finally {
    salvando.value = false
  }
}

const cancelarDespacho = async () => {
  if (!despachoAtualId.value) return

  $q.dialog({
    title: 'Cancelar Coleta',
    message: 'Deseja cancelar esta coleta? A máquina voltará para "Aguardando coleta".',
    cancel: 'Não',
    ok: { label: 'Sim, cancelar', color: 'red' },
    persistent: true,
  }).onOk(async () => {
    salvando.value = true
    try {
      const av = maquinaSelecionada.value

      await updateDoc(doc(db, 'despachos_usados', despachoAtualId.value), {
        status: 'cancelado',
        dataCancelamento: Timestamp.now(),
      })

      await updateDoc(doc(db, 'avaliacoes_usadas', av.serie), {
        status: 'avaliada',
        despachoId: null,
        motoristaNome: null,
        unidadeDestino: null,
        observacaoGerente: null,
      })

      $q.notify({ type: 'positive', message: 'Coleta cancelada.' })
      dialogDespachoAberto.value = false
      await buscarAvaliacoes(av.cidade)
    } catch (e) {
      console.error('Erro ao cancelar despacho:', e)
      $q.notify({ type: 'negative', message: 'Erro ao cancelar coleta.' })
    } finally {
      salvando.value = false
    }
  })
}

onMounted(async () => {
  const { cidade } = await verificarAcesso()
  await carregarUnidades()
  await buscarMotoristas()
  if (temAcesso.value) {
    await buscarAvaliacoes(cidade)
  }
})
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
</style>
