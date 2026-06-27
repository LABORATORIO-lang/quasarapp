<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center justify-between q-mb-xl q-col-gutter-sm">
      <div class="row items-center q-gutter-sm">
        <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
        <div>
          <div class="text-h5 text-weight-bold">Menu Pós-Venda</div>
          <div class="text-caption text-grey-5">
            Gerencie máquinas, vistorias e cálculos de plantio
          </div>
        </div>
      </div>
    </div>

    <div class="column q-gutter-sm">
      <!-- Controle de Máquinas -->
      <q-card
        v-if="temAcesso('maquinas')"
        clickable
        class="compact-card bg-grey-9 text-white"
        @click="router.push('/inicio/pos-venda/maquinas')"
      >
        <q-card-section class="row items-center no-wrap q-pa-sm">
          <q-avatar size="36px" color="grey-10" text-color="orange-8" class="icon-box">
            <q-icon name="agriculture" size="20px" />
          </q-avatar>
          <div class="q-ml-md col">
            <div class="text-subtitle1 text-weight-bold text-orange-8">Controle de Máquinas</div>
            <div class="text-caption text-grey-5">
              Gerencie recebimentos, transferências e vendas
            </div>
          </div>
          <q-icon name="chevron_right" color="grey-6" size="24px" />
        </q-card-section>
      </q-card>

      <!-- Cálculo de Plantio -->
      <q-card
        v-if="temAcesso('calculo_plantio')"
        clickable
        class="compact-card bg-grey-9 text-white"
        @click="router.push('/inicio/pos-venda/calculo-plantio')"
      >
        <q-card-section class="row items-center no-wrap q-pa-sm">
          <q-avatar size="36px" color="grey-10" text-color="orange-8" class="icon-box">
            <q-icon name="calculate" size="20px" />
          </q-avatar>
          <div class="q-ml-md col">
            <div class="text-subtitle1 text-weight-bold text-orange-8">
              Cálculo de Emenda de Plantio
            </div>
            <div class="text-caption text-grey-5">Calculadora para emenda e ajustes de plantio</div>
          </div>
          <q-icon name="chevron_right" color="grey-6" size="24px" />
        </q-card-section>
      </q-card>
      <q-card
        v-if="temAcesso('os_pos_venda')"
        clickable
        class="compact-card bg-grey-9 text-white"
        @click="router.push('/inicio/pos-venda/nova-os')"
      >
        <q-card-section class="row items-center no-wrap q-pa-sm">
          <q-avatar size="36px" color="grey-10" text-color="orange-8" class="icon-box">
            <q-icon name="assignment" size="20px" />
          </q-avatar>
          <div class="q-ml-md col">
            <div class="text-subtitle1 text-weight-bold text-orange-8">Criar Ordem de Serviço</div>
            <div class="text-caption text-grey-5">Gerar O.S. e notificar técnico</div>
          </div>
          <q-icon name="chevron_right" color="grey-6" size="24px" />
        </q-card-section>
      </q-card>

      <q-card
        v-if="temAcesso('starpes')"
        clickable
        class="compact-card bg-grey-9 text-white"
        @click="router.push('/inicio/pos-venda/starpes-dashboard')"
      >
        <q-card-section class="row items-center no-wrap q-pa-sm">
          <q-avatar size="36px" color="grey-10" text-color="orange-8" class="icon-box">
            <q-icon name="checklist_rtl" size="20px" />
          </q-avatar>
          <div class="q-ml-md col">
            <div class="text-subtitle1 text-weight-bold text-orange-8">Checklist Starpes</div>
            <div class="text-caption text-grey-5">Relatórios e checklists realizados</div>
          </div>
          <q-icon name="chevron_right" color="grey-6" size="24px" />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import localforage from 'localforage'

const router = useRouter()
const perfisUsuario = ref([])

const permissoes = {
  tecnico: ['starpes', 'calculo_plantio'],
  adm_pos_venda: ['pos_venda', 'maquinas', 'logistica', 'starpes', 'os_pos_venda'],
  vendedor: ['comercial', 'consorcio', 'usados'],
  gerente_comercial: ['admin', 'comercial'],
  gerente_pos_venda: ['admin', 'pos_venda', 'starpes', 'os_pos_venda'],
}

const temAcesso = (modulo) => {
  if (perfisUsuario.value.includes('master')) return true
  const todosAcessos = perfisUsuario.value.flatMap((p) => permissoes[p] || [])
  return todosAcessos.includes(modulo)
}

onMounted(async () => {
  // Tenta do cache
  const sessao = await localforage.getItem('user_session')
  if (sessao && sessao.perfis && sessao.perfis.length > 0) {
    perfisUsuario.value = sessao.perfis
  } else {
    // Fallback: busca do Firebase
    const { getAuth } = await import('firebase/auth')
    const { doc, getDoc } = await import('firebase/firestore')
    const { db } = await import('src/boot/firebase')
    const user = getAuth().currentUser
    if (user) {
      const docSnap = await getDoc(doc(db, 'usuarios', user.uid))
      if (docSnap.exists()) {
        perfisUsuario.value = docSnap.data().perfis || []
      }
    }
  }
})
</script>

<style scoped>
.compact-card {
  border: 1px solid #333;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.compact-card:hover {
  border-color: #ff9800;
}

.icon-box {
  border: 1px solid #ff9800;
}
</style>
