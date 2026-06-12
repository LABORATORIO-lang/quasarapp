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

    <div class="row q-col-gutter-md q-mb-xl">
      <!-- Setor Comercial - só gerente_comercial e master -->
      <div v-if="temAcesso('admin_comercial')" class="col-12 col-sm-4">
        <q-card class="bg-grey-9 text-white custom-card" clickable @click="irPara('comercial')">
          <q-card-section class="q-pa-sm">
            <div class="row items-center no-wrap q-col-gutter-sm">
              <div class="col-auto">
                <q-avatar size="36px" color="grey-10" text-color="orange-8" class="icon-box">
                  <q-icon name="storefront" />
                </q-avatar>
              </div>
              <div class="col">
                <div class="text-subtitle1 text-weight-bold">Setor Comercial</div>
                <div class="text-caption text-grey-5 card-description">Checklist Comercial.</div>
              </div>
              <div class="col-auto">
                <q-icon name="arrow_forward" color="orange-8" size="20px" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Pós-Venda - só gerente_pos_venda e master -->
      <div v-if="temAcesso('admin_pos_venda')" class="col-12 col-sm-4">
        <q-card class="bg-grey-9 text-white custom-card" clickable @click="irPara('pos_venda')">
          <q-card-section class="q-pa-sm">
            <div class="row items-center no-wrap q-col-gutter-sm">
              <div class="col-auto">
                <q-avatar size="36px" color="grey-10" text-color="blue-5" class="icon-box-blue">
                  <q-icon name="build" />
                </q-avatar>
              </div>
              <div class="col">
                <div class="text-subtitle1 text-weight-bold">Pós-Venda</div>
                <div class="text-caption text-grey-5 card-description">Checklist Pós-Venda.</div>
              </div>
              <div class="col-auto">
                <q-icon name="arrow_forward" color="orange-8" size="20px" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Starpes - só gerente_pos_venda e master -->
      <div v-if="temAcesso('admin_starpes')" class="col-12 col-sm-4">
        <q-card class="bg-grey-9 text-white custom-card" clickable @click="irPara('starpes')">
          <q-card-section class="q-pa-sm">
            <div class="row items-center no-wrap q-col-gutter-sm">
              <div class="col-auto">
                <q-avatar size="36px" color="grey-10" text-color="green-5" class="icon-box-green">
                  <q-icon name="assignment_turned_in" />
                </q-avatar>
              </div>
              <div class="col">
                <div class="text-subtitle1 text-weight-bold">Starpes</div>
                <div class="text-caption text-grey-5 card-description">
                  Checklist Starpes - Inspeções de máquinas.
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

    <div class="text-subtitle1 text-weight-bold text-orange-8 q-mb-md row items-center q-gutter-sm">
      <q-icon name="security" />
      <span>Segurança e Sistema</span>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-4">
        <q-card class="bg-grey-9 text-white custom-card" clickable @click="irParaAcessos">
          <q-card-section class="q-pa-sm">
            <div class="row items-center no-wrap q-col-gutter-sm">
              <div class="col-auto">
                <q-avatar size="36px" color="grey-10" text-color="red-5" class="icon-box-red">
                  <q-icon name="people" />
                </q-avatar>
              </div>
              <div class="col">
                <div class="row items-center q-gutter-sm">
                  <div class="text-subtitle1 text-weight-bold">Painel de Acesso</div>
                  <q-badge color="red-5" label="Restrito" />
                </div>
                <div class="text-caption text-grey-5 card-description">
                  Controle de permissões e acessos.
                </div>
              </div>
              <div class="col-auto">
                <q-icon name="lock_open" color="red-5" size="20px" />
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

const permissoes = {
  gerente_comercial: ['admin_comercial'],
  gerente_pos_venda: ['admin_pos_venda', 'admin_starpes'],
}

const temAcesso = (modulo) => {
  if (perfisUsuario.value.includes('master')) return true
  const todosAcessos = perfisUsuario.value.flatMap((p) => permissoes[p] || [])
  return todosAcessos.includes(modulo)
}

const irParaAcessos = () => {
  router.push('/admin/acessos')
}

function irPara(setor) {
  router.push(`/admin/${setor}`)
}

onMounted(async () => {
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
      if (user.uid === '6qiehRW7f0YfA2kZAWcpXR3NFWc2') {
        perfisUsuario.value = ['master']
      } else {
        const docSnap = await getDoc(doc(db, 'usuarios', user.uid))
        if (docSnap.exists()) {
          perfisUsuario.value = docSnap.data().perfis || []
        }
      }
    }
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
.icon-box-blue {
  border: 1px solid #2196f3;
}
.icon-box-green {
  border: 1px solid #4caf50;
}
.icon-box-red {
  border: 1px solid #f44336;
}

.card-description {
  line-height: 1.35;
}
</style>
