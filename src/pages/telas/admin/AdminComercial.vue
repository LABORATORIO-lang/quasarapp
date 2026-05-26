<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center q-mb-xl q-gutter-sm">
      <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
      <div>
        <div class="text-h5 text-weight-bold">Checklists Comerciais</div>
        <div class="text-caption text-grey-5">
          Selecione o modelo de máquina para gerenciar as perguntas
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-sm-4">
        <q-card class="bg-grey-9 text-white custom-card column justify-between">
          <q-card-section class="q-pa-lg col">
            <div class="row justify-between items-center q-mb-md">
              <q-avatar size="48px" color="grey-10" text-color="orange-8" class="icon-box">
                <q-icon name="grid_view" />
              </q-avatar>
            </div>
            <div class="text-h6 text-weight-bold">Distribuidor</div>
            <div class="text-caption text-grey-5 q-mt-xs">
              Itens de verificação para distribuidores.
            </div>
          </q-card-section>

          <q-separator color="grey-8" />
          <q-card-actions align="right" class="bg-grey-10 q-pa-sm">
            <q-btn
              flat
              color="orange-8"
              label="EDITAR ITENS"
              icon-right="edit"
              @click="editarModelo('distribuidor')"
            />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-sm-4">
        <q-card class="bg-grey-9 text-white custom-card column justify-between">
          <q-card-section class="q-pa-lg col">
            <div class="row justify-between items-center q-mb-md">
              <q-avatar size="48px" color="grey-10" text-color="orange-8" class="icon-box">
                <q-icon name="opacity" />
              </q-avatar>
            </div>
            <div class="text-h6 text-weight-bold">Pulverizador</div>
            <div class="text-caption text-grey-5 q-mt-xs">
              Itens de verificação para pulverizadores.
            </div>
          </q-card-section>

          <q-separator color="grey-8" />
          <q-card-actions align="right" class="bg-grey-10 q-pa-sm">
            <q-btn
              flat
              color="orange-8"
              label="EDITAR ITENS"
              icon-right="edit"
              @click="editarModelo('pulverizador')"
            />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-sm-4">
        <q-card class="bg-grey-9 text-white custom-card column justify-between">
          <q-card-section class="q-pa-lg col">
            <div class="row justify-between items-center q-mb-md">
              <q-avatar size="48px" color="grey-10" text-color="orange-8" class="icon-box">
                <q-icon name="agriculture" />
              </q-avatar>
            </div>
            <div class="text-h6 text-weight-bold">Plantadeira</div>
            <div class="text-caption text-grey-5 q-mt-xs">
              Itens de verificação para plantadeiras.
            </div>
          </q-card-section>

          <q-separator color="grey-8" />
          <q-card-actions align="right" class="bg-grey-10 q-pa-sm">
            <q-btn
              flat
              color="orange-8"
              label="EDITAR ITENS"
              icon-right="edit"
              @click="editarModelo('plantadeira')"
            />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-sm-4">
        <q-card class="bg-grey-9 text-white custom-card column justify-between">
          <q-card-section class="q-pa-lg col">
            <div class="row justify-between items-center q-mb-md">
              <q-avatar size="48px" color="grey-10" text-color="orange-8" class="icon-box">
                <q-icon name="view_headline" />
              </q-avatar>
            </div>
            <div class="text-h6 text-weight-bold">Plataforma</div>
            <div class="text-caption text-grey-5 q-mt-xs">
              Itens de verificação para plataformas de corte/milho.
            </div>
          </q-card-section>

          <q-separator color="grey-8" />
          <q-card-actions align="right" class="bg-grey-10 q-pa-sm">
            <q-btn
              flat
              color="orange-8"
              label="EDITAR ITENS"
              icon-right="edit"
              @click="editarModelo('plataforma')"
            />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-sm-4">
        <q-card class="bg-grey-9 text-white custom-card column justify-between">
          <q-card-section class="q-pa-lg col">
            <div class="row justify-between items-center q-mb-md">
              <q-avatar size="48px" color="grey-10" text-color="orange-8" class="icon-box">
                <q-icon name="rv_hookup" />
              </q-avatar>
            </div>
            <div class="text-h6 text-weight-bold">Carreta Graneleira</div>
            <div class="text-caption text-grey-5 q-mt-xs">
              Itens de verificação para carretas graneleiras.
            </div>
          </q-card-section>

          <q-separator color="grey-8" />
          <q-card-actions align="right" class="bg-grey-10 q-pa-sm">
            <q-btn
              flat
              color="orange-8"
              label="EDITAR ITENS"
              icon-right="edit"
              @click="editarModelo('carreta_graneleira')"
            />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-sm-4">
        <q-card class="bg-grey-9 text-white custom-card column justify-between">
          <q-card-section class="q-pa-lg col">
            <div class="row justify-between items-center q-mb-md">
              <q-avatar size="48px" color="grey-10" text-color="orange-8" class="icon-box">
                <q-icon name="precision_manufacturing" />
              </q-avatar>
            </div>
            <div class="text-h6 text-weight-bold">Trator</div>
            <div class="text-caption text-grey-5 q-mt-xs">
              Itens de verificação geral para tratores.
            </div>
          </q-card-section>

          <q-separator color="grey-8" />
          <q-card-actions align="right" class="bg-grey-10 q-pa-sm">
            <q-btn
              flat
              color="orange-8"
              label="EDITAR ITENS"
              icon-right="edit"
              @click="editarModelo('trator')"
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

function editarModelo(modelo) {
  // Envia: Coleção = 'checklistlogistica' | Modelo = 'transporte'
  router.push(`/admin/editar/checklistlogistica/${modelo}`)
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
  height: 280px !important; /* Mantém a proporção exata e simétrica em todos os 6 cards */
}

.custom-card:hover {
  transform: translateY(-4px);
  border-color: #ff9800;
}

.icon-box {
  border: 1px solid #ff9800;
}
</style>
