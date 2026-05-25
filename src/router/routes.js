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
]

export default routes
