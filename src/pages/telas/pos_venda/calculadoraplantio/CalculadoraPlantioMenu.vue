<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center q-mb-xl q-gutter-sm">
      <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
      <div>
        <div class="text-h5 text-weight-bold">Calculadoras de Plantio</div>
        <div class="text-caption text-grey-5">Ferramentas de campo para calibração</div>
      </div>
    </div>

    <div class="column q-gutter-sm">
      <q-card
        clickable
        class="compact-card bg-grey-9 text-white"
        @click="router.push('/inicio/pos-venda/calculo-plantio/emenda')"
      >
        <q-card-section class="row items-center no-wrap q-pa-sm">
          <q-avatar size="36px" color="grey-10" text-color="orange-8" class="icon-box">
            <q-icon name="straighten" size="20px" />
          </q-avatar>
          <div class="q-ml-md col">
            <div class="text-subtitle1 text-weight-bold text-orange-8">
              Calibrar Emenda de Plantio
            </div>
            <div class="text-caption text-grey-5">Calcule nova largura e deslocamento do GPS</div>
          </div>
          <q-icon name="chevron_right" color="grey-6" size="24px" />
        </q-card-section>
      </q-card>

      <q-card
        clickable
        class="compact-card bg-grey-9 text-white"
        @click="router.push('/inicio/pos-venda/calculo-plantio/desligamento')"
      >
        <q-card-section class="row items-center no-wrap q-pa-sm">
          <q-avatar size="36px" color="grey-10" text-color="orange-8" class="icon-box">
            <q-icon name="settings_input_component" size="20px" />
          </q-avatar>
          <div class="q-ml-md col">
            <div class="text-subtitle1 text-weight-bold text-orange-8">
              Desligamento Linha a Linha
            </div>
            <div class="text-caption text-grey-5">Ajuste Antena-Engate para seções automáticas</div>
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
