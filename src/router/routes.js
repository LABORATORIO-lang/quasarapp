const routes = [
  { path: '/', component: () => import('pages/login/LoginPage.vue') },
  { path: '/register', component: () => import('pages/login/RegisterPage.vue') },
  { path: '/forgot-password', component: () => import('pages/login/ForgotPasswordPage.vue') },

  {
    // A nossa nova rota genérica e inteligente!
    path: '/historico/:setor',
    component: () => import('pages/HistoricoRegistros.vue'),
  },

  {
    path: '/inicio',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/telas/inicio/InicioPage.vue') },
      { path: 'comercial', component: () => import('pages/telas/comercial/ComercialPage.vue') },
      { path: 'logistica', component: () => import('pages/telas/logistica/LogisticaPage.vue') },

      // Rotas do Checklist
      {
        path: 'comercial/checklist/selecionar',
        component: () => import('pages/telas/comercial/checklist/ChecklistSelecao.vue'),
      },
      {
        path: 'comercial/checklist/rascunhos',
        component: () => import('pages/telas/comercial/checklist/ChecklistRascunhos.vue'),
      },
      {
        path: 'comercial/checklist',
        component: () => import('pages/telas/comercial/checklist/ChecklistMenu.vue'),
      },
      {
        path: 'comercial/checklist/formulario/:tipo',
        component: () => import('pages/telas/comercial/checklist/ChecklistForm.vue'),
      },
      // O bloco do ChecklistHistory.vue que estava a causar o erro foi removido daqui!
    ],
  },

  { path: '/:catchAll(.*)*', component: () => import('pages/ErrorNotFound.vue') },

  {
    path: '/admin',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: 'master', component: () => import('pages/telas/admin/AdminModelos.vue') },
      {
        path: 'editar/:colecao/:modelo',
        component: () => import('pages/telas/admin/AdminEditar.vue'),
      },
      { path: 'comercial', component: () => import('pages/telas/admin/AdminComercial.vue') },
      { path: 'pos_venda', component: () => import('pages/telas/admin/AdminPosVenda.vue') },
      { path: 'logistica', component: () => import('pages/telas/admin/AdminLogistica.vue') },
    ],
  },
]

export default routes
