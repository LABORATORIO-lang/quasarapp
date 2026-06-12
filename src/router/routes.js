const routes = [
  // --- ROTAS DE AUTENTICAÇÃO (Sem Layout: Tela cheia de Login) ---
  { path: '/', component: () => import('pages/login/LoginPage.vue') },
  { path: '/register', component: () => import('pages/login/RegisterPage.vue') },
  { path: '/forgot-password', component: () => import('pages/login/ForgotPasswordPage.vue') },

  // --- ROTAS DO APP (Com Layout: Mantém menu, topo e navegação) ---
  {
    path: '/inicio',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/telas/inicio/InicioPage.vue') },

      // Páginas dos Setores
      { path: 'comercial', component: () => import('pages/telas/comercial/ComercialPage.vue') },
      {
        path: 'comercial/consorcio',
        component: () => import('pages/telas/comercial/consorcio/ConsorcioCalcu.vue'),
      },
      { path: 'logistica', component: () => import('pages/telas/logistica/LogisticaPage.vue') },
      {
        path: 'logistica/entregas',
        component: () => import('pages/telas/logistica/EntregarCliente.vue'),
      },

      // Pós-Venda
      { path: 'pos-venda', component: () => import('pages/telas/pos_venda/PosVendaMenu.vue') },
      {
        path: '/verificacao/:token',
        component: () => import('pages/publico/VerificacaoCliente.vue'),
      },
      // --- Controle de Máquinas ---
      {
        path: 'pos-venda/maquinas',
        component: () => import('pages/telas/pos_venda/checklistnovas/ControleMaquinas.vue'),
      },
      {
        path: 'pos-venda/maquinas/receber',
        component: () => import('pages/telas/pos_venda/checklistnovas/ReceberMaquina.vue'),
      },
      {
        path: 'pos-venda/maquinas/transferir',
        component: () => import('pages/telas/pos_venda/checklistnovas/TransferirMaquina.vue'),
      },
      {
        path: 'pos-venda/maquinas/estoque',
        component: () => import('pages/telas/pos_venda/checklistnovas/EstoqueTransito.vue'),
      },
      {
        path: 'pos-venda/maquinas/historico',
        component: () => import('pages/telas/pos_venda/checklistnovas/HistoricoSerie.vue'),
      },
      {
        path: 'pos-venda/maquinas/receber-transferencia',
        component: () => import('pages/telas/pos_venda/checklistnovas/ReceberTransferencia.vue'),
      },
      // --- Rotas do Checklist Starpes (Pós-Venda) ---
      {
        path: 'pos-venda/starpes',
        component: () => import('pages/telas/pos_venda/checkliststarpes/StarpesMenu.vue'),
      },
      {
        path: 'pos-venda/starpes/formulario/:categoria',
        component: () => import('pages/telas/pos_venda/checkliststarpes/StarpesForm.vue'),
      },

      // --- Rotas do Checklist (Pós-Venda) ---
      {
        path: 'pos-venda/maquinas/transferir-selecionar',
        component: () =>
          import('pages/telas/pos_venda/checklistnovas/SelecionarMaquinaTransferir.vue'),
      },

      {
        path: 'pos-venda/maquinas/editar-checklist',
        component: () => import('pages/telas/pos_venda/checklistnovas/EditarChecklistMaquina.vue'),
      },
      {
        path: 'pos-venda/checklist/selecionar',
        component: () => import('pages/telas/pos_venda/checklistnovas/ChecklistSelecao.vue'),
      },
      {
        path: 'pos-venda/checklist/rascunhos',
        component: () => import('pages/telas/pos_venda/checklistnovas/ChecklistRascunhos.vue'),
      },
      {
        path: 'pos-venda/checklist/formulario/:tipo',
        component: () => import('pages/telas/pos_venda/checklistnovas/ChecklistPosForm.vue'),
      },
      {
        path: 'pos-venda/maquinas/notificacoes',
        component: () =>
          import('src/pages/telas/pos_venda/checklistnovas/NotificacoesMaquinas.vue'),
      },

      // Histórico
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
        path: ':setor/checklist/formulario/:tipo',
        component: () => import('pages/telas/comercial/checklist/ChecklistForm.vue'),
      },
    ],
  },

  // --- ROTAS ADMINISTRATIVAS ---
  {
    path: '/admin',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: 'master', component: () => import('pages/telas/admin/AdminModelos.vue') },
      {
        path: 'editar/:colecao/:modelo',
        component: () => import('pages/telas/admin/AdminEditar.vue'),
      },
      { path: 'acessos', component: () => import('pages/telas/admin/PainelAcesso.vue') },
      { path: 'comercial', component: () => import('pages/telas/admin/AdminComercial.vue') },
      { path: 'pos_venda', component: () => import('pages/telas/admin/AdminPosVenda.vue') },
      { path: 'starpes', component: () => import('pages/telas/admin/AdminStarpes.vue') },
    ],
  },

  // --- ROTA DE ERRO (Catch-all) ---
  { path: '/:catchAll(.*)*', component: () => import('pages/ErrorNotFound.vue') },
]

export default routes
