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

      {
        path: 'comercial/checklist/rascunhos',
        component: () => import('pages/telas/comercial/checklist/ChecklistRascunhos.vue'),
      },
      {
        path: 'comercial/checklist',
        component: () => import('pages/telas/comercial/checklist/ChecklistMenu.vue'),
      },
      {
        path: 'comercial/checklist/formulario',
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
    component: () => import('layouts/MainLayout.vue'), // Se o seu menu está aqui, ok!
    children: [
      { path: 'master', component: () => import('pages/telas/admin/AdminModelos.vue') },
      // A única rota de edição necessária:
      {
        path: 'editar/:colecao/:modelo',
        component: () => import('pages/telas/admin/AdminEditar.vue'),
      },
      { path: 'comercial', component: () => import('pages/telas/admin/AdminComercial.vue') },
      { path: 'logistica', component: () => import('pages/telas/admin/AdminLogistica.vue') },
      { path: 'posvenda', component: () => import('pages/telas/admin/AdminPosVenda.vue') },
    ],
  },
]

export default routes
