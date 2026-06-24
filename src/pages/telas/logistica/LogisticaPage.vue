<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="q-mb-lg">
      <div class="text-h5 text-weight-bold">Logística</div>
      <div class="text-caption text-grey-5">Gerencie entregas e transportes</div>
    </div>

    <div class="column q-gutter-md">
      <!-- Entregas Pendentes -->
      <q-card
        clickable
        class="bg-grey-9 text-white custom-card"
        style="border: 1px solid #333; border-radius: 8px"
        @click="$router.push('/inicio/logistica/entregas')"
      >
        <q-card-section class="row items-center no-wrap">
          <div class="relative-position">
            <q-avatar size="48px" color="orange-8" text-color="black">
              <q-icon name="local_shipping" size="28px" />
            </q-avatar>
            <q-badge v-if="totalPendentesEntregas > 0" color="red-7" floating rounded>
              {{ totalPendentesEntregas }}
            </q-badge>
          </div>
          <div class="q-ml-md col">
            <div class="text-subtitle1 text-weight-bold row items-center">Entregas Pendentes</div>
            <div class="text-caption text-grey-5">
              Máquinas vendidas aguardando entrega ao cliente
            </div>
          </div>
          <q-icon name="chevron_right" color="grey-6" size="24px" />
        </q-card-section>
      </q-card>

      <!-- 🆕 Carregar Usadas (Negociação) -->
      <q-card
        clickable
        class="bg-grey-9 text-white custom-card"
        style="border: 1px solid #333; border-radius: 8px"
        @click="$router.push('/inicio/logistica/carregar-usada')"
      >
        <q-card-section class="row items-center no-wrap">
          <div class="relative-position">
            <q-avatar size="48px" color="purple-6" text-color="white">
              <q-icon name="swap_horiz" size="28px" />
            </q-avatar>
            <q-badge
              v-if="totalPendentesUsadas > 0"
              color="red-7"
              floating
              rounded
              class="text-weight-bold flex flex-center shadow-2 pulse-badge"
              style="padding: 4px 6px; font-size: 11px; top: -4px; right: -4px"
            >
              {{ totalPendentesUsadas }}
            </q-badge>
          </div>
          <div class="q-ml-md col">
            <div class="text-subtitle1 text-weight-bold row items-center text-purple-4">
              Coletar Usadas
            </div>
            <div class="text-caption text-grey-5">
              Máquinas usadas para coletar na fazenda do cliente
            </div>
          </div>
          <q-icon name="chevron_right" color="grey-6" size="24px" />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import { getAuth } from 'firebase/auth'
import localforage from 'localforage'

// Estados Reativos
const totalPendentesEntregas = ref(0)
const minhaUnidade = ref('')
const totalPendentesUsadas = ref(0)

/**
 * Busca a quantidade de máquinas que estão aguardando entrega na filial do usuário
 */
const consultarEntregasPendentes = async () => {
  try {
    const sessao = await localforage.getItem('user_session')
    if (sessao) {
      minhaUnidade.value = sessao.unidade || sessao.cidade || ''
    }

    if (!minhaUnidade.value) {
      console.warn('⚠️ Nenhuma unidade identificada na sessão do usuário.')
      return
    }

    const maquinasRef = collection(db, 'maquinas')
    const q = query(
      maquinasRef,
      where('status', '==', 'aguardando_entrega_cliente'),
      where('unidadeAtual', '==', minhaUnidade.value),
    )

    const querySnapshot = await getDocs(q)
    totalPendentesEntregas.value = querySnapshot.size
  } catch (error) {
    console.error('Erro ao contabilizar entregas pendentes:', error)
  }
}

const consultarDespachosPendentes = async () => {
  try {
    const uid = getAuth().currentUser?.uid
    if (!uid) return

    const q = query(
      collection(db, 'despachos_usados'),
      where('motoristaUid', '==', uid),
      where('status', '==', 'despachado'),
    )
    const snap = await getDocs(q)
    totalPendentesUsadas.value = snap.size
  } catch (e) {
    console.warn('Erro ao buscar despachos:', e)
  }
}

onMounted(() => {
  consultarEntregasPendentes()
  consultarDespachosPendentes()
})
</script>

<style scoped>
.custom-card {
  transition:
    transform 0.2s,
    border-color 0.2s;
}
.custom-card:hover {
  border-color: #ff9800 !important;
  transform: translateY(-1px);
}

/* Efeito sutil para chamar a atenção para o número de pendências */
.pulse-badge {
  box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.7);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  70% {
    box-shadow: 0 0 0 6px rgba(211, 47, 47, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(211, 47, 47, 0);
  }
}
</style>
