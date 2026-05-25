<template>
  <q-page class="bg-grey-10 flex flex-center">
    <div class="q-pa-md full-width" style="max-width: 500px">
      <div class="text-h4 text-white text-weight-bold q-mb-xl text-center">
        Módulo Comercial
        <div class="text-subtitle1 text-orange-8">Gerenciamento de Operações</div>
      </div>

      <div class="column q-gutter-md">
        <q-card
          flat
          bordered
          class="bg-grey-9 text-white cursor-pointer hover-card"
          @click="router.push('/inicio/comercial/checklist')"
        >
          <q-card-section class="row items-center">
            <q-avatar size="50px" color="orange-8" text-color="white" icon="assignment_turned_in" />
            <div class="q-ml-md">
              <div class="text-h6">Checklist</div>
              <div class="text-caption text-grey-5">Vistorias e inspeções técnicas</div>
            </div>
            <q-space />
            <q-icon name="chevron_right" size="sm" color="grey-5" />
          </q-card-section>
        </q-card>

        <q-card
          flat
          bordered
          class="bg-grey-9 text-white cursor-pointer hover-card"
          @click="router.push('/comercial/consorcio')"
        >
          <q-card-section class="row items-center">
            <q-avatar size="50px" color="orange-8" text-color="white" icon="request_quote" />
            <div class="q-ml-md">
              <div class="text-h6">Consórcio</div>
              <div class="text-caption text-grey-5">Simulações e propostas</div>
            </div>
            <q-space />
            <q-icon name="chevron_right" size="sm" color="grey-5" />
          </q-card-section>
        </q-card>

        <q-card
          flat
          bordered
          class="bg-grey-9 text-white cursor-pointer hover-card"
          @click="router.push('/comercial/usados')"
        >
          <q-card-section class="row items-center">
            <q-avatar
              size="50px"
              color="orange-8"
              text-color="white"
              icon="precision_manufacturing"
            />
            <div class="q-ml-md">
              <div class="text-h6">Usados</div>
              <div class="text-caption text-grey-5">Inventário de máquinas</div>
            </div>
            <q-space />
            <q-icon name="chevron_right" size="sm" color="grey-5" />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
.hover-card {
  transition:
    transform 0.3s ease,
    border-color 0.3s ease;
  border-left: 4px solid transparent;
}
.hover-card:hover {
  transform: translateY(-2px);
  border-left-color: #f3772c; /* Cor Stara */
}
</style>
