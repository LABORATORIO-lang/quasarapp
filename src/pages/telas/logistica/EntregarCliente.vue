<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center q-gutter-sm q-mb-lg">
      <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
      <div>
        <div class="text-h5 text-weight-bold">Entregas Pendentes</div>
        <div class="text-caption text-grey-5">
          Máquinas vendidas para entrega ao cliente e usadas coletadas para entrega na unidade
        </div>
      </div>
    </div>

    <div v-if="carregando" class="text-center q-mt-xl">
      <q-spinner color="orange-8" size="40px" />
      <div class="text-grey-5 q-mt-sm">Carregando...</div>
    </div>

    <div v-else-if="entregas.length === 0" class="text-center q-mt-xl">
      <q-icon name="check_circle" size="48px" color="grey-6" />
      <div class="text-grey-5 q-mt-sm">Nenhuma entrega pendente.</div>
    </div>

    <div v-else class="column q-gutter-md">
      <q-card
        v-for="ent in entregas"
        :key="ent.id"
        class="bg-grey-9 text-white"
        style="border: 1px solid #ff9800; border-radius: 8px"
      >
        <q-card-section>
          <div class="row items-center q-gutter-xs q-mb-xs">
            <q-icon
              :name="ent.tipo === 'entrega_usada' ? 'local_shipping' : 'local_shipping'"
              color="orange-8"
              size="sm"
            />
            <span class="text-subtitle1 text-weight-bold text-orange-8">
              {{ ent.modelo || 'Máquina sem modelo' }}
            </span>

            <q-badge
              v-if="ent.tipo === 'entrega_usada'"
              color="purple-6"
              text-color="white"
              rounded
              class="q-ml-sm q-px-sm"
            >
              USADA
            </q-badge>
          </div>

          <div class="text-caption text-grey-4">Série: {{ ent.serie }}</div>

          <div class="text-caption text-grey-4 q-mt-xs">
            Status:
            <span
              class="text-weight-bold"
              :class="ent.tipo === 'entrega_usada' ? 'text-purple-4' : 'text-positive'"
            >
              {{ ent.tipo === 'entrega_usada' ? 'COLETADA - EM TRÂNSITO' : 'CARREGADA' }}
            </span>
          </div>

          <div class="text-caption text-grey-5 q-mt-xs">
            <q-icon name="person" size="xs" class="q-mr-xs" />
            Cliente: {{ ent.cliente || 'Não informado' }}
          </div>

          <div class="text-caption text-grey-5 q-mt-xs">
            <q-icon name="place" size="xs" class="q-mr-xs" />
            {{
              ent.tipo === 'entrega_usada'
                ? `Entregar em: ${ent.unidadeDestino || 'Não informada'}`
                : `Endereço: ${ent.endereco || 'Não informado'}`
            }}
          </div>

          <div v-if="ent.unidadeOrigem" class="text-caption text-grey-6 q-mt-xs">
            <q-icon name="logout" size="xs" class="q-mr-xs" />
            Origem: {{ ent.unidadeOrigem }}
          </div>
        </q-card-section>

        <q-card-actions class="q-px-md q-pb-md">
          <!-- Botão para entrega a cliente -->
          <q-btn
            v-if="ent.tipo === 'entrega_cliente'"
            color="positive"
            icon="handshake"
            label="Iniciar Entrega"
            :loading="ent.processando"
            @click="iniciarEntrega(ent)"
          />

          <!-- Botão para usada coletada: abre dialog com detalhes -->
          <q-btn
            v-else
            color="purple-6"
            icon="visibility"
            label="Ver Coleta"
            @click="abrirDetalheUsada(ent)"
          />
        </q-card-actions>
      </q-card>
    </div>

    <!-- Dialog de detalhes da usada coletada -->
    <q-dialog v-model="dialogUsadaAberto">
      <q-card class="bg-grey-9 text-white" style="min-width: 320px; border-radius: 12px">
        <q-card-section class="row items-center">
          <div class="text-h6 text-orange-8">{{ usadaSelecionada?.modelo }}</div>
          <q-space />
          <q-btn flat round dense icon="close" color="grey-5" @click="dialogUsadaAberto = false" />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-caption text-grey-5">Série: {{ usadaSelecionada?.serie }}</div>
          <div class="text-caption text-grey-5 q-mt-xs">
            Cliente: {{ usadaSelecionada?.cliente || 'Não informado' }}
          </div>
          <div class="text-caption text-grey-5 q-mt-xs">
            Entregar em: {{ usadaSelecionada?.unidadeDestino || 'Não informada' }}
          </div>
          <div class="text-caption text-grey-5 q-mt-xs">
            Origem: {{ usadaSelecionada?.unidadeOrigem || 'Não informada' }}
          </div>
          <div class="text-caption text-grey-6 q-mt-md">
            A entrega desta máquina usada na unidade será confirmada pelo recebedor na tela de
            recebimento.
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat color="grey-5" label="Fechar" @click="dialogUsadaAberto = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import { getAuth } from 'firebase/auth'
import { useRouter } from 'vue-router'
import localforage from 'localforage'

