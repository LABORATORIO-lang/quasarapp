// scripts/importar-starpes.js
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// ⚠️ COLOQUE SUA CONFIGURAÇÃO DO FIREBASE AQUI
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DADOS DO CHECKLIST STARPES - 16 CATEGORIAS
const categorias = [
  {
    id: 'pulverizacao_ponte_verde',
    nome: 'Pulverização Ponte Verde / Distribuição',
    maquinas: [
      { nome: 'Imperador 3000 / 4000 e 3000 CA', imagem: 'imperador3000_4000_e_3000ca' },
      { nome: 'Imperador 2000', imagem: 'imperador_2000' },
      { nome: 'Imperador 2500', imagem: 'imperador_2500' },
      { nome: 'Imperador 3.0 e 3.0 CA', imagem: 'imperador30e30ca' },
      { nome: 'Imperador 3100 e 3100 CA', imagem: 'imperador3100e3100ca' },
      { nome: 'Gladiador 2300 E', imagem: 'gladiador2300' },
      { nome: 'Gladiador 2300 / 2700 / 3000', imagem: 'gladiador2300_2700_3000' }
    ],
    secoes: [
      {
        titulo: 'Estrutural',
        itens: [
          { descricao: 'Verificar Chassi (Aperto pf.)' },
          { descricao: 'Verificar Colunas Dianteiras / Traseiras' },
          { descricao: 'Verificar Capas de Eixo' },
          { descricao: 'Verificar Rodas' },
          { descricao: 'Verificar Buchas de Bronze' },
          { descricao: 'Verificar CJ Limpa Trilho (Opcional)' },
          { descricao: 'Verificar Coxins Cabine' },
          { descricao: 'Verificar Filtros Cabine' },
          { descricao: 'Verificar Pintura' },
          { descricao: 'Verificar Pneus / Pressões' },
          { descricao: 'Verificar Sistema Pneumático' },
          { descricao: 'Verificar Quadro de Barras' },
          { descricao: 'Verificar Primeira Seção Barras' },
          { descricao: 'Verificar Segunda Seção Barras' },
          { descricao: 'Verificar Terceira Seção Barras' },
          { descricao: 'Verificar Ponteira Barras' },
          { descricao: 'Verificar Barra Traseira' },
          { descricao: 'Verificar SKY barras' },
          { descricao: 'Verificar Alinhamento das Barras' },
          { descricao: 'Verificar Suspensão' },
          { descricao: 'Verificar Buchas de Tirante' },
          { descricao: 'Verificar Rolamentos' },
          { descricao: 'Verificar Adesivos' },
          { descricao: 'Verificar Rótulas do Quadro' },
          { descricao: 'Verificar Geometria' },
          { descricao: 'Verificar Ajuste Bitola' },
          { descricao: 'Verificar Lubrificações Gerais' },
          { descricao: 'Verificar se as Revisões estão em dia' }
        ]
      },
      {
        titulo: 'Motor',
        itens: [
          { descricao: 'Verificar Nível de Óleo do Motor' },
          { descricao: 'Verificar Aperto das Correias' },
          { descricao: 'Verificar Filtro de Óleo (Motor)' },
          { descricao: 'Verificar Filtros de Combustíveis' },
          { descricao: 'Verificar Filtro de Ar (2 Elementos Filtrantes)' },
          { descricao: 'Verificar Fluxo de Ar Radiador' },
          { descricao: 'Verificar Hélice Radiador' },
          { descricao: 'Verificar Aperto das Mangueiras' },
          { descricao: 'Verificar Nível de Água do Radiador' },
          { descricao: 'Verificar Coxins do Radiador / Motor' },
          { descricao: 'Verificar RPM MODO ECO' },
          { descricao: 'Verificar alarmes diagnóstico ECM' },
          { descricao: 'Verificar Limpeza do Radiador' }
        ]
      },
      {
        titulo: 'Hidráulica',
        itens: [
          { descricao: 'Verificar Bomba Tripla / LS' },
          { descricao: 'Verificar Reservatório Transmissão' },
          { descricao: 'Verificar Nível de Óleo da Transmissão' },
          { descricao: 'Verificar Reservatório Industrial' },
          { descricao: 'Verificar Nível de Óleo Industrial' },
          { descricao: 'Verificar Motores de Roda' },
          { descricao: 'Redurores de Roda' },
          { descricao: 'Verificar Sobe / Desce' },
          { descricao: 'Verificar Mangueiras gerais' },
          { descricao: 'Verificar Cj. Válvulas Acionadoras' },
          { descricao: 'Verificar abertura de barra auto open' },
          { descricao: 'Verificar Cilindros Hidráulicos' },
          { descricao: 'Verificar Blocos / Bombas' },
          { descricao: 'Verificar Radiador de Óleo' },
          { descricao: 'Verificar funcionamento bitola hidráulica' },
          { descricao: 'Verificar Vedações' }
        ]
      },
      {
        titulo: 'Pulverização',
        itens: [
          { descricao: 'Verificar Bomba e Comando Pulverização' },
          { descricao: 'Verificar Válvulas Seção Altek' },
          { descricao: 'Verificar Válvulas Seção Teejet' },
          { descricao: 'Verificar Conexões / Registros' },
          { descricao: 'Verificar Mangueiras gerais' },
          { descricao: 'Verificar Vedações' },
          { descricao: 'Verificar Bicos' },
          { descricao: 'Verificar Fluxômetro Principal e de Retorno' },
          { descricao: 'Verificar Lava Frasco' },
          { descricao: 'Verificar Válvulas Bico a Bico' },
          { descricao: 'Verificar Filtros' },
          { descricao: 'Verificar Mangueira do sensor de pressão (limpeza)' },
          { descricao: 'Verificar Sensor Nível Max. / Min.' }
        ]
      },
      {
        titulo: 'Ponte Verde',
        itens: [
          { descricao: 'Verificar Vedações da Tub. no Dosador/Aranhas/Barras' },
          { descricao: 'Verificar Mangueiras / Tubos' },
          { descricao: 'Verificar Funcionamento Turbina' },
          { descricao: 'Verificar Rotor / Dosador' },
          { descricao: 'Verificar Sensor Nível Semente' },
          { descricao: 'Verificar Distribuição de semente nos Dissipadores' }
        ]
      },
      {
        titulo: 'Distribuição',
        itens: [
          { descricao: 'Verificar Palhetas' },
          { descricao: 'Verificar Discos' },
          { descricao: 'verificar Borrachas de Vedação' },
          { descricao: 'Verificar Esteira Transportadora' },
          { descricao: 'Verificar Rolos da Esteira' },
          { descricao: 'Verificar Caixa de Transmissão' },
          { descricao: 'Verificar Caixa Tripla e Alinhamentos' },
          { descricao: 'Verificar Lona' },
          { descricao: 'Verificar Grades' },
          { descricao: 'Verificar Comporta' }
        ]
      },
      {
        titulo: 'Tecnologia',
        itens: [
          { descricao: 'Verificar Chicotes Elétricos' },
          { descricao: 'Verificar Comunicações ECUs / PODs / BICO a BICO' },
          { descricao: 'Verificar Acionamentos ECUs / PODs / BICO a BICO' },
          { descricao: 'Verificar Ar Condicionado (Funcionamento)' },
          { descricao: 'Verificar Sensores em Geral' },
          { descricao: 'Verificar Topper 5500 / 6500 (Obs: Levar o CheckList do TOPPER)' },
          { descricao: 'Verificar Sistema FLEX' },
          { descricao: 'Verificar Camera de Video' },
          { descricao: 'Verificar Piloto / Giro Traseiro' },
          { descricao: 'Verificar Luzes geral' },
          { descricao: 'Verificar SENSOR' }
        ]
      }
    ],
    itemGeral: { descricao: 'Outro item Avariado ou Observação:' }
  },
  {
    id: 'pulverizacao_eco_spray',
    nome: 'Pulverização Eco Spray',
    maquinas: [
      { nome: 'Eco Spray', imagem: 'eco_spray' }
    ],
    secoes: [
      {
        titulo: 'Estrutural',
        itens: [
          { descricao: 'Verificar Chassi (Aperto pf.)' },
          { descricao: 'Verificar Colunas Dianteiras / Traseiras' },
          { descricao: 'Verificar Capas de Eixo' },
          { descricao: 'Verificar Rodas' },
          { descricao: 'Verificar Suporte Cameras Eco Spray' },
          { descricao: 'Verificar Buchas de Bronze' },
          { descricao: 'Verificar CJ Limpa Trilho (Opcional)' },
          { descricao: 'Verificar Coxins Cabine' },
          { descricao: 'Verificar Filtros Cabine' },
          { descricao: 'Verificar Pintura' },
          { descricao: 'Verificar Pneus / Pressões' },
          { descricao: 'Verificar Sistema Pneumático' },
          { descricao: 'Verificar Quadro de Barras' },
          { descricao: 'Verificar Primeira Seção Barras' },
          { descricao: 'Verificar Segunda Seção Barras' },
          { descricao: 'Verificar Terceira Seção Barras' },
          { descricao: 'Verificar Ponteira Barras' },
          { descricao: 'Verificar Barra Traseira' },
          { descricao: 'Verificar SKY barras' },
          { descricao: 'Verificar Alinhamento das Barras' },
          { descricao: 'Verificar Suspensão' },
          { descricao: 'Verificar Buchas de Tirante' },
          { descricao: 'Verificar Rolamentos' },
          { descricao: 'Verificar Adesivos' },
          { descricao: 'Verificar Rótulas do Quadro' },
          { descricao: 'Verificar Geometria' },
          { descricao: 'Verificar Ajuste Bitola' },
          { descricao: 'Verificar Lubrificações Gerais' },
          { descricao: 'Verificar se as Revisões estão em dia' }
        ]
      },
      {
        titulo: 'Motor',
        itens: [
          { descricao: 'Verificar Nível de Óleo do Motor' },
          { descricao: 'Verificar Aperto das Correias' },
          { descricao: 'Verificar Filtro de Óleo (Motor)' },
          { descricao: 'Verificar Filtros de Combustíveis' },
          { descricao: 'Verificar Filtro de Ar (2 Elementos Filtrantes)' },
          { descricao: 'Verificar Fluxo de Ar Radiador' },
          { descricao: 'Verificar Hélice Radiador' },
          { descricao: 'Verificar Aperto das Mangueiras' },
          { descricao: 'Verificar Nível de Água do Radiador' },
          { descricao: 'Verificar Coxins do Radiador / Motor' },
          { descricao: 'Verificar RPM MODO ECO' },
          { descricao: 'Verificar alarmes diagnóstico ECM' },
          { descricao: 'Verificar Limpeza do Radiador' }
        ]
      },
      {
        titulo: 'Hidráulica',
        itens: [
          { descricao: 'Verificar Bomba LS / Engrenagens' },
          { descricao: 'Verificar Reservatório Transmissão' },
          { descricao: 'Verificar Nível de Óleo da Transmissão' },
          { descricao: 'Verificar Motores de Roda' },
          { descricao: 'Verificar Bomba Transmissão' },
          { descricao: 'Verificar Sobe / Desce' },
          { descricao: 'Verificar Cj. Válvulas Acionadoras' },
          { descricao: 'Verificar abertura de barra auto open' },
          { descricao: 'Verificar Cilindros Hidráulicos' },
          { descricao: 'Verificar Blocos / Bombas' },
          { descricao: 'Verificar Radiador de Óleo' },
          { descricao: 'Verificar funcionamento bitola hidráulica' },
          { descricao: 'Verificar Vedações' }
        ]
      },
      {
        titulo: 'Pulverização',
        itens: [
          { descricao: 'Verificar Bomba e Comando Pulverização' },
          { descricao: 'Verificar Válvulas Seção Teejet' },
          { descricao: 'Verificar Conexões / Registros' },
          { descricao: 'Verificar Funcionamento Bomba Elétrica' },
          { descricao: 'Verificar Mangueiras gerais' },
          { descricao: 'Verificar Vedações' },
          { descricao: 'Verificar Bicos' },
          { descricao: 'Verificar Fluxômetro Principal e de Retorno' },
          { descricao: 'Verificar Lava Frasco' },
          { descricao: 'Verificar / Testar Limpeza Automática (Valvulas)' },
          { descricao: 'Verificar Filtros' },
          { descricao: 'Verificar Mangueira do sensor de pressão (limpeza)' }
        ]
      },
      {
        titulo: 'Tecnologia',
        itens: [
          { descricao: 'Verificar Chicotes Elétricos' },
          { descricao: 'Verificar Tensão Nominal das Baterias ECO SPRAY (24V)' },
          { descricao: 'Verificar Acionamentos ECUs / PODs / BICO a BICO' },
          { descricao: 'Verificar Comunicações ECUs / PODs / BICO a BICO' },
          { descricao: 'Verificar Cameras' },
          { descricao: 'Verificar Flash' },
          { descricao: 'Verificar Sensores em Geral' },
          { descricao: 'Verificar Ar Condicionado (Funcionamento)' },
          { descricao: 'Verificar Alternador Eco Spray (24V)' },
          { descricao: 'Verificar Topper 6500 (Obs: Levar o CheckList do TOPPER)' },
          { descricao: 'Verificar Piloto / Giro Traseiro' },
          { descricao: 'Verificar Luzes geral' }
        ]
      }
    ],
    itemGeral: { descricao: 'Outro Item Avariado ou Observação:' }
  },
  {
    id: 'tecnologia_topper_5500_6500',
    nome: 'Tecnologia Topper 5500/6500',
    maquinas: [
      { nome: 'Topper 5500', imagem: 'topper5500' },
      { nome: 'Topper 6500', imagem: 'topper6500' }
    ],
    secoes: [
      {
        titulo: 'Tecnologia / Elétrica',
        itens: [
          { descricao: 'Verificar Chicote Elétrico (TOPPER)' },
          { descricao: 'Verificar Alimentação de Entrada' },
          { descricao: 'Verificar Alimentação de Saída (Liga ECU)' },
          { descricao: 'Verificar Resistências da CAN' },
          { descricao: 'Verificar portas USB' },
          { descricao: 'Verificar Alimentação do Conector Antena' },
          { descricao: 'Verificar Integridade dos Conectores (TOPPER)' },
          { descricao: 'Verificar Integridade da Carenagem' },
          { descricao: 'Verificar BOOTLOADER (5500)' },
          { descricao: 'Verificar Sistema Operacional' },
          { descricao: 'Verificar LAUNCHER' },
          { descricao: 'Verificar APP' },
          { descricao: 'Verificar RECOVERY (6500)' },
          { descricao: 'Verificar Alarmes' },
          { descricao: 'Verificar FIRMWARE GNSS' },
          { descricao: 'Verificar Sensor Luminosidade (5500)' },
          { descricao: 'Verificar Conectividade WIFI' },
          { descricao: 'Verificar Conectividade GPRS (Chip)' },
          { descricao: 'Verificar Revisão de PCI' },
          { descricao: 'Verificar Antenas WIFI (6500)' },
          { descricao: 'Verificar Antena Bluetooth (6500)' }
        ]
      }
    ],
    itemGeral: { descricao: 'Outro Item Avariado ou Observação:' }
  },
  {
    id: 'pulverizacao_arrasto',
    nome: 'Pulverização Arrasto',
    maquinas: [
      { nome: 'Fênix 3000 H e E', imagem: 'fenix3000hee' },
      { nome: 'Fênix 2000 H e E', imagem: 'fenix2000hee' },
      { nome: 'Fênix 2000 e 3000 Arrozeiro', imagem: 'fenix2000e3000arrozeiro' },
      { nome: 'Corisco 700 / 1200 / 1500', imagem: 'corisco700_1200_1500' }
    ],
    secoes: [
      {
        titulo: 'Estrutural',
        itens: [
          { descricao: 'Verificar Molas Suspensão Quadro' },
          { descricao: 'Verificar Deslizantes do Quadro' },
          { descricao: 'Verificar Amortecedores do Quadro' },
          { descricao: 'Verificar Batentes do Quadro' },
          { descricao: 'Verificar Tandem (Arrozeiro)' },
          { descricao: 'Verificar Pneus / Pressões' },
          { descricao: 'Verificar Pintura' },
          { descricao: 'Verificar Adesivos' },
          { descricao: 'Verificar Estrutura das Barras' },
          { descricao: 'Verificar Fuso Ponteiras' },
          { descricao: 'verificar Mancal Ponteira' },
          { descricao: 'Verificar Sky de Barra' },
          { descricao: 'Verificar Cardan' },
          { descricao: 'Verificar Roldanas' },
          { descricao: 'Verificar Rótulas de Quadro' },
          { descricao: 'Verificar Espias' },
          { descricao: 'Verificar Funcionamento Ponteira (Barra H)' },
          { descricao: 'Verificar Tirante (Barra H)' },
          { descricao: 'Verificar Proteções Corpos de Bicos' }
        ]
      },
      {
        titulo: 'Hidráulica',
        itens: [
          { descricao: 'Verificar Nível de Óleo' },
          { descricao: 'Verificar Cilindros Hidráulicos' },
          { descricao: 'Verificar Cj. Válvulas Acionadoras' },
          { descricao: 'Verificar Filtro' },
          { descricao: 'Verificar Mangueiras e Condutores' },
          { descricao: 'Verificar Bomba Hidráulica' },
          { descricao: 'Verificar Bloco de Acionamento' }
        ]
      },
      {
        titulo: 'Pulverização',
        itens: [
          { descricao: 'Verificar Comando de Pulverização' },
          { descricao: 'Verificar Fluxômetro' },
          { descricao: 'Verificar válvulas de seção / retorno calibrado' },
          { descricao: 'Verificar Bicos' },
          { descricao: 'Verificar Lava Frasco' },
          { descricao: 'Verificar Conexões' },
          { descricao: 'Verificar Mangueiras' },
          { descricao: 'Verificar Vedações' },
          { descricao: 'Verificar Bomba Principal' },
          { descricao: 'Verificar Bomba de Transferência' },
          { descricao: 'Verificar Tanque Frontal' },
          { descricao: 'Verificar Boia Tanque Traseiro' },
          { descricao: 'Verificar Boia Tanque Frontal' },
          { descricao: 'Verificar Filtros' }
        ]
      },
      {
        titulo: 'Tecnologia',
        itens: [
          { descricao: 'Verificar ECUs / PODs' },
          { descricao: 'Verificar Orion flex' },
          { descricao: 'Verificar Sensores em Geral' },
          { descricao: 'Verificar Luzes Dianteiras (Tanque Frontal)' },
          { descricao: 'Verificar Topper 4500 / 5500 (Obs: Levar o CheckList do TOPPER)' },
          { descricao: 'Verificar Chicotes Elétricos' }
        ]
      }
    ],
    itemGeral: { descricao: 'Outro Item Avariado ou Observação' }
  },
  {
    id: 'trator',
    nome: 'Trator',
    maquinas: [
      { nome: 'Trator ST MAX 180', imagem: 'tratorstmax180' },
      { nome: 'Trator ST MAX 105', imagem: 'tratorstmax105' }
    ],
    secoes: [
      {
        titulo: 'Motor',
        itens: [
          { descricao: 'Verificar Nível de Óleo do Motor' },
          { descricao: 'Verificar Fixação no Chassi' },
          { descricao: 'Verificar Aperto das Correias' },
          { descricao: 'Verificar Hélice Radiador' },
          { descricao: 'Verificar Aperto das Mangueiras' },
          { descricao: 'Verificar Nível de Água do Radiador' },
          { descricao: 'Verificar Nível de Óleo da Transmissão' },
          { descricao: 'Verificar Filtro de Óleo (Motor)' },
          { descricao: 'Verificar Filtros de Combustível (Sedimentador / Geral)' },
          { descricao: 'Verificar Turbina' },
          { descricao: 'Verificar Filtro de Ar (2 Elementos Filtrantes)' }
        ]
      },
      {
        titulo: 'Hidráulica / Transmissão',
        itens: [
          { descricao: 'Verificar Nível de Óleo Direção / Piloto' },
          { descricao: 'Verificar Nível de Óleo Diferencial Traseiro / Transmissão' },
          { descricao: 'Verificar Nível dos Redutores Traseiros' },
          { descricao: 'Verificar Nível de Óleo Diferencial Dianteiro' },
          { descricao: 'Verificar Nível dos Redutores Dianteiros' },
          { descricao: 'Verificar Filtros de Óleo Hidráulico (Comando / Direção)' },
          { descricao: 'Verificar Conexões e Vedações' },
          { descricao: 'Verificar Cilindros de Elevação dos Braços Hidráulicos' },
          { descricao: 'Verificar Fixação do Eixo Dianteiro / Mesa Frontal' },
          { descricao: 'Verificar Mangueiras e Tubos Hidráulicos' },
          { descricao: 'Verificar Bujões de Drenos' },
          { descricao: 'Verificar Comandos Hidráulicos' },
          { descricao: 'Verificar Funcionamento Braços Hidráulicos' },
          { descricao: 'Verificar Suspiro Transmissão' }
        ]
      },
      {
        titulo: 'Elétrica',
        itens: [
          { descricao: 'Verificar Tensão da Bateria e Fixação' },
          { descricao: 'Verificar Estados dos Terminais e Bornes' },
          { descricao: 'Verificar Fixação do Alternador' },
          { descricao: 'Verificar Tencionamento da Correia do Alternador' },
          { descricao: 'Verificar Fixação Motor de Partida' },
          { descricao: 'Verificar Luzes ( ) Alta ( ) Baixa ( ) Painel' },
          { descricao: 'Verificar Setas ( ) Direita ( ) Esquerda ( ) Painel' },
          { descricao: 'Verificar Faróis Trabalho ( ) Funcionamento ( ) Painel' },
          { descricao: 'Verificar Bloqueio Dif. ( ) Funcionamento ( ) Painel' },
          { descricao: 'Verificar Luz de Freio ( ) Funcionamento ( ) Painel' },
          { descricao: 'Verificar luz de alerta ( ) Funcionamento ( ) Painel' },
          { descricao: 'Verificar PTO ( ) Funcionamento ( ) Painel' },
          { descricao: 'Verificar Limpador de Para-brisa e Lava vidros Diant./Tras.' },
          { descricao: 'Verificar Tomada Auxiliar (3 Polos)' },
          { descricao: 'Verificar Horímetro' },
          { descricao: 'Verificar Conta Giro (RPM)' },
          { descricao: 'Verificar Relógio Temperatura do Motor' },
          { descricao: 'Verificar Relógio Nível de Tanque Combustível' },
          { descricao: 'Verificar Buzina' },
          { descricao: 'Verificar Luz Pressão do Óleo' },
          { descricao: 'Verificar Luz Advertência Alternador' },
          { descricao: 'Verificar Acendedor de Cigarro' },
          { descricao: 'Fusíveis (Cabine, Painel, Bateria)' }
        ]
      },
      {
        titulo: 'Tecnologia',
        itens: [
          { descricao: 'Verificar Posicionamento do Painel' },
          { descricao: 'Verificar Suporte e Fixação do Painel' },
          { descricao: 'Avaliar Instalação Chicote Positivo na Caixa de Junção' },
          { descricao: 'Avaliar Fixação Conector Traseiro para Implementos' },
          { descricao: 'Instalação Geral dos Chicotes do Painel' },
          { descricao: 'Ligar / Desligar Painel' },
          { descricao: 'Tocar Arranque no Trator com Painel Ligado' },
          { descricao: 'Verificar Comunicação com Antena no Menu GPS' },
          { descricao: 'Verificar Versão do Painel e POD Piloto' },
          { descricao: 'Verificar Valor Ângulo de Roda (Esq. - Menor / Dir. - Maior)' },
          { descricao: 'Verificar Mangueiras e Conexões Hidráulicas Piloto' },
          { descricao: 'Instalação Geral dos Chicotes Piloto' }
        ]
      },
      {
        titulo: 'Geral',
        itens: [
          { descricao: 'Verificar Engate / Barra de Tração' },
          { descricao: 'Verificar Proteção PTO' },
          { descricao: 'Verificar Rodados Dianteiros – Pneu:' },
          { descricao: 'Verificar Rodados Traseiros – Pneu:' },
          { descricao: 'Verificar Banco do Condutor e Sensor Presença' },
          { descricao: 'Verificar Filtros de Ar da Cabine (3 Unidades)' },
          { descricao: 'Verificar Funcionamento A/C e Ar Quente' },
          { descricao: 'Verificar Todos os Engates de Marcha a Frente' },
          { descricao: 'Verificar Todos os Engates de Marcha Ré' },
          { descricao: 'Verificar Funcionamento Tração' },
          { descricao: 'Verificar Funcionamento Bloqueio Diferencial Traseiro' },
          { descricao: 'Verificar Funcionamento do Freio' },
          { descricao: 'Verificar Funcionamento do Freio de Mão' },
          { descricao: 'Verificar RPM: Max 2300 e Min 850' },
          { descricao: 'Verificar Funcionamento PTO: 540 ou 1000 RPM' },
          { descricao: 'Verificar Pintura e Adesivos' }
        ]
      }
    ],
    itemGeral: { descricao: 'Outro Item Avariado ou Observação' }
  },
  {
    id: 'plantio_verao',
    nome: 'Plantio Verão',
    maquinas: [
      { nome: 'Cinderela', imagem: 'cinderela' },
      { nome: 'Princesa', imagem: 'princesa' },
      { nome: 'Victória', imagem: 'victoria' },
      { nome: 'Absoluta', imagem: 'absoluta' },
      { nome: 'Estrela', imagem: 'estrela' },
      { nome: 'Absoluta caixa central', imagem: 'absolutacaixacentral' }
    ],
    secoes: [
      {
        titulo: 'Estrutural',
        itens: [
          { descricao: 'Verificar Chassi (Aperto pf.) / Lubrificação' },
          { descricao: 'Verificar Pintura' },
          { descricao: 'Verificar Pneus / Pressões' },
          { descricao: 'Verificar limpeza da turbina positiva' },
          { descricao: 'Verificar Adesivos' },
          { descricao: 'Verificar Correntes em Geral' }
        ]
      },
      {
        titulo: 'Tecnologia',
        itens: [
          { descricao: 'Verificar Painel (Topper 4500 / 5500 e Flex Hidráulico / MPS / PLT) (Obs: Levar o CheckList do TOPPER)' },
          { descricao: 'Verificar Sensores em Geral' },
          { descricao: 'Verificar Cabos' },
          { descricao: 'Verificar Luzes em Geral' },
          { descricao: 'Verificar ECUs Linha a Linha / PODs' },
          { descricao: 'Verificar Servor Motor' }
        ]
      },
      {
        titulo: 'Hidráulica',
        itens: [
          { descricao: 'Verificar Válvulas (PWM, Ventagem e 6 X 2 vias)' },
          { descricao: 'Verificar Motores Hidráulicos' },
          { descricao: 'Verificar Bomba Hidráulica' },
          { descricao: 'Verificar Cilindros Hidráulicos' },
          { descricao: 'Verificar Mangueiras Hidráulicas' },
          { descricao: 'Verificar Radiador de Óleo' },
          { descricao: 'Verificar Reservatório de Óleo' }
        ]
      },
      {
        titulo: 'Reservatórios de Polietileno',
        itens: [
          { descricao: 'Verificar Reservatórios de Semente (Principais)' },
          { descricao: 'Verificar Reservatórios de Semente (Linhas)' },
          { descricao: 'Verificar Reservatórios de Adubo' },
          { descricao: 'Verificar Dosadores de Adubo (Fertisystem)' }
        ]
      },
      {
        titulo: 'Linhas de Semente e Adubo',
        itens: [
          { descricao: 'Verificar Conjunto Discos de Corte' },
          { descricao: 'Verificar Conjunto Sulcador e Ponteira' },
          { descricao: 'Verificar Discos Duplos (Raspadores, Rolamentos e Retentores)' },
          { descricao: 'Verificar Bandas Limit. e Compact. (80,100, 115)' },
          { descricao: 'Verificar Condutores de semente e adubo' },
          { descricao: 'Verificar Embuchamento de Linhas' }
        ]
      },
      {
        titulo: 'Dosadores de Sementes DPS',
        itens: [
          { descricao: 'Verificar Discos de Semente' },
          { descricao: 'Verificar Borrachas de Vedação do Disco de Semente' },
          { descricao: 'Verificar Expulsores de Semente' },
          { descricao: 'Verificar limpeza do eixo servo motor' },
          { descricao: 'Verificar Organizadores de Semente' },
          { descricao: 'Verificar Rolamentos e Vedações' }
        ]
      },
      {
        titulo: 'Dosadores de Sementes Convencional',
        itens: [
          { descricao: 'Verificar Discos de Semente' },
          { descricao: 'Verificar Expulsores de Semente' },
          { descricao: 'Verificar Organizadores de Semente' },
          { descricao: 'Verificar Rolamentos e Vedações' },
          { descricao: 'Verificar Coroa e Pinhão' }
        ]
      }
    ],
    itemGeral: { descricao: 'Outro Item Avariado ou Observação' }
  },
  {
    id: 'plantio_estrela_new',
    nome: 'Plantio Estrela New',
    maquinas: [
      { nome: 'Estrela New', imagem: 'estrelanew' }
    ],
    secoes: [
      {
        titulo: 'Estrutural',
        itens: [
          { descricao: 'Verificar Chassi (Aperto pf.) / Lubrificação' },
          { descricao: 'Verificar Pintura' },
          { descricao: 'Verificar Pneus / Pressões' },
          { descricao: 'Verificar limpeza da turbina positiva/negativa' },
          { descricao: 'Verificar Mola pneumatica' },
          { descricao: 'Verificar Adesivos' },
          { descricao: 'Verificar Correntes em Geral' }
        ]
      },
      {
        titulo: 'Tecnologia',
        itens: [
          { descricao: 'Verificar Painel (Topper 5500) (Obs: Levar o CheckList do TOPPER)' },
          { descricao: 'Verificar Sensores em Geral' },
          { descricao: 'Verificar Luzes em Geral' },
          { descricao: 'Verificar Cabos' },
          { descricao: 'Verificar Funcionamento Monitor de Semente' },
          { descricao: 'Verificar Funcionamento Monitor de Fertilizante' },
          { descricao: 'Verificar STEPPER' },
          { descricao: 'Verificar Motor de Passo' }
        ]
      },
      {
        titulo: 'Hidráulica',
        itens: [
          { descricao: 'Verificar Válvulas blocos em geral' },
          { descricao: 'Verificar Motores Hidráulicos' },
          { descricao: 'Verificar Bomba Hidráulica' },
          { descricao: 'Verificar Cilindros Hidráulicos' },
          { descricao: 'Verificar Mangueiras Hidráulicas' },
          { descricao: 'Verificar filtros' },
          { descricao: 'Verificar retornos hidraulicos (trator)' }
        ]
      },
      {
        titulo: 'Reservatórios de Polietileno',
        itens: [
          { descricao: 'Verificar Reservatórios de Semente (Principais)' },
          { descricao: 'Verificar distribuidor de semente' },
          { descricao: 'Verificar Reservatórios de Semente (Linhas)' },
          { descricao: 'Verificar Reservatórios de Adubo' },
          { descricao: 'Verificar Dosadores de Adubo (rotores)' }
        ]
      },
      {
        titulo: 'Linhas de Semente e Adubo',
        itens: [
          { descricao: 'Verificar Conjunto Discos de Corte' },
          { descricao: 'Verificar Conjunto Sulcador e Ponteira' },
          { descricao: 'Verificar Discos Duplos (Raspadores, Rolamentos e Retentores)' },
          { descricao: 'Verificar Bandas Limit. e Compact.' },
          { descricao: 'Verificar Condutores de semente e adubo' },
          { descricao: 'Verificar Embuchamento de Linhas' }
        ]
      },
      {
        titulo: 'Dosadores de Sementes DPS',
        itens: [
          { descricao: 'Verificar Discos de Semente' },
          { descricao: 'Verificar Borrachas de Vedação do Disco de Semente' },
          { descricao: 'Verificar Expulsores de Semente' },
          { descricao: 'Verificar engrenagem motor' },
          { descricao: 'Verificar Organizadores de Semente' },
          { descricao: 'Verificar botão de acionamento motor' }
        ]
      },
      {
        titulo: 'Pulverizador de sulco',
        itens: [
          { descricao: 'Verificar filtros' },
          { descricao: 'Verificar fluxometros/pressão' },
          { descricao: 'Verificar bomba inoculante' },
          { descricao: 'Verificar circuito de pulverição (vazamentos, bicos)' },
          { descricao: 'Verificar auto limpeza, valvula direcional, chuveirinho' }
        ]
      }
    ],
    itemGeral: { descricao: 'Outro Item Avariado ou Observação' }
  },
  {
    id: 'plantio_inverno',
    nome: 'Plantio Inverno',
    maquinas: [
      { nome: 'Prima', imagem: 'prima' },
      { nome: 'Prima Super e Ceres Super', imagem: 'primasuperecaressuper' },
      { nome: 'Ceres e Ceres Master', imagem: 'cereseceresmaster' }
    ],
    secoes: [
      {
        titulo: 'Estrutural',
        itens: [
          { descricao: 'Verificar Chassi (Aperto pf.) / Lubrificação' },
          { descricao: 'Verificar Pintura' },
          { descricao: 'Verificar Pneus / Pressões' },
          { descricao: 'Verificar Adesivos' },
          { descricao: 'Verificar Correntes em Geral' }
        ]
      },
      {
        titulo: 'Tecnologia',
        itens: [
          { descricao: 'Verificar Painel (Topper 4500 / 5500 e Flex Hidráulico / MPS) (Obs: Levar o CheckList do TOPPER)' },
          { descricao: 'Verificar Sensores em Geral' },
          { descricao: 'Verificar Chicotes' },
          { descricao: 'Verificar POD MPS' }
        ]
      },
      {
        titulo: 'Hidráulica',
        itens: [
          { descricao: 'Verificar Válvulas / blocos' },
          { descricao: 'Verificar Motores Hidráulicos' },
          { descricao: 'Verificar Bomba Hidráulica' },
          { descricao: 'Verificar Cilindros Hidráulicos' },
          { descricao: 'Verificar Mangueiras e tubos Hidráulicos' },
          { descricao: 'Verificar Radiador de Óleo' },
          { descricao: 'Verificar Reservatório de Óleo' },
          { descricao: 'Verificar filtros' },
          { descricao: 'Verificar acumuladores' }
        ]
      },
      {
        titulo: 'Reservatórios de Polietileno',
        itens: [
          { descricao: 'Verificar Reservatórios de Semente (Principais)' },
          { descricao: 'Verificar Reservatórios de Semente (Linhas)' },
          { descricao: 'Verificar Reservatórios de Adubo' },
          { descricao: 'Verificar Dosadores de Adubo (Fertisystem)' }
        ]
      },
      {
        titulo: 'Linhas de Semente e Adubo',
        itens: [
          { descricao: 'Verificar Conjunto Discos de Corte' },
          { descricao: 'Verificar Conjunto Sulcador e Ponteira' },
          { descricao: 'Verificar Discos Duplos (Raspadores, Rolamentos e Retentores)' },
          { descricao: 'Verificar Borrachas das Limit. e Compact. (80,100, 115)' },
          { descricao: 'Verificar Mangotes' },
          { descricao: 'Verificar Embuchamento de Linhas' }
        ]
      },
      {
        titulo: 'Dosadores de Sementes DPS',
        itens: [
          { descricao: 'Verificar Discos de Semente' },
          { descricao: 'Verificar Borrachas de Vedação do Disco de Semente' },
          { descricao: 'Verificar Expulsores de Semente' },
          { descricao: 'Verificar Organizadores de Semente' },
          { descricao: 'Verificar Rolamentos e Vedações' }
        ]
      },
      {
        titulo: 'Dosadores de Sementes Convencional',
        itens: [
          { descricao: 'Verificar Discos de Semente' },
          { descricao: 'Verificar Expulsores de Semente' },
          { descricao: 'Verificar Organizadores de Semente' },
          { descricao: 'Verificar Rolamentos e Vedações' },
          { descricao: 'Verificar Coroa e Pinhão' }
        ]
      }
    ],
    itemGeral: { descricao: 'Outro Item Avariado ou Observação' }
  },
  {
    id: 'plantio_guapa',
    nome: 'Plantio Guapa',
    maquinas: [
      { nome: 'Guapa', imagem: 'guapa' }
    ],
    secoes: [
      {
        titulo: 'Estrutural',
        itens: [
          { descricao: 'Verificar Chassi (Aperto pf.) / Lubrificação' },
          { descricao: 'Verificar Pintura' },
          { descricao: 'Verificar limpeza das turbinas positivas' },
          { descricao: 'Verificar Adesivos' },
          { descricao: 'Verificar reservatório principal de produto' },
          { descricao: 'Verificar chapéu / cone de distribuição de produto' },
          { descricao: 'Verificar torre de distribuição sementes / adubo' },
          { descricao: 'Verificar mangueiras de distribuição Ar / Produto' },
          { descricao: 'Verificar Filtro do Compressor de Ar' },
          { descricao: 'Verificar Limpeza Reservatório Ar do Compressor' }
        ]
      },
      {
        titulo: 'Tecnologia',
        itens: [
          { descricao: 'Verificar Controlador Topper 5500 (Obs: Levar o CheckList do TOPPER)' },
          { descricao: 'Verificar Sensores em Geral' },
          { descricao: 'Verificar Luzes em Geral' },
          { descricao: 'Verificar Chicotes' },
          { descricao: 'Verificar POD Universal' },
          { descricao: 'Verificar POD MPS Sensores' }
        ]
      },
      {
        titulo: 'Hidráulica',
        itens: [
          { descricao: 'Verificar Válvulas (PWM, Ventagem, conta balanço e 6 X 2 vias)' },
          { descricao: 'Verificar Blocos (Geral abre/fecha e compressor de ar)' },
          { descricao: 'Verificar Motores Hidráulicos' },
          { descricao: 'Verificar Bomba Hidráulica' },
          { descricao: 'Verificar Cilindros Hidráulicos' },
          { descricao: 'Verificar Mangueiras e Tubos Hidráulicos' },
          { descricao: 'Verificar Radiador de Óleo (Limpeza)' },
          { descricao: 'Verificar Reservatório de Óleo' },
          { descricao: 'Verificar filtros' },
          { descricao: 'Verificar acumuladores de pressão' }
        ]
      },
      {
        titulo: 'Linhas de Plantio',
        itens: [
          { descricao: 'Verificar Conjunto Discos de Corte' },
          { descricao: 'Verificar Conjunto Sulcador e Ponteira' },
          { descricao: 'Verificar Discos Duplos (Raspadores, Rolamentos e Retentores)' },
          { descricao: 'Verificar Borrachas das Limit. e Compact. (80,100, 115)' },
          { descricao: 'Verificar Mangotes' },
          { descricao: 'Verificar Embuchamento de Linhas' }
        ]
      },
      {
        titulo: 'Dosadores de Produto',
        itens: [
          { descricao: 'Verificar Condições dos Rotores Dosadores de Produto' },
          { descricao: 'Verificar Limpeza dos Rotores de Produto' },
          { descricao: 'Verificar Comporta Limitadora de Produto' },
          { descricao: 'Verificar Limpeza do Venturi' },
          { descricao: 'Verificar Mexedores' }
        ]
      }
    ],
    itemGeral: { descricao: 'Outro Item Avariado ou Observação' }
  },
  {
    id: 'plantio_eva',
    nome: 'Plantio EVA',
    maquinas: [
      { nome: 'Eva', imagem: 'eva' }
    ],
    secoes: [
      {
        titulo: 'Estrutural',
        itens: [
          { descricao: 'Verificar Chassi Aperto pf. / Lubrificação geral' },
          { descricao: 'Verificar Pintura (Visual)' },
          { descricao: 'Verificar Pneus / Pressões' },
          { descricao: 'Verificar limpeza da turbina negativa e do Duto do vácuo.' },
          { descricao: 'Verificar Adesivos (Visual)' },
          { descricao: 'Verificar Correntes da transmissão adubo de Segurança Cabeçalho' }
        ]
      },
      {
        titulo: 'Tecnologia',
        itens: [
          { descricao: 'Verificar Painel (Topper 5500 / Smartphone) (Obs: Levar o CheckList do TOPPER)' },
          { descricao: 'Verificar Sensores em Geral' },
          { descricao: 'Verificar Cabos e Chicotes Geral' },
          { descricao: 'Verificar Giroflex, Antena GPS e Sirene' },
          { descricao: 'Verificar POD / ECU' },
          { descricao: 'Verificar Motor de Passo' }
        ]
      },
      {
        titulo: 'Hidráulica',
        itens: [
          { descricao: 'Verificar redutores da transmissão' },
          { descricao: 'Verificar Bomba Hidráulica (SHS)' },
          { descricao: 'Verificar Cilindros Hidráulicos' },
          { descricao: 'Verificar Mangueiras Hidráulicas' },
          { descricao: 'Verificar Reservatório de Óleo (Período de troca de óleo e filtro)' }
        ]
      },
      {
        titulo: 'Reservatórios de Polietileno',
        itens: [
          { descricao: 'Verificar Reservatórios de Semente (Principais)' },
          { descricao: 'Verificar Reservatórios de Semente (Linhas)' },
          { descricao: 'Verificar Reservatórios de Adubo' },
          { descricao: 'Verificar Dosadores de Adubo (Fertisystem e Rosca Sem Fim)' }
        ]
      },
      {
        titulo: 'Linhas de Semente e Adubo',
        itens: [
          { descricao: 'Verificar Conjunto Discos de Corte' },
          { descricao: 'Verificar Conjunto Sulcador e Ponteira' },
          { descricao: 'Verificar Discos Duplos (Raspadores, Rolamentos e Retentores)' },
          { descricao: 'Verificar Bandas Limit. e Compactadora (80)' },
          { descricao: 'Verificar Condutores e Mangotes de Semente e Adubo' },
          { descricao: 'Verificar Folgas / Embuchamento de Linhas' }
        ]
      },
      {
        titulo: 'Dosadores de Sementes DPS-E',
        itens: [
          { descricao: 'Verificar Discos de Semente e Botão de Acionamento do disco.' },
          { descricao: 'Verificar Borrachas de Vedação do Disco de Semente' },
          { descricao: 'Verificar Expulsores e Organizador da semente.' },
          { descricao: 'Verificar Limpeza do DPS-E' },
          { descricao: 'Verificar Visor e comporta da semente' },
          { descricao: 'Verificar Rolamentos e Vedações' }
        ]
      }
    ],
    itemGeral: { descricao: 'Outro Item Avariado ou Observação:' }
  },
  {
    id: 'plantio_guapita',
    nome: 'Plantio Guapita',
    maquinas: [
      { nome: 'Guapita', imagem: 'guapita' }
    ],
    secoes: [
      {
        titulo: 'Estrutural',
        itens: [
          { descricao: 'Verificar Chassi (Aperto pf.) / Lubrificação' },
          { descricao: 'Verificar Pintura' },
          { descricao: 'Verificar Limpeza das Turbinas Positivas' },
          { descricao: 'Verificar Adesivos' },
          { descricao: 'Verificar Reservatório Principal de Produto' },
          { descricao: 'Verificar Chapéu / Cone de Distribuição Produto' },
          { descricao: 'Verificar Torre de Distribuição Sementes / Adubo' },
          { descricao: 'Verificar Mangueiras de Distribuição Ar / Produto' },
          { descricao: 'Verificar Lona Reservatório de Fertilizante' },
          { descricao: 'Verificar Estado de Escala Reservatório de Fertilizante' },
          { descricao: 'Verificar Calibragem dos Pneus' }
        ]
      },
      {
        titulo: 'Tecnologia',
        itens: [
          { descricao: 'Verficar Controlador Topper 5500 (Obs: Levar o CheckList do TOPPER)' },
          { descricao: 'Verificar Sensores em Geral' },
          { descricao: 'Verificar Chicotes' },
          { descricao: 'Verificar PODs / ECUs' },
          { descricao: 'Verificar Funcionamento ECU Bluetooth com Celular' },
          { descricao: 'Verificar Giroflex, Antena GPS e Sirene' }
        ]
      },
      {
        titulo: 'Hidráulica',
        itens: [
          { descricao: 'Verificar Válvulas (PWM, Ventagem, conta balanço e 6 X 2 vias' },
          { descricao: 'Verificar Blocos (Geral abre / fecha)' },
          { descricao: 'Verificar Motores Hidráulicos' },
          { descricao: 'Verificar Bomba Hidráulica' },
          { descricao: 'Verificar Cilindros Hidráulicos' },
          { descricao: 'Verificar Mangueiras e Tubos Hidráulicos' },
          { descricao: 'Verificar filtros' }
        ]
      },
      {
        titulo: 'Linhas de Plantio',
        itens: [
          { descricao: 'Verificar Discos Duplos (Raspadores, Rolamentos e Retentores)' },
          { descricao: 'Verificar Borrachas das Limit. e Compactadora' },
          { descricao: 'Verificar Mangotes' },
          { descricao: 'Verificar Embuchamento de Linhas' },
          { descricao: 'Verificar regulagem de todas as linhas limitadora' }
        ]
      },
      {
        titulo: 'Dosadores de Produto',
        itens: [
          { descricao: 'Verificar Condições dos Rotores Dosadores de Produto' },
          { descricao: 'Verificar Limpeza dos Rotores de Produto' },
          { descricao: 'Verificar Comporta Limitadora de Produto' },
          { descricao: 'Verificar Limpeza do Venturi' },
          { descricao: 'Verificar Mexedores' }
        ]
      }
    ],
    itemGeral: { descricao: 'Outro Item Avariado ou Observação:' }
  },
  {
    id: 'colheita',
    nome: 'Colheita',
    maquinas: [
      { nome: 'Brava +', imagem: 'brava' },
      { nome: 'BRAVÍSSIMA', imagem: 'bravissima' }
    ],
    secoes: [
      {
        titulo: 'Estrutural',
        itens: [
          { descricao: 'Verificar Chassi (Aperto pf.)' },
          { descricao: 'Verificar Adesivos' },
          { descricao: 'Verificar Pintura' },
          { descricao: 'Verificar Acoplamento Colheitadeira' }
        ]
      },
      {
        titulo: 'Carenagens',
        itens: [
          { descricao: 'Verificar Carenagens Centrais' },
          { descricao: 'Verificar Carenagens Laterais' }
        ]
      },
      {
        titulo: 'Linhas',
        itens: [
          { descricao: 'Verificar Rolamentos Transmissão' },
          { descricao: 'Verificar Raspadores dos Rolos Recolhedores' },
          { descricao: 'Verificar Caixa Transmissão Linhas (Vazamentos)' },
          { descricao: 'Verificar Correntes de Transmissão Laterais' },
          { descricao: 'Verificar Cardãs (Transmissão)' },
          { descricao: 'Verificar Rolos Recolhedores' },
          { descricao: 'Verificar Correntes Recolhedoras' },
          { descricao: 'Verificar Cj. Esticador Correntes Recolhedoras' },
          { descricao: 'Verificar Guias das Correntes Recolhedoras' }
        ]
      },
      {
        titulo: 'Elétrica',
        itens: [
          { descricao: 'Verificar Kit Elektra (Funcionamento)' },
          { descricao: 'Verificar Kit Sensores de Altura (Funcionamento)' }
        ]
      }
    ],
    itemGeral: { descricao: 'Outro item avariado ou observação:' }
  },
  {
    id: 'rebokes',
    nome: 'Rebokes',
    maquinas: [
      { nome: 'Rebokes Ninja', imagem: 'rebokesninja' },
      { nome: 'Rebokes Inox', imagem: 'rebokesinox' },
      { nome: 'Reboke Plus', imagem: 'rebokeplus' },
      { nome: 'Reboke 15000', imagem: 'reboke15000' },
      { nome: 'Reboke 11000', imagem: 'reboke11000' },
      { nome: 'Reboke 6000 TSI', imagem: 'reboke6000tsi' },
      { nome: 'Reboke 12000 TSI', imagem: 'reboke12000tsi' }
    ],
    secoes: [
      {
        titulo: 'Estrutural',
        itens: [
          { descricao: 'Verificar chassi' },
          { descricao: 'Verificar pintura' },
          { descricao: 'Verificar pneus' },
          { descricao: 'Verificar engate cabeçalho' },
          { descricao: 'Verificar tubo de descarga (Articulações)' },
          { descricao: 'Verificar borrachas helicoide (TSI 6000)' },
          { descricao: 'Verificar esteira de descarga (TSI 12000)' },
          { descricao: 'Verificar Helicoides' },
          { descricao: 'Verificar adesivos' },
          { descricao: 'Verificar sistema de freios' }
        ]
      },
      {
        titulo: 'Tecnologia',
        itens: [
          { descricao: 'Verificar chicotes' },
          { descricao: 'Verificar POD / ECUs' },
          { descricao: 'Verificar Controle Remoto' },
          { descricao: 'Verificar Sirene' },
          { descricao: 'Verificar Controle Embreagem' },
          { descricao: 'Verificar sensores em Geral' },
          { descricao: 'Verificar Controlador FLEX / DIMELTHOZ' }
        ]
      },
      {
        titulo: 'Sistema Elétrico',
        itens: [
          { descricao: 'Verificar atuadores (TSI)' },
          { descricao: 'Verificar sistema eletro-hidráulico' },
          { descricao: 'Verificar luzes' }
        ]
      },
      {
        titulo: 'Hidráulica',
        itens: [
          { descricao: 'Verificar cilindros hidráulicos' },
          { descricao: 'Verificar motores hidráulicos' },
          { descricao: 'Verificar bomba dosadora / Estatores' },
          { descricao: 'Verificar KIT Incendio' },
          { descricao: 'Verificar comandos hidráulicos' },
          { descricao: 'Verificar Nível óleo' },
          { descricao: 'Verificar trocador de calor' },
          { descricao: 'Verificar bomba hidráulica' }
        ]
      }
    ],
    itemGeral: { descricao: 'Outro Item Avariado ou Observação:' }
  },
  {
    id: 'multi',
    nome: 'Multi',
    maquinas: [
      { nome: 'Asa Laser Canavieiro / H / CR / CRDCR / KS', imagem: 'asalasercanavieiro_h_cr_crdcr_ks' },
      { nome: 'FOX / KS', imagem: 'fox_ks' },
      { nome: 'Starplan', imagem: 'starplan' },
      { nome: 'Embolsadora', imagem: 'embolsadora' },
      { nome: 'PAD', imagem: 'pad' },
      { nome: 'Extratora', imagem: 'extratora' }
    ],
    secoes: [
      {
        titulo: 'Estrutural',
        itens: [
          { descricao: 'Verificar chassi' },
          { descricao: 'Verificar pintura' },
          { descricao: 'Verificar pneus' },
          { descricao: 'Verificar engate cabeçalho' },
          { descricao: 'Verificar tubo de descarga (Articulações)' },
          { descricao: 'Verificar desarme das hastes (Fox)' },
          { descricao: 'Verificar rolamentos gerais' },
          { descricao: 'Verificar helicoides' },
          { descricao: 'Verificar adesivos' },
          { descricao: 'Verificar desgastes dos discos (Fox e Asa)' },
          { descricao: 'Verificar freios (Desgaste e Regulagens)' },
          { descricao: 'Verificar distribuição (kit ks)' },
          { descricao: 'Verificar transmissão' },
          { descricao: 'Verificar trava acoplamento (PAD)' },
          { descricao: 'Verificar articulações / buchas (PAD)' },
          { descricao: 'Verificar cardans' },
          { descricao: 'Verificar lâmina (starplan)' }
        ]
      },
      {
        titulo: 'Sistema Elétrico',
        itens: [
          { descricao: 'Verificar Chicotes em Geral' },
          { descricao: 'Verificar luzes' }
        ]
      },
      {
        titulo: 'Hidráulica',
        itens: [
          { descricao: 'Verificar cilindros hidráulicos' },
          { descricao: 'Verificar comandos hidráulicos' },
          { descricao: 'Verificar multifaster (Engate rápido)' },
          { descricao: 'Verificar válvulas de segurança' }
        ]
      }
    ],
    itemGeral: { descricao: 'Outro Item Avariado ou Observação:' }
  },
  {
    id: 'distribuicao_autopropelido',
    nome: 'Distribuição Autopropelido',
    maquinas: [
      { nome: 'Hércules 6.0', imagem: 'hercules60' },
      { nome: 'Hércules 3.8', imagem: 'hercules38' },
      { nome: 'Hércules 4.0', imagem: 'hercules40' },
      { nome: 'Hércules 5.0', imagem: 'hercules50' }
    ],
    secoes: [
      {
        titulo: 'Estrutural',
        itens: [
          { descricao: 'Verificar Chassis (Aperto pf.)' },
          { descricao: 'Verificar Colunas Dianteiras / Traseiras' },
          { descricao: 'Verificar Capas de Eixo' },
          { descricao: 'Verificar Rodas' },
          { descricao: 'Verificar Buchas de Bronze' },
          { descricao: 'Verificar CJ Limpa Trilho (Opcional)' },
          { descricao: 'Verificar Coxins Cabine' },
          { descricao: 'Verificar Filtros' },
          { descricao: 'Verificar Pintura' },
          { descricao: 'Verificar Pneus / Pressões' },
          { descricao: 'Verificar Sistema Pneumático' },
          { descricao: 'Verificar Suspensão' },
          { descricao: 'Verificar Buchas do Tirante' },
          { descricao: 'Verificar Rolamentos' },
          { descricao: 'Verificar Adesivos' },
          { descricao: 'Verificar Geometria' },
          { descricao: 'Verificar Ajuste Bitola' },
          { descricao: 'Verificar Lubrificações Gerais' },
          { descricao: 'Revisões em Dia' }
        ]
      },
      {
        titulo: 'Motor',
        itens: [
          { descricao: 'Verificar Nível de Óleo do Motor' },
          { descricao: 'Verificar Aperto das Correias' },
          { descricao: 'Verificar Filtro de Óleo (Motor)' },
          { descricao: 'Verificar Filtros de Combustível (Sedimentador / Geral)' },
          { descricao: 'Verificar Filtro de Ar (2 Elementos Filtrantes)' },
          { descricao: 'Verificar Fluxo de Ar Radiador' },
          { descricao: 'Verificar Hélice Radiador' },
          { descricao: 'Verificar Aperto das Mangueiras' },
          { descricao: 'Verificar Nível de Água do Radiador' },
          { descricao: 'Verificar Coxins do Radiador / Motor' },
          { descricao: 'Verificar Limpeza do Radiador' }
        ]
      },
      {
        titulo: 'Hidráulica',
        itens: [
          { descricao: 'Verificar Bomba Tripla / LS' },
          { descricao: 'Verificar Reservatório Transmissão' },
          { descricao: 'Verificar Nível de Óleo da Transmissão' },
          { descricao: 'Verificar Reservatório Industrial' },
          { descricao: 'Verificar Nível de Óleo Industrial' },
          { descricao: 'Verificar Motores de Roda / Redutor' },
          { descricao: 'Verificar Bomba Transmissão' },
          { descricao: 'Verificar Mangueiras e Condutores' },
          { descricao: 'Verificar Cilindros Hidráulicos' },
          { descricao: 'Verificar Blocos / Motores Hidraulicos' },
          { descricao: 'Verificar Radiador de Óleo' },
          { descricao: 'Verificar Filtros' },
          { descricao: 'Verificar Vedações' }
        ]
      },
      {
        titulo: 'Distribuição',
        itens: [
          { descricao: 'Verificar Palhetas' },
          { descricao: 'Verificar Discos' },
          { descricao: 'Verificar Borrachas de Vedação Esteira' },
          { descricao: 'Verificar Esteira Transportadora' },
          { descricao: 'Verificar Rolos da Esteira' },
          { descricao: 'Verificar Caixa de Transmissão' },
          { descricao: 'Verificar Caixa Tripla e Alinhamento' },
          { descricao: 'Verificar Lona' },
          { descricao: 'Verificar Grades' },
          { descricao: 'Verificar Comporta' }
        ]
      },
      {
        titulo: 'Tecnologia / Elétrica',
        itens: [
          { descricao: 'Verificar Chicotes Elétricos' },
          { descricao: 'Verificar ECUs / PODs' },
          { descricao: 'Verificar Sensores em Geral' },
          { descricao: 'Verificar Ar Condicionado (Funcionamento)' },
          { descricao: 'Verificar Topper 4500 / 5500 (Obs: Levar o CheckList do TOPPER)' },
          { descricao: 'Verificar Balança' },
          { descricao: 'Verificar Sistema Sensor' },
          { descricao: 'Verificar Piloto / Giro Traseiro' },
          { descricao: 'Verificar Luzes Geral' }
        ]
      }
    ],
    itemGeral: { descricao: 'Outro item avariado ou observação:' }
  },
  {
    id: 'distribuicao_arrasto',
    nome: 'Distribuição Arrasto',
    maquinas: [
      { nome: 'Hércules Caminhão', imagem: 'herculecaminhao' },
      { nome: 'Hércules 10000 Inox e 15000 Inox', imagem: 'herculesinox' },
      { nome: 'Super Bruttus 30000', imagem: 'superbruttus' },
      { nome: 'Bruttus 25000', imagem: 'bruttus25000' },
      { nome: 'Bruttus 12000', imagem: 'bruttus12000' },
      { nome: 'Twister 5500 AP', imagem: 'twister5500ap' },
      { nome: 'Twister 1500 APS', imagem: 'twister1500ap' },
      { nome: 'Tornado 1300', imagem: 'tornado1300' },
      { nome: 'Tornado 600 MD', imagem: 'tornado600md' },
      { nome: 'Bruttus 6000', imagem: 'bruttus6000' }
    ],
    secoes: [
      {
        titulo: 'Estrutural',
        itens: [
          { descricao: 'Verificar Chassis (Aperto pf.)' },
          { descricao: 'Verificar Pintura' },
          { descricao: 'Verificar Pneus' },
          { descricao: 'Verificar Rolamentos' },
          { descricao: 'Verificar Adesivos' },
          { descricao: 'Verificar Engate Cabeçalho' },
          { descricao: 'Verificar Cardans' }
        ]
      },
      {
        titulo: 'Hidráulica',
        itens: [
          { descricao: 'Verificar Motores Hidráulicos' },
          { descricao: 'Verificar Radiador Óleo' },
          { descricao: 'Verificar Bomba Dupla (Hércules)' },
          { descricao: 'Verificar Mangueiras' },
          { descricao: 'Verificar Condutores Hidráulicos' },
          { descricao: 'Verificar Nível de Óleo' },
          { descricao: 'Verificar Tanque de Óleo (Vazamento)' },
          { descricao: 'Verificar Cilindros' },
          { descricao: 'Verificar Blocos' },
          { descricao: 'Verificar Válvula Reguladora dos Discos' }
        ]
      },
      {
        titulo: 'Distribuição',
        itens: [
          { descricao: 'Verificar Palhetas' },
          { descricao: 'Verificar Discos' },
          { descricao: 'verificar Borrachas de Vedação' },
          { descricao: 'Verificar Esteira Transportadora' },
          { descricao: 'Verificar Rolos da Esteira' },
          { descricao: 'Verificar Caixa de Transmissão' },
          { descricao: 'Verificar Caixa Tripla' },
          { descricao: 'Verificar Grades' },
          { descricao: 'Verificar Atuadores Linear (Twister)' },
          { descricao: 'Verificar Cabo da Comporta (Tornado)' },
          { descricao: 'Verificar Defletores' },
          { descricao: 'Verificar Palhetas Calcário' },
          { descricao: 'Verificar Chapéu Calcário' },
          { descricao: 'Verificar Borrachas do Abafador (Bruttus)' }
        ]
      },
      {
        titulo: 'Tecnologia / Elétrica',
        itens: [
          { descricao: 'Verificar Chicotes Elétricos' },
          { descricao: 'Verificar ECUs / PODs' },
          { descricao: 'Verificar Sensores em Geral' },
          { descricao: 'Verificar Chicotes em Geral' },
          { descricao: 'Verificar Topper 4500 / 5500 (Obs: Levar o CheckList do TOPPER)' },
          { descricao: 'Verificar Luzes em Geral' }
        ]
      }
    ],
    itemGeral: { descricao: 'Outro Item Avariado ou Observação:' }
  }
];

async function importar() {
  console.log('🚀 Iniciando importação do Checklist Starpes...\n');
  
  for (const categoria of categorias) {
    const { id, ...dados } = categoria;
    try {
      await setDoc(doc(db, 'checklists_starpes', id), dados);
      console.log(`✅ ${id} - ${dados.nome}`);
    } catch (e) {
      console.error(`❌ Erro em ${id}:`, e.message);
    }
  }
  
  console.log('\n🎉 Importação concluída!');
  console.log(`📊 Total de categorias importadas: ${categorias.length}`);
  process.exit(0);
}

importar();
