<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center q-gutter-sm q-mb-lg">
      <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
      <div>
        <div class="text-h5 text-weight-bold">Receber Transferência</div>
        <div class="text-caption text-grey-5">Máquinas a caminho da sua unidade</div>
      </div>
    </div>

    <div v-if="carregando" class="text-center q-mt-xl">
      <q-spinner color="orange-8" size="40px" />
      <div class="text-grey-5 q-mt-sm">Carregando...</div>
    </div>

    <div v-else-if="maquinas.length === 0" class="text-center q-mt-xl">
      <q-icon name="inventory_2" size="48px" color="grey-6" />
      <div class="text-grey-5 q-mt-sm">Nenhuma máquina em trânsito para sua unidade.</div>
    </div>

    <div v-else class="column q-gutter-md">
      <q-card
        v-for="maq in maquinas"
        :key="maq.id"
        class="bg-grey-9 text-white"
        style="border: 1px solid #ff9800; border-radius: 8px"
      >
        <q-card-section>
          <div class="row items-center q-gutter-xs q-mb-xs">
            <q-icon name="local_shipping" color="orange-8" size="sm" />
            <span class="text-subtitle1 text-weight-bold text-orange-8">
              {{ maq.modelo }}
            </span>
          </div>
          <div class="text-caption text-grey-4">Série: {{ maq.serie }}</div>
          <div class="text-caption text-grey-5 q-mt-xs">
            <q-icon name="place" size="xs" class="q-mr-xs" />
            {{ maq.de }} ➝ {{ maq.para }}
          </div>
          <div class="text-caption text-grey-5">
            <q-icon name="person" size="xs" class="q-mr-xs" />
            Motorista: {{ maq.motorista || 'N/A' }}
          </div>
          <div class="text-caption text-grey-6 q-mt-xs">
            Enviado em: {{ formatarData(maq.data) }}
          </div>
        </q-card-section>

        <q-card-actions class="q-px-md q-pb-md">
          <q-btn
            color="positive"
            icon="download_done"
            label="Confirmar Recebimento"
            :loading="maq.processando"
            @click="iniciarRecebimento(maq)"
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
import { useRouter } from 'vue-router'
import localforage from 'localforage'
const router = useRouter()
const $q = useQuasar()

const maquinas = ref([])
const carregando = ref(false)
const cidadeUsuario = ref('')

const carregarMaquinas = async () => {
  carregando.value = true
  try {
    const sessao = await localforage.getItem('user_session')
    if (!sessao || !sessao.unidade) return
    cidadeUsuario.value = sessao.unidade

    if (!cidadeUsuario.value) return

    const q = query(
      collection(db, 'notificacoes'),
      where('para', '==', cidadeUsuario.value),
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
    maquinas.value = lista
  } catch (e) {
    console.error('Erro ao carregar máquinas:', e)
    $q.notify({ type: 'negative', message: 'Erro ao carregar máquinas em trânsito.' })
  } finally {
    carregando.value = false
  }
}
const iniciarRecebimento = async (maq) => {
  maq.processando = true
  try {
    // Busca dados completos da máquina
    const maquinaSnap = await getDoc(doc(db, 'maquinas', maq.serie))
    const dadosMaquina = maquinaSnap.exists() ? maquinaSnap.data() : {}

    // Salva tudo no localforage — incluindo checklist de saída
    await localforage.setItem(
      'transferencia_pendente',
      JSON.parse(
        JSON.stringify({
          serie: maq.serie,
          modelo: maq.modelo,
          marca: dadosMaquina.marca || '',
          ano: dadosMaquina.ano || '',
          horimetro: dadosMaquina.horimetro || '',
          de: maq.de,
          notificacaoId: maq.id,
          checklistEntrada: maq.checklistEntrada || [],
          observacoesItens: maq.observacoesItens || {},
        }),
      ),
    )

    router.push({
      path: '/inicio/pos-venda/checklist/formulario/recebimento',
      query: {
        modo: 'transferencia',
        serie: maq.serie,
        modelo: maq.modelo,
        de: maq.de,
        notificacaoId: maq.id,
      },
    })
  } catch (e) {
    console.error('Erro ao iniciar recebimento:', e)
    $q.notify({ type: 'negative', message: 'Erro ao carregar dados da máquina.' })
  } finally {
    maq.processando = false
  }
}

const formatarData = (dataStr) => {
  if (!dataStr) return ''
  const d = new Date(dataStr)
  return d.toLocaleDateString('pt-BR')
}

onMounted(carregarMaquinas)
</script>
