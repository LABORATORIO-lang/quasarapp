<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <!-- Cabeçalho -->
    <div class="row items-center justify-between q-mb-xl q-col-gutter-sm">
      <div class="row items-center q-gutter-sm">
        <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
        <div>
          <div class="text-h5 text-weight-bold">Controle de Máquinas</div>
          <div class="text-caption text-grey-5">
            Gerencie recebimentos, transferências e estoque
          </div>
        </div>
      </div>
    </div>

    <!-- Cards de Ação -->
    <div class="column q-gutter-sm">
      <!-- 1. Receber Máquina -->
      <q-card
        clickable
        class="compact-card bg-grey-9 text-white"
        @click="router.push('/inicio/pos-venda/maquinas/receber')"
      >
        <q-card-section class="row items-center no-wrap q-pa-sm">
          <q-avatar size="36px" color="grey-10" text-color="orange-8" class="icon-box">
            <q-icon name="download_done" size="20px" />
          </q-avatar>
          <div class="q-ml-md col">
            <div class="text-subtitle1 text-weight-bold text-orange-8">Receber Máquina</div>
            <div class="text-caption text-grey-5">
              Nova da fábrica ou transferência de outra unidade
            </div>
          </div>
          <q-icon name="chevron_right" color="grey-6" size="24px" />
        </q-card-section>
      </q-card>

      <!-- 2. Transferir Máquina -->
      <q-card
        clickable
        class="compact-card bg-grey-9 text-white"
        @click="router.push('/inicio/pos-venda/maquinas/transferir')"
      >
        <q-card-section class="row items-center no-wrap q-pa-sm">
          <q-avatar size="36px" color="grey-10" text-color="orange-8" class="icon-box">
            <q-icon name="local_shipping" size="20px" />
          </q-avatar>
          <div class="q-ml-md col">
            <div class="text-subtitle1 text-weight-bold text-orange-8">Transferir Máquina</div>
            <div class="text-caption text-grey-5">
              Envie para outra unidade ou entregue ao cliente
            </div>
          </div>
          <q-icon name="chevron_right" color="grey-6" size="24px" />
        </q-card-section>
      </q-card>

      <!-- 3. Ver Estoque e Trânsito -->
      <q-card
        clickable
        class="compact-card bg-grey-9 text-white"
        @click="router.push('/inicio/pos-venda/maquinas/estoque')"
      >
        <q-card-section class="row items-center no-wrap q-pa-sm">
          <q-avatar size="36px" color="grey-10" text-color="orange-8" class="icon-box">
            <q-icon name="inventory_2" size="20px" />
          </q-avatar>
          <div class="q-ml-md col">
            <div class="text-subtitle1 text-weight-bold text-orange-8">Ver Estoque e Trânsito</div>
            <div class="text-caption text-grey-5">Visualize todas as máquinas no sistema</div>
          </div>
          <q-icon name="chevron_right" color="grey-6" size="24px" />
        </q-card-section>
      </q-card>

      <!-- 4. Continuar Rascunhos (NOVO) -->
      <q-card
        clickable
        class="compact-card bg-grey-9 text-white"
        @click="router.push('/inicio/pos-venda/checklist/rascunhos')"
      >
        <q-card-section class="row items-center no-wrap q-pa-sm">
          <q-avatar size="36px" color="grey-10" text-color="orange-8" class="icon-box">
            <q-icon name="pending_actions" size="20px" />
          </q-avatar>
          <div class="q-ml-md col">
            <div class="text-subtitle1 text-weight-bold text-orange-8">Continuar Rascunhos</div>
            <div class="text-caption text-grey-5">Checklists salvos em "Em Andamento"</div>
          </div>
          <q-icon name="chevron_right" color="grey-6" size="24px" />
        </q-card-section>
      </q-card>

      <!-- 5. Histórico por Série -->
      <q-card
        clickable
        class="compact-card bg-grey-9 text-white"
        @click="router.push('/inicio/pos-venda/maquinas/historico')"
      >
        <q-card-section class="row items-center no-wrap q-pa-sm">
          <q-avatar size="36px" color="grey-10" text-color="orange-8" class="icon-box">
            <q-icon name="search" size="20px" />
          </q-avatar>
          <div class="q-ml-md col">
            <div class="text-subtitle1 text-weight-bold text-orange-8">Histórico por Série</div>
            <div class="text-caption text-grey-5">
              Pesquise a vida completa de uma máquina pelo nº de série
            </div>
          </div>
          <q-icon name="chevron_right" color="grey-6" size="24px" />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
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
.icon-box {
  border: 1px solid #ff9800;
}
</style>
