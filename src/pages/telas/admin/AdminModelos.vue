<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center q-mb-xl q-gutter-sm">
      <q-icon name="admin_panel_settings" size="40px" color="orange-8" />
      <div>
        <div class="text-h5 text-weight-bold">Painel Master de Controle</div>
        <div class="text-caption text-grey-5">
          Gerenciamento de módulos, formulários e permissões da Dinâmica Máquinas
        </div>
      </div>
    </div>

    <div class="text-subtitle1 text-weight-bold text-orange-8 q-mb-md row items-center q-gutter-sm">
      <q-icon name="assignment" />
      <span>Módulos de Checklists</span>
    </div>

    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12 col-sm-4">
        <q-card class="bg-grey-9 text-white custom-card column justify-between">
          <q-card-section class="q-pa-lg col">
            <div class="row justify-between items-center q-mb-md">
              <q-avatar size="48px" color="grey-10" text-color="orange-8" class="icon-box">
                <q-icon name="storefront" />
              </q-avatar>
            </div>
            <div class="text-h6 text-weight-bold">Setor Comercial</div>
            <div class="text-caption text-grey-5 q-mt-xs">Ckecklist Comercial.</div>
          </q-card-section>

          <q-separator color="grey-8" />
          <q-card-actions align="right" class="bg-grey-10 q-pa-sm">
            <q-btn
              flat
              color="orange-8"
              label="CONFIGURAR"
              icon-right="arrow_forward"
              @click="irPara('comercial')"
            />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-sm-4">
        <q-card class="bg-grey-9 text-white custom-card column justify-between">
          <q-card-section class="q-pa-lg col">
            <div class="row justify-between items-center q-mb-md">
              <q-avatar size="48px" color="grey-10" text-color="blue-5" class="icon-box-blue">
                <q-icon name="build" />
              </q-avatar>
            </div>
            <div class="text-h6 text-weight-bold">Pós-Venda</div>
            <div class="text-caption text-grey-5 q-mt-xs">Checklist Pós-Venda.</div>
          </q-card-section>

          <q-separator color="grey-8" />
          <q-card-actions align="right" class="bg-grey-10 q-pa-sm">
            <q-btn
              flat
              color="orange-8"
              label="CONFIGURAR"
              icon-right="arrow_forward"
              @click="irPara('pos_venda')"
            />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-sm-4">
        <q-card class="bg-grey-9 text-white custom-card column justify-between">
          <q-card-section class="q-pa-lg col">
            <div class="row justify-between items-center q-mb-md">
              <q-avatar size="48px" color="grey-10" text-color="green-5" class="icon-box-green">
                <q-icon name="local_shipping" />
              </q-avatar>
            </div>
            <div class="text-h6 text-weight-bold">Logística de Transporte</div>
            <div class="text-caption text-grey-5 q-mt-xs">Checklist Transporte.</div>
          </q-card-section>

          <q-separator color="grey-8" />
          <q-card-actions align="right" class="bg-grey-10 q-pa-sm">
            <q-btn
              flat
              color="orange-8"
              label="CONFIGURAR"
              icon-right="arrow_forward"
              @click="irPara('logistica')"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <div class="text-subtitle1 text-weight-bold text-orange-8 q-mb-md row items-center q-gutter-sm">
      <q-icon name="security" />
      <span>Segurança e Sistema</span>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-sm-4">
        <q-card class="bg-grey-9 text-white custom-card column justify-between">
          <q-card-section class="q-pa-lg col">
            <div class="row justify-between items-center q-mb-md">
              <q-avatar size="48px" color="grey-10" text-color="red-5" class="icon-box-red">
                <q-icon name="people" />
              </q-avatar>
              <q-badge color="red-5" label="Restrito" />
            </div>
            <div class="text-h6 text-weight-bold">Painel de Acesso</div>
            <div class="text-caption text-grey-5 q-mt-xs"></div>
          </q-card-section>

          <q-separator color="grey-8" />
          <q-card-actions align="right" class="bg-grey-10 q-pa-sm">
            <q-btn
              flat
              color="red-5"
              label="CONFIGURAR"
              icon-right="lock_open"
              @click="irParaAcessos"
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

function irPara(setor) {
  // Isso vai montar a URL: /admin/pos_venda
  router.push(`/admin/${setor}`)
}
</script>

<style scoped>
.custom-card {
  border: 1px solid #424242;
  border-radius: 12px;
  overflow: hidden;
  transition:
    transform 0.2s,
    border-color 0.2s;

  /* Trava o tamanho idêntico e força o rodapé a ficar embaixo */
  height: 250px !important;
}

.custom-card:hover {
  transform: translateY(-4px);
}

.icon-box {
  border: 1px solid #ff9800;
}
.icon-box-blue {
  border: 1px solid #2196f3;
}
.icon-box-green {
  border: 1px solid #4caf50;
}
.icon-box-red {
  border: 1px solid #f44336;
}
</style>
