const routes = [
  { path: '/', component: () => import('pages/login/LoginPage.vue') },
  { path: '/register', component: () => import('pages/login/RegisterPage.vue') },
  { path: '/forgot-password', component: () => import('pages/login/ForgotPasswordPage.vue') },

  {
    path: '/inicio',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/telas/inicio/InicioPage.vue') },
      { path: 'comercial', component: () => import('pages/telas/comercial/ComercialPage.vue') },
      { path: 'logistica', component: () => import('pages/telas/logistica/LogisticaPage.vue') },

      // Rotas do Checklist (apenas uma vez!)
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
        // 🚀 AQUI ESTÁ O SEGREDO: O parâmetro :tipo
        path: 'comercial/checklist/formulario/:tipo',
        component: () => import('pages/telas/comercial/checklist/ChecklistForm.vue'),
      },
      {
        path: 'comercial/checklist/historico',
        component: () => import('pages/telas/comercial/checklist/ChecklistHistory.vue'),
      },
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
