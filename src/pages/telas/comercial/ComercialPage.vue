<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center justify-between q-mb-xl q-col-gutter-sm">
      <div class="row items-center q-gutter-sm">
        <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
        <div>
          <div class="text-h5 text-weight-bold">Módulo Comercial</div>
          <div class="text-caption text-grey-5">Gerenciamento de Operações e Processos</div>
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-sm-4">
        <q-card class="bg-grey-9 text-white custom-card column justify-between">
          <q-card-section class="q-pa-lg col column justify-center">
            <q-avatar size="48px" color="grey-10" text-color="orange-8" class="q-mb-md icon-box">
              <q-icon name="assignment_turned_in" />
            </q-avatar>
            <div class="text-h5 text-weight-bolder text-orange-8 q-mb-sm">Checklist</div>
            <div class="text-subtitle2 text-grey-5" style="line-height: 1.4">
              Realize vistorias em Máquinas Para negociação.
            </div>
          </q-card-section>

          <q-separator color="grey-8" />

          <q-card-actions align="right" class="bg-grey-10 q-pa-sm">
            <q-btn
              flat
              color="orange-8"
              label="ACESSAR"
              icon-right="arrow_forward"
              @click="router.push('/inicio/comercial/checklist')"
            />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-sm-4">
        <q-card class="bg-grey-9 text-white custom-card column justify-between">
          <q-card-section class="q-pa-lg col column justify-center">
            <q-avatar size="48px" color="grey-10" text-color="orange-8" class="q-mb-md icon-box">
              <q-icon name="request_quote" />
            </q-avatar>
            <div class="text-h5 text-weight-bolder text-orange-8 q-mb-sm">Consórcio</div>
            <div class="text-subtitle2 text-grey-5" style="line-height: 1.4">
              Calculo de Parcelas e Lances.
            </div>
          </q-card-section>

          <q-separator color="grey-8" />

          <q-card-actions align="right" class="bg-grey-10 q-pa-sm">
            <q-btn
              flat
              color="orange-8"
              label="ACESSAR"
              icon-right="arrow_forward"
              @click="router.push('/comercial/consorcio')"
            />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-sm-4">
        <q-card class="bg-grey-9 text-white custom-card column justify-between">
          <q-card-section class="q-pa-lg col column justify-center">
            <q-avatar size="48px" color="grey-10" text-color="orange-8" class="q-mb-md icon-box">
              <q-icon name="precision_manufacturing" />
            </q-avatar>
            <div class="text-h5 text-weight-bolder text-orange-8 q-mb-sm">Usados</div>
            <div class="text-subtitle2 text-grey-5" style="line-height: 1.4">
              catálogo de máquinas seminovas.
            </div>
          </q-card-section>

          <q-separator color="grey-8" />

          <q-card-actions align="right" class="bg-grey-10 q-pa-sm">
            <q-btn
              flat
              color="orange-8"
              label="ACESSAR"
              icon-right="arrow_forward"
              @click="router.push('/comercial/usados')"
            />
          </q-card-actions>
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
.custom-card {
  border: 1px solid #424242;
  border-radius: 12px;
  overflow: hidden;
  transition:
    transform 0.2s,
    border-color 0.2s;
  height: 260px !important;
}

.custom-card:hover {
  transform: translateY(-4px);
  border-color: #ff9800;
}

.icon-box {
  border: 1px solid #ff9800;
}
</style>
