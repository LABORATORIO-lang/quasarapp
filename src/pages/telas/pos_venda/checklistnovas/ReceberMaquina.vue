<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center justify-between q-mb-xl q-col-gutter-sm">
      <div class="row items-center q-gutter-sm">
        <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
        <div>
          <div class="text-h5 text-weight-bold">Receber Máquina</div>
          <div class="text-caption text-grey-5">Selecione a origem da máquina</div>
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <!-- Nova da Fábrica -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-card
          clickable
          class="compact-card bg-grey-9 text-white"
          @click="router.push('/inicio/pos-venda/checklist/selecionar')"
        >
          <q-card-section class="q-pa-md text-center">
            <q-icon name="precision_manufacturing" size="48px" color="orange-8" class="q-mb-sm" />
            <div class="text-h6 text-weight-bold text-orange-8">Nova da Fábrica</div>
            <div class="text-caption text-grey-5">Máquina 0km — Escolha o modelo</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Transferência Outra Unidade -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-card
          clickable
          class="compact-card bg-grey-9 text-white"
          @click="router.push('/inicio/pos-venda/maquinas/receber-transferencia')"
        >
          <q-card-section class="q-pa-md text-center">
            <q-icon name="local_shipping" size="48px" color="orange-8" class="q-mb-sm" />
            <div class="text-h6 text-weight-bold text-orange-8">Transferência</div>
            <div class="text-caption text-grey-5">Máquina vindo de outra unidade</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 🆕 Usada / Negociação -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-card
          clickable
          class="compact-card bg-grey-9 text-white"
          style="border-color: #ff9800"
          @click="router.push('/inicio/pos-venda/maquinas/receber-usada')"
        >
          <q-card-section class="q-pa-md text-center">
            <q-icon name="swap_horiz" size="48px" color="orange-8" class="q-mb-sm" />
            <div class="text-h6 text-weight-bold text-orange-8">Usada / Negociação</div>
            <div class="text-caption text-grey-5">Máquina usada</div>
          </q-card-section>
        </q-card>
        <q-card-section class="q-pa-md text-center">
          <q-icon name="swap_horiz" size="48px" color="orange-8" class="q-mb-sm" />
          <div class="text-h6 text-weight-bold text-orange-8">Revisão</div>
          <div class="text-caption text-grey-5">Máquina usada para Revisão</div>
        </q-card-section>
      </div>
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
</style>