const $q = useQuasar()
const router = useRouter()

const entregas = ref([])
const carregando = ref(false)
const dialogUsadaAberto = ref(false)
const usadaSelecionada = ref(null)

let unsubscribeNotificacoes = null
let unsubscribeDespachos = null

const carregarEntregas = async () => {
  carregando.value = true

  const user = getAuth().currentUser
  if (!user) {
    carregando.value = false
    return
  }

  // 1. Entregas a cliente (notificações)
  const q1 = query(
    collection(db, 'notificacoes'),
    where('tipo', '==', 'entrega_cliente'),
    where('motoristaUid', '==', user.uid),
    where('lida', '==', false),
  )

  // 2. Usadas coletadas em trânsito (despachos_usados)
  const q2 = query(
    collection(db, 'despachos_usados'),
    where('status', '==', 'carregado'),
    where('motoristaUid', '==', user.uid),
  )

  unsubscribeNotificacoes = onSnapshot(
    q1,
    (snapshot) => {
      const listaNotificacoes = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        tipo: 'entrega_cliente',
        ...docSnap.data(),
        processando: false,
      }))

      mesclarEntregas(listaNotificacoes, 'notificacoes')
    },
    (e) => {
      console.error('Erro ao carregar notificações:', e)
      $q.notify({ type: 'negative', message: 'Erro ao carregar entregas de cliente.' })
    },
  )

  unsubscribeDespachos = onSnapshot(
    q2,
    (snapshot) => {
      const listaDespachos = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        tipo: 'entrega_usada',
        modelo: docSnap.data().modelo,
        serie: docSnap.data().serie,
        cliente: docSnap.data().cliente,
        unidadeDestino: docSnap.data().unidadeDestino,
        unidadeOrigem: docSnap.data().unidadeOrigem,
        ...docSnap.data(),
        processando: false,
      }))

      mesclarEntregas(listaDespachos, 'despachos')
    },
    (e) => {
      console.error('Erro ao carregar despachos:', e)
      $q.notify({ type: 'negative', message: 'Erro ao carregar usadas coletadas.' })
    },
  )
}

const mesclarEntregas = (novaLista, origem) => {
  // Remove os itens antigos dessa origem
  entregas.value = entregas.value.filter((e) => e._origem !== origem)

  // Adiciona os novos
  entregas.value.push(...novaLista.map((item) => ({ ...item, _origem: origem })))

  // Atualiza o loading
  carregando.value = false
}

const abrirDetalheUsada = (ent) => {
  usadaSelecionada.value = ent
  dialogUsadaAberto.value = true
}

const iniciarEntrega = async (ent) => {
  ent.processando = true
  try {
    await localforage.setItem('entrega_cliente_pendente', JSON.parse(JSON.stringify(ent)))
    router.push({
      path: '/inicio/logistica/confirmar-entrega',
      query: {
        modo: 'entrega_cliente',
        serie: ent.serie,
        modelo: ent.modelo,
        cliente: ent.cliente,
        notificacaoId: ent.id,
        de: ent.de,
      },
    })
  } catch (e) {
    console.error('Erro ao iniciar entrega:', e)
    $q.notify({ type: 'negative', message: 'Erro ao iniciar entrega.' })
  } finally {
    ent.processando = false
  }
}

onMounted(carregarEntregas)

onUnmounted(() => {
  if (unsubscribeNotificacoes) unsubscribeNotificacoes()
  if (unsubscribeDespachos) unsubscribeDespachos()
})
</script>
