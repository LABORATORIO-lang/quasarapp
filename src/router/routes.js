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
      {
        path: 'comercial',
        component: () => import('pages/telas/comercial/ComercialPage.vue'),
        meta: { perfis: ['comercial', 'vendedor', 'gerente_comercial', 'master', 'admin'] },
      },
      {
        path: 'comercial/consorcio',
        component: () => import('pages/telas/comercial/consorcio/ConsorcioCalcu.vue'),
        meta: { perfis: ['comercial', 'vendedor', 'gerente_comercial', 'master', 'admin'] },
      },
      {
        path: 'logistica',
        component: () => import('pages/telas/logistica/LogisticaPage.vue'),
        meta: { perfis: ['logistica', 'motorista', 'master', 'admin'] },
      },
      {
        path: 'logistica/entregas',
        component: () => import('pages/telas/logistica/EntregarCliente.vue'),
        meta: { perfis: ['logistica', 'motorista', 'master', 'admin'] },
      },
      {
        path: 'logistica/confirmar-entrega',
        component: () => import('pages/telas/logistica/ConfirmarEntregaCliente.vue'),
        meta: { perfis: ['logistica', 'motorista', 'master', 'admin'] },
      },

      // Pós-Venda
      {
        path: 'pos-venda',
        component: () => import('pages/telas/pos_venda/PosVendaMenu.vue'),
        meta: { perfis: ['pos_venda', 'adm_pos_venda', 'gerente_pos_venda', 'master', 'admin'] },
      },

      // Verificação pública (sem meta = aberto)
      {
        path: '/verificacao/:token',
        component: () => import('pages/publico/VerificacaoCliente.vue'),
      },

      // --- Controle de Máquinas ---
      {
        path: 'pos-venda/maquinas',
        component: () => import('pages/telas/pos_venda/checklistnovas/ControleMaquinas.vue'),
        meta: { perfis: ['pos_venda', 'adm_pos_venda', 'gerente_pos_venda', 'master', 'admin'] },
      },
      {
        path: 'pos-venda/maquinas/receber',
        component: () => import('pages/telas/pos_venda/checklistnovas/ReceberMaquina.vue'),
        meta: { perfis: ['pos_venda', 'adm_pos_venda', 'gerente_pos_venda', 'master', 'admin'] },
      },
      {
        path: 'pos-venda/maquinas/transferir',
        component: () => import('pages/telas/pos_venda/checklistnovas/TransferirMaquina.vue'),
        meta: { perfis: ['pos_venda', 'adm_pos_venda', 'gerente_pos_venda', 'master', 'admin'] },
      },
      {
        path: 'pos-venda/maquinas/estoque',
        component: () => import('pages/telas/pos_venda/checklistnovas/EstoqueTransito.vue'),
        meta: { perfis: ['pos_venda', 'adm_pos_venda', 'gerente_pos_venda', 'master', 'admin'] },
      },
      {
        path: 'pos-venda/maquinas/historico',
        component: () => import('pages/telas/pos_venda/checklistnovas/HistoricoSerie.vue'),
        meta: { perfis: ['pos_venda', 'adm_pos_venda', 'gerente_pos_venda', 'master', 'admin'] },
      },
      {
        path: 'pos-venda/maquinas/receber-transferencia',
        component: () => import('pages/telas/pos_venda/checklistnovas/ReceberTransferencia.vue'),
        meta: { perfis: ['pos_venda', 'adm_pos_venda', 'gerente_pos_venda', 'master', 'admin'] },
      },

      // --- Rotas do Checklist Starpes (Pós-Venda) ---
      {
        path: 'pos-venda/starpes',
        component: () => import('pages/telas/pos_venda/checkliststarpes/StarpesMenu.vue'),
        meta: { perfis: ['pos_venda', 'adm_pos_venda', 'gerente_pos_venda', 'master', 'admin'] },
      },
      {
        path: 'pos-venda/starpes/formulario/:categoria',
        component: () => import('pages/telas/pos_venda/checkliststarpes/StarpesForm.vue'),
        meta: { perfis: ['pos_venda', 'adm_pos_venda', 'gerente_pos_venda', 'master', 'admin'] },
      },

      // --- Rotas do Checklist (Pós-Venda) ---
      {
        path: 'pos-venda/maquinas/transferir-selecionar',
        component: () =>
          import('pages/telas/pos_venda/checklistnovas/SelecionarMaquinaTransferir.vue'),
        meta: { perfis: ['pos_venda', 'adm_pos_venda', 'gerente_pos_venda', 'master', 'admin'] },
      },
      {
        path: 'pos-venda/maquinas/editar-checklist',
        component: () => import('pages/telas/pos_venda/checklistnovas/EditarChecklistMaquina.vue'),
        meta: { perfis: ['pos_venda', 'adm_pos_venda', 'gerente_pos_venda', 'master', 'admin'] },
      },
      {
        path: 'pos-venda/checklist/selecionar',
        component: () => import('pages/telas/pos_venda/checklistnovas/ChecklistSelecao.vue'),
        meta: { perfis: ['pos_venda', 'adm_pos_venda', 'gerente_pos_venda', 'master', 'admin'] },
      },
      {
        path: 'pos-venda/checklist/rascunhos',
        component: () => import('pages/telas/pos_venda/checklistnovas/ChecklistRascunhos.vue'),
        meta: { perfis: ['pos_venda', 'adm_pos_venda', 'gerente_pos_venda', 'master', 'admin'] },
      },
      {
        path: 'pos-venda/checklist/formulario/:tipo',
        component: () => import('pages/telas/pos_venda/checklistnovas/ChecklistPosForm.vue'),
        meta: { perfis: ['pos_venda', 'adm_pos_venda', 'gerente_pos_venda', 'master', 'admin'] },
      },
      {
        path: 'pos-venda/maquinas/notificacoes',
        component: () =>
          import('src/pages/telas/pos_venda/checklistnovas/NotificacoesMaquinas.vue'),
        meta: { perfis: ['pos_venda', 'adm_pos_venda', 'gerente_pos_venda', 'master', 'admin'] },
      },

      // --- Calculadoras de Plantio ---
      {
        path: 'pos-venda/calculo-plantio',
        component: () =>
          import('pages/telas/pos_venda/calculadoraplantio/CalculadoraPlantioMenu.vue'),
        meta: {
          perfis: ['pos_venda', 'adm_pos_venda', 'gerente_pos_venda', 'tecnico', 'master', 'admin'],
        },
      },
      {
        path: 'pos-venda/calculo-plantio/emenda',
        component: () =>
          import('pages/telas/pos_venda/calculadoraplantio/CalibrarEmendaPlantio.vue'),
        meta: {
          perfis: ['pos_venda', 'adm_pos_venda', 'gerente_pos_venda', 'tecnico', 'master', 'admin'],
        },
      },
      {
        path: 'pos-venda/maquinas/receber-usada',
        component: () => import('pages/telas/pos_venda/checklistnovas/ReceberUsada.vue'),
        meta: { perfis: ['pos_venda', 'adm_pos_venda', 'gerente_pos_venda', 'master', 'admin'] },
      },
      {
        path: 'pos-venda/calculo-plantio/desligamento',
        component: () =>
          import('pages/telas/pos_venda/calculadoraplantio/DesligamentoLinhaALinha.vue'),
        meta: {
          perfis: ['pos_venda', 'adm_pos_venda', 'gerente_pos_venda', 'tecnico', 'master', 'admin'],
        },
      },

      // Histórico
      {
        path: 'historico/:setor',
        component: () => import('pages/HistoricoRegistros.vue'),
        meta: { perfis: ['master', 'admin'] },
      },

      // --- Rotas do Checklist (Setor Comercial) ---
      {
        path: 'comercial/despacho-usadas',
        component: () => import('pages/telas/comercial/checklist/DespachoGerente.vue'),
        meta: { perfis: ['comercial', 'gerente_comercial', 'master', 'admin'] },
      },
      {
        path: 'logistica/carregar-usada',
        component: () => import('pages/telas/logistica/CarregarUsada.vue'),
        meta: { perfis: ['logistica', 'motorista', 'master', 'admin'] },
      },
      {
        path: 'comercial/checklist/selecionar',
        component: () => import('pages/telas/comercial/checklist/ChecklistSelecao.vue'),
        meta: { perfis: ['comercial', 'vendedor', 'gerente_comercial', 'master', 'admin'] },
      },
      {
        path: 'comercial/checklist/rascunhos',
        component: () => import('pages/telas/comercial/checklist/ChecklistRascunhos.vue'),
        meta: { perfis: ['comercial', 'vendedor', 'gerente_comercial', 'master', 'admin'] },
      },
      {
        path: 'comercial/checklist',
        component: () => import('pages/telas/comercial/checklist/ChecklistMenu.vue'),
        meta: { perfis: ['comercial', 'vendedor', 'gerente_comercial', 'master', 'admin'] },
      },
      {
        path: ':setor/checklist/formulario/:tipo',
        component: () => import('pages/telas/comercial/checklist/ChecklistForm.vue'),
        meta: {
          perfis: [
            'comercial',
            'vendedor',
            'gerente_comercial',
            'pos_venda',
            'adm_pos_venda',
            'gerente_pos_venda',
            'master',
            'admin',
          ],
        },
      },
    ],
  },

  // --- ROTAS ADMINISTRATIVAS ---
  {
    path: '/admin',
    component: () => import('layouts/MainLayout.vue'),
    meta: { perfis: ['master', 'admin'] },
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
