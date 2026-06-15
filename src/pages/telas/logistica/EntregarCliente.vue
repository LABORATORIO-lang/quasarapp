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
              {{ ent.modelo }}
            </span>
          </div>
          <div class="text-caption text-grey-4">Série: {{ ent.serie }}</div>
          <div class="text-caption text-grey-5 q-mt-xs">
            <q-icon name="person" size="xs" class="q-mr-xs" />
            Cliente: {{ ent.cliente }}
          </div>
          <div class="text-caption text-grey-5">
            <q-icon name="place" size="xs" class="q-mr-xs" />
            Endereço: {{ ent.endereco || 'Não informado' }}
          </div>
          <div class="text-caption text-grey-6 q-mt-xs">Venda em: {{ formatarData(ent.data) }}</div>
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
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import { getAuth } from 'firebase/auth'
import { useRouter } from 'vue-router'
import localforage from 'localforage'

const router = useRouter()
const $q = useQuasar()

const entregas = ref([])
const carregando = ref(false)

const carregarEntregas = async () => {
  carregando.value = true
  try {
    const user = getAuth().currentUser
    if (!user) return

    const q = query(
      collection(db, 'notificacoes'),
      where('tipo', '==', 'entrega_cliente'),
      where('motoristaUid', '==', user.uid),
      where('lida', '==', false),
    )
    const snapshot = await getDocs(q)

    const lista = []
    snapshot.forEach((docSnap) => {
      lista.push({ id: docSnap.id, ...docSnap.data(), processando: false })
    })
    lista.sort((a, b) => {
      const ta = a.criadaEm?.seconds || 0
      const tb = b.criadaEm?.seconds || 0
      return tb - ta
    })
    entregas.value = lista
  } catch (e) {
    console.error('Erro ao carregar entregas:', e)
    $q.notify({ type: 'negative', message: 'Erro ao carregar entregas pendentes.' })
  } finally {
    carregando.value = false
  }
}

const iniciarEntrega = async (ent) => {
  ent.processando = true
  try {
    const maquinaSnap = await getDoc(doc(db, 'maquinas', ent.serie))
    const dadosMaquina = maquinaSnap.exists() ? maquinaSnap.data() : {}
    console.log(
      'Dados salvos no localforage:',
      await localforage.getItem('entrega_cliente_pendente'),
    )
    await localforage.setItem(
      'entrega_cliente_pendente',
      JSON.parse(
        JSON.stringify({
          serie: ent.serie,
          modelo: ent.modelo,
          marca: dadosMaquina.marca || '',
          ano: dadosMaquina.ano || '',
          horimetro: dadosMaquina.horimetro || '',
          cliente: ent.cliente,
          endereco: ent.endereco || '',
          cpfCnpj: ent.cpfCnpj || '',
          notificacaoId: ent.id,
          checklistEntrada: ent.checklistEntrada || dadosMaquina.checklistEntrada || [],
        }),
      ),
    )

    router.push({
      path: '/inicio/pos-venda/checklist/formulario/recebimento',
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
    $q.notify({ type: 'negative', message: 'Erro ao carregar dados da máquina.' })
  } finally {
    ent.processando = false
  }
}

const formatarData = (dataStr) => {
  if (!dataStr) return ''
  const d = new Date(dataStr)
  return d.toLocaleDateString('pt-BR')
}

onMounted(carregarEntregas)
</script>
