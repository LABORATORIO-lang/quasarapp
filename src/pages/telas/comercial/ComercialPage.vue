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

    <div class="row q-col-gutter-md">
      <!-- Checklist -->
      <div class="col-12 col-sm-4">
        <q-card
          class="bg-grey-9 text-white custom-card"
          clickable
          @click="router.push('/inicio/comercial/checklist')"
        >
          <q-card-section class="q-pa-sm">
            <div class="row items-center no-wrap q-col-gutter-sm">
              <div class="col-auto">
                <q-avatar size="36px" color="grey-10" text-color="orange-8" class="icon-box">
                  <q-icon name="assignment_turned_in" />
                </q-avatar>
              </div>
              <div class="col">
                <div class="text-subtitle1 text-weight-bold text-orange-8">Checklist</div>
                <div class="text-caption text-grey-5 card-description">
                  Realize vistorias em Máquinas Para negociação.
                </div>
              </div>
              <div class="col-auto">
                <q-icon name="arrow_forward" color="orange-8" size="20px" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Consórcio -->
      <div class="col-12 col-sm-4">
        <q-card
          class="bg-grey-9 text-white custom-card"
          clickable
          @click="router.push('/inicio/comercial/consorcio')"
        >
          <q-card-section class="q-pa-sm">
            <div class="row items-center no-wrap q-col-gutter-sm">
              <div class="col-auto">
                <q-avatar size="36px" color="grey-10" text-color="orange-8" class="icon-box">
                  <q-icon name="request_quote" />
                </q-avatar>
              </div>
              <div class="col">
                <div class="text-subtitle1 text-weight-bold text-orange-8">Consórcio</div>
                <div class="text-caption text-grey-5 card-description">
                  Calculo de Parcelas e Lances.
                </div>
              </div>
              <div class="col-auto">
                <q-icon name="arrow_forward" color="orange-8" size="20px" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Usados -->
      <div class="col-12 col-sm-4">
        <q-card
          class="bg-grey-9 text-white custom-card"
          clickable
          @click="router.push('/comercial/usados')"
        >
          <q-card-section class="q-pa-sm">
            <div class="row items-center no-wrap q-col-gutter-sm">
              <div class="col-auto">
                <q-avatar size="36px" color="grey-10" text-color="orange-8" class="icon-box">
                  <q-icon name="precision_manufacturing" />
                </q-avatar>
              </div>
              <div class="col">
                <div class="text-subtitle1 text-weight-bold text-orange-8">Usados</div>
                <div class="text-caption text-grey-5 card-description">
                  Catálogo de máquinas seminovas.
                </div>
              </div>
              <div class="col-auto">
                <q-icon name="arrow_forward" color="orange-8" size="20px" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 🆕 Despachar Usadas — só gerente_comercial e master -->
      <div v-if="temAcesso('gerente_comercial')" class="col-12 col-sm-4">
        <q-card
          class="bg-grey-9 text-white custom-card"
          clickable
          @click="router.push('/inicio/comercial/despacho-usadas')"
        >
          <q-card-section class="q-pa-sm">
            <div class="row items-center no-wrap q-col-gutter-sm">
              <div class="col-auto">
                <q-avatar size="36px" color="grey-10" text-color="orange-8" class="icon-box">
                  <q-icon name="local_shipping" />
                </q-avatar>
              </div>
              <div class="col">
                <div class="text-subtitle1 text-weight-bold text-orange-8">
                  Programação de Coleta
                </div>
                <div class="text-caption text-grey-5 card-description">
                  Crie despachos de máquinas avaliadas para outras unidades.
                </div>
              </div>
              <div class="col-auto">
                <q-icon name="arrow_forward" color="orange-8" size="20px" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Ver Estoque e Trânsito — só gerente_comercial e master -->
      <div v-if="temAcesso('gerente_comercial')" class="col-12 col-sm-4">
        <q-card
          class="bg-grey-9 text-white custom-card"
          clickable
          @click="router.push('/inicio/pos-venda/maquinas/estoque')"
        >
          <q-card-section class="q-pa-sm">
            <div class="row items-center no-wrap q-col-gutter-sm">
              <div class="col-auto">
                <q-avatar size="36px" color="grey-10" text-color="orange-8" class="icon-box">
                  <q-icon name="inventory_2" />
                </q-avatar>
              </div>
              <div class="col">
                <div class="text-subtitle1 text-weight-bold text-orange-8">
                  Ver Estoque e Trânsito
                </div>
                <div class="text-caption text-grey-5 card-description">
                  Visualize todas as máquinas no sistema.
                </div>
              </div>
              <div class="col-auto">
                <q-icon name="arrow_forward" color="orange-8" size="20px" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import localforage from 'localforage'

const router = useRouter()
const perfisUsuario = ref([])

const temAcesso = (perfil) => {
  if (perfisUsuario.value.includes('master')) return true
  return perfisUsuario.value.includes(perfil)
}

onMounted(async () => {
  const sessao = await localforage.getItem('user_session')
  if (sessao && sessao.perfis) {
    perfisUsuario.value = sessao.perfis
  }
})
</script>

<style scoped>
.custom-card {
  border: 1px solid #333;
  border-radius: 8px;
  transition:
    transform 0.2s,
    border-color 0.2s;
  cursor: pointer;
}
.custom-card:hover {
  border-color: #ff9800;
}
.icon-box {
  border: 1px solid #ff9800;
}
.card-description {
  line-height: 1.35;
}
</style>
