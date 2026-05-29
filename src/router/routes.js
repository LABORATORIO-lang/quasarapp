const routes = [
  // --- ROTAS DE AUTENTICAÇÃO (Sem Layout: Tela cheia de Login) ---
  { path: '/', component: () => import('pages/login/LoginPage.vue') },
  { path: '/register', component: () => import('pages/login/RegisterPage.vue') },
  { path: '/forgot-password', component: () => import('pages/login/ForgotPasswordPage.vue') },

  // --- ROTAS DO APP (Com Layout: Mantém menu, topo e navegação) ---
  {
    path: '/inicio',
    component: () => import('layouts/MainLayout.vue'), // Define o layout padrão
    children: [
      // Página Inicial
      { path: '', component: () => import('pages/telas/inicio/InicioPage.vue') },

      // Páginas dos Setores
      { path: 'comercial', component: () => import('pages/telas/comercial/ComercialPage.vue') },
      { path: 'logistica', component: () => import('pages/telas/logistica/LogisticaPage.vue') },

      // Rota inteligente para o Histórico (Agora dentro do MainLayout)
      // O :setor é uma variável. Se o usuário abrir /historico/comercial, 'setor' será 'comercial'
      // Dentro do seu arquivo routes.js, em children do /inicio:
      { path: 'historico/:setor', component: () => import('pages/HistoricoRegistros.vue') },
      // --- Rotas do Checklist (Setor Comercial) ---
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
        // :tipo é dinâmico, serve para diferenciar se é um formulário novo ou edição
        path: 'comercial/checklist/formulario/:tipo',
        component: () => import('pages/telas/comercial/checklist/ChecklistForm.vue'),
      },
    ],
  },

  // --- ROTAS ADMINISTRATIVAS (Com Layout: Protegido por hierarquia) ---
  {
    path: '/admin',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: 'master', component: () => import('pages/telas/admin/AdminModelos.vue') },
      {
        // Rota dinâmica: espera uma coleção e um modelo específico para editar
        path: 'editar/:colecao/:modelo',
        component: () => import('pages/telas/admin/AdminEditar.vue'),
      },
      { path: 'comercial', component: () => import('pages/telas/admin/AdminComercial.vue') },
      { path: 'pos_venda', component: () => import('pages/telas/admin/AdminPosVenda.vue') },
      { path: 'logistica', component: () => import('pages/telas/admin/AdminLogistica.vue') },
    ],
  },

  // --- ROTA DE ERRO (Catch-all) ---
  // Sempre deve ser a última. Se o usuário digitar algo que não existe, cai aqui.
  { path: '/:catchAll(.*)*', component: () => import('pages/ErrorNotFound.vue') },
]

export default routes
