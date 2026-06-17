<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center justify-between q-mb-xl q-col-gutter-sm">
      <div class="row items-center q-gutter-sm">
        <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
        <div>
          <div class="text-h5 text-weight-bold">Despacho de Usadas</div>
          <div class="text-caption text-grey-5">Máquinas avaliadas aguardando despacho</div>
        </div>
      </div>
    </div>

    <div v-if="carregando" class="flex flex-center q-py-xl">
      <q-spinner color="orange-8" size="48px" />
    </div>

    <div v-else-if="avaliacoes.length === 0" class="flex flex-center column q-py-xl text-center">
      <q-icon name="pending_actions" size="72px" color="grey-7" class="q-mb-md" />
      <div class="text-h6 text-grey-5 q-mb-sm">Nenhuma avaliação pendente</div>
      <div class="text-body2 text-grey-6">
        Quando um vendedor finalizar um checklist de máquina usada, ela aparecerá aqui.
      </div>
    </div>

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
              <div class="text-caption text-grey-6 q-mt-xs">
                <q-icon name="schedule" size="13px" color="grey-5" class="q-mr-xs" />
                Avaliado em {{ formatarData(av.dataAvaliacao) }}
              </div>
            </div>
            <div class="col-auto q-ml-sm">
              <q-badge color="orange-9" text-color="white" rounded class="q-px-sm q-py-xs">
                Aguardando despacho
              </q-badge>
            </div>
          </div>
        </q-card-section>

        <q-separator color="grey-8" />

        <q-card-actions align="right" class="bg-grey-10 q-pa-sm">
          <q-btn
            flat
            color="orange-8"
            icon="local_shipping"
            label="Criar Despacho"
            @click="abrirDialogoDespacho(av)"
          />
        </q-card-actions>
      </q-card>
    </div>

    <q-dialog v-model="dialogDespachoAberto" persistent>
      <q-card class="bg-grey-9 text-white" style="min-width: 350px; border-radius: 12px">
        <q-card-section class="row items-center">
          <div class="text-h6 text-orange-8">Criar Despacho</div>
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
          <q-btn flat color="grey-5" label="Cancelar" @click="dialogDespachoAberto = false" />
          <q-btn
            color="orange-8"
            text-color="black"
            label="Confirmar Despacho"
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
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import { getAuth } from 'firebase/auth'
<<<<<<< HEAD
import { useUnidades } from 'src/composables/useUnidades' // IMPORTADO DO SEU SISTEMA
=======
import { useUnidades } from 'src/composables/useUnidades'
>>>>>>> 2fed1eb04798d26c1817777495e31ab2548687e0

const $q = useQuasar()

const carregando = ref(true)
const avaliacoes = ref([])
const motoristas = ref([])
const { unidades, carregarUnidades } = useUnidades()
const dialogDespachoAberto = ref(false)
const maquinaSelecionada = ref(null)
const salvando = ref(false)

// Puxa as unidades reais do seu banco
const { unidades, carregarUnidades } = useUnidades()

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

const buscarAvaliacoes = async () => {
  carregando.value = true
  try {
    const q = query(collection(db, 'avaliacoes_usadas'), where('status', '==', 'avaliada'))
    const snap = await getDocs(q)
    avaliacoes.value = snap.docs.map((d) => d.data())
  } catch (e) {
    console.error('Erro ao buscar avaliações:', e)
    $q.notify({ type: 'negative', message: 'Erro ao carregar avaliações.' })
  } finally {
    carregando.value = false
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

const abrirDialogoDespacho = (maquina) => {
  maquinaSelecionada.value = maquina
  despacho.value = { unidadeDestino: '', motorista: null, observacao: '' }
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

    // 1. Cria o documento na coleção despachos_usados (LIMPO, SEM FOTOS/ASSINATURAS DO VENDEDOR)
    const docDespacho = await addDoc(collection(db, 'despachos_usados'), {
      // Dados da máquina
      serie: av.serie,
      modelo: av.modelo,
      marca: av.marca || '',
      ano: av.ano || '',
      horimetro: av.horimetro || '',

<<<<<<< HEAD
      // Envia apenas o checklist (que é texto leve).
      // O motorista filtra os obrigatórios no lado dele.
=======
      // Dados originais do vendedor
>>>>>>> 2fed1eb04798d26c1817777495e31ab2548687e0
      checklistAvaliacao: av.checklistAvaliacao || [],
      cliente: av.cliente || '',

      // Dados do despacho
      unidadeOrigem: av.cidade || 'Matriz',
      unidadeDestino: despacho.value.unidadeDestino,
      motoristaUid: despacho.value.motorista.uid,
      motoristaNome: despacho.value.motorista.nome,
      dataDespacho: Timestamp.now(),
      status: 'despachado',
      observacaoGerente: despacho.value.observacao || '',

      // Inicializados em branco — o motorista vai preencher na hora de carregar
      dataCarregamento: null,
      fotosCarregamento: null, // Motorista vai inserir
      assinaturaMotoristaImagem: null, // Motorista vai inserir
      observacoesMotorista: {},

      // Para a etapa seguinte (Recebimento)
      dataRecebimento: null,
      recebidoPor: '',
      assinaturaRecebedorImagem: null,
      checklistRecebimento: [],
      pdfDespachoNome: null,
      pdfRecebimentoNome: null,

      // Metadados
      despachadoPor: auth.currentUser?.uid || '',
      nomeDespachador: auth.currentUser?.displayName || '',
    })

    // 2. Atualiza a avaliação para 'despachada'
    await updateDoc(doc(db, 'avaliacoes_usadas', av.serie), {
      status: 'despachada',
      despachoId: docDespacho.id,
    })

    $q.notify({ type: 'positive', message: 'Despacho criado com sucesso!' })
    dialogDespachoAberto.value = false

    // Atualiza lista
    await buscarAvaliacoes()
  } catch (e) {
    console.error('Erro ao criar despacho:', e)
    $q.notify({ type: 'negative', message: 'Erro ao criar despacho.' })
  } finally {
    salvando.value = false
  }
}

onMounted(async () => {
<<<<<<< HEAD
  await carregarUnidades() // Busca as unidades reais no banco
=======
  await carregarUnidades()
>>>>>>> 2fed1eb04798d26c1817777495e31ab2548687e0
  await buscarMotoristas()
  await buscarAvaliacoes()
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
