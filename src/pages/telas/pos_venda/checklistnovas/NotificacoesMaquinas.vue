<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center q-gutter-sm q-mb-lg">
      <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
      <div>
        <div class="text-h5 text-weight-bold">Notificações</div>
        <div class="text-caption text-grey-5">Máquinas a caminho da sua unidade</div>
      </div>
    </div>

    <div v-if="carregando" class="text-center q-mt-xl">
      <q-spinner color="orange-8" size="40px" />
      <div class="text-grey-5 q-mt-sm">Carregando...</div>
    </div>

    <div v-else-if="notificacoes.length === 0" class="text-center q-mt-xl">
      <q-icon name="notifications_none" size="48px" color="grey-6" />
      <div class="text-grey-5 q-mt-sm">Nenhuma notificação pendente.</div>
    </div>

    <div v-else class="column q-gutter-sm">
      <q-card
        v-for="notif in notificacoes"
        :key="notif.id"
        class="bg-grey-9 text-white"
        style="border: 1px solid #ff9800; border-radius: 8px"
      >
        <q-card-section>
          <div class="row items-start justify-between no-wrap">
            <div class="col">
              <div class="row items-center q-gutter-xs q-mb-xs">
                <q-icon name="local_shipping" color="orange-8" size="sm" />
                <span class="text-subtitle1 text-weight-bold text-orange-8">
                  {{ notif.modelo }}
                </span>
              </div>
              <div class="text-caption text-grey-4">Série: {{ notif.serie }}</div>
              <div class="text-caption text-grey-5 q-mt-xs">
                <q-icon name="place" size="xs" class="q-mr-xs" />
                {{ notif.de }} ➝ {{ notif.para }}
              </div>
              <div class="text-caption text-grey-5">
                <q-icon name="person" size="xs" class="q-mr-xs" />
                Motorista: {{ notif.motorista || 'N/A' }}
              </div>
              <div class="text-caption text-grey-6 q-mt-xs">
                {{ formatarData(notif.data) }}
              </div>
            </div>
            <q-btn
              flat
              round
              icon="check_circle"
              color="positive"
              size="sm"
              @click="marcarComoLida(notif)"
            >
              <q-tooltip>Marcar como lida</q-tooltip>
            </q-btn>
          </div>
        </q-card-section>

        <q-card-actions class="q-pt-none q-px-md q-pb-md">
          <q-btn
            size="sm"
            color="orange-8"
            text-color="black"
            icon="download_done"
            label="Registrar Recebimento"
            @click="irParaRecebimento(notif)"
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
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from 'src/boot/firebase'

const $q = useQuasar()
const router = useRouter()

const notificacoes = ref([])
const carregando = ref(false)

const carregarNotificacoes = async () => {
  carregando.value = true
  try {
    const auth = getAuth()
    const user = auth.currentUser
    if (!user) return

    const userDoc = await getDoc(doc(db, 'usuarios', user.uid))
    if (!userDoc.exists()) return

    const cidadeUsuario = userDoc.data().cidade
    if (!cidadeUsuario) return

    const q = query(
      collection(db, 'notificacoes'),
      where('para', '==', cidadeUsuario),
      where('lida', '==', false),
    )
    const snapshot = await getDocs(q)
    const lista = []
    snapshot.forEach((docSnap) => {
      lista.push({ id: docSnap.id, ...docSnap.data() })
    })
    lista.sort((a, b) => {
      const ta = a.criadaEm?.seconds || 0
      const tb = b.criadaEm?.seconds || 0
      return tb - ta
    })
    notificacoes.value = lista
  } catch (e) {
    console.error('Erro ao carregar notificações:', e)
    $q.notify({ type: 'negative', message: 'Erro ao carregar notificações.' })
  } finally {
    carregando.value = false
  }
}

const marcarComoLida = async (notif) => {
  try {
    await updateDoc(doc(db, 'notificacoes', notif.id), { lida: true })
    notificacoes.value = notificacoes.value.filter((n) => n.id !== notif.id)
    $q.notify({ type: 'positive', message: 'Notificação marcada como lida.' })
  } catch (e) {
    console.error('Erro ao marcar notificação:', e)
    $q.notify({ type: 'negative', message: 'Erro ao atualizar notificação.' })
  }
}

const irParaRecebimento = (notif) => {
  router.push({
    path: '/inicio/pos-venda/maquinas/receber-transferencia',
    query: { serie: notif.serie, de: notif.de },
  })
}

const formatarData = (dataStr) => {
  if (!dataStr) return ''
  const d = new Date(dataStr)
  return d.toLocaleDateString('pt-BR')
}

onMounted(carregarNotificacoes)
</script>
