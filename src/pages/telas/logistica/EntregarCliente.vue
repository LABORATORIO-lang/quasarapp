<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center q-gutter-sm q-mb-lg">
      <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
      <div>
        <div class="text-h5 text-weight-bold">Entregas Pendentes</div>
        <div class="text-caption text-grey-5">Máquinas vendidas para entrega ao cliente</div>
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
            <q-icon name="local_shipping" color="orange-8" size="sm" />
            <span class="text-subtitle1 text-weight-bold text-orange-8">
              {{ ent.modelo || 'Máquina sem modelo' }}
            </span>
          </div>

          <div class="text-caption text-grey-4">Série: {{ ent.serie }}</div>

          <div class="text-caption text-grey-4 q-mt-xs">
            Status: <span class="text-weight-bold text-positive">CARREGADA</span>
          </div>

          <div class="text-caption text-grey-5 q-mt-xs">
            <q-icon name="person" size="xs" class="q-mr-xs" />
            Cliente: {{ ent.cliente || 'Não informado' }}
          </div>

          <div v-if="ent.endereco" class="text-caption text-grey-5 q-mt-xs">
            <q-icon name="place" size="xs" class="q-mr-xs" />
            Endereço: {{ ent.endereco }}
          </div>
        </q-card-section>

        <q-card-actions class="q-px-md q-pb-md">
          <q-btn
            color="positive"
            icon="handshake"
            label="Iniciar Entrega"
            :loading="ent.processando"
            @click="iniciarEntrega(ent)"
          />
        </q-card-actions>
      </q-card>
    </div>
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
let unsubscribe = null

const carregarEntregas = async () => {
  carregando.value = true

  const user = getAuth().currentUser
  if (!user) {
    carregando.value = false
    return
  }

  const q = query(
    collection(db, 'notificacoes'),
    where('tipo', '==', 'entrega_cliente'),
    where('motoristaUid', '==', user.uid),
    where('lida', '==', false),
  )

  unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const lista = []
      snapshot.forEach((docSnap) => {
        lista.push({
          id: docSnap.id,
          ...docSnap.data(),
          processando: false,
        })
      })

      entregas.value = lista
      carregando.value = false
    },
    (e) => {
      console.error('Erro ao carregar entregas:', e)
      $q.notify({ type: 'negative', message: 'Erro ao carregar entregas pendentes.' })
      carregando.value = false
    },
  )
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
  if (unsubscribe) unsubscribe()
})
</script>
