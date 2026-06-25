import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import logoTimbrado from 'src/assets/logo-timbrado.png'
import logoAgroReformas from 'src/assets/agroreformas.png'
import localforage from 'localforage'
pdfMake.vfs = pdfFonts.pdfMake?.vfs || pdfFonts.default?.pdfMake?.vfs || pdfFonts.vfs

const imagemParaBase64 = async (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = (e) => reject(e)
    img.src = url
  })
}

const formatarImagem = (img) => {
  if (!img || typeof img !== 'string') return null
  const limpa = img.replace(/\s+/g, '')
  if (
    limpa.startsWith('data:image/png') ||
    limpa.startsWith('data:image/jpeg') ||
    limpa.startsWith('data:image/jpg')
  ) {
    return limpa
  }
  return null
}

const limparTexto = (texto = '', manterQuebra = false) => {
  const base = String(texto).replace(/\\ZX/g, ' ')
  if (manterQuebra) return base.replace(/[^\S\r\n]+/g, ' ').trim()
  return base.replace(/\s+/g, ' ').trim()
}

const processarLinhasObservacao = (texto, incluirMargem = false) => {
  return limparTexto(texto, true)
    .split('\n')
    .map((linha) => {
      const sepIndex = linha.indexOf(':')
      const base = incluirMargem ? { margin: [0, 2, 0, 2] } : {}
      if (sepIndex > 0 && sepIndex < 40) {
        return {
          ...base,
          text: [
            {
              text: linha.substring(0, sepIndex + 1),
              bold: true,
              color: '#F3772C',
            },
            { text: linha.substring(sepIndex + 1) },
          ],
        }
      }
      return { ...base, text: linha }
    })
}

export const gerarChecklistPdf = async (dadosDaTela, retornarBase64 = false) => {
  console.log('DADOS RECEBIDOS NO GERADOR DE PDF:', dadosDaTela)

  let nomeUsuario = dadosDaTela.userName || 'Usuário'
  if (nomeUsuario === 'Usuário') {
    try {
      const sessao = await localforage.getItem('user_session')
      if (sessao?.nome) nomeUsuario = sessao.nome
    } catch {
      // segue com 'Usuário'
    }
  }

  const dataHoraPdf = dadosDaTela.dataHoraFormatada || new Date().toLocaleString('pt-BR')
  const {
    nomeMaquina,
    formulario: formularioNovo,
    dadosFormulario,
    itens: itensNovos,
    respostasChecklist,
    assinaturas,
    fotosGerais,
  } = dadosDaTela

  const formulario = formularioNovo || dadosFormulario || {}
  const itens = itensNovos || respostasChecklist || []

  // Coleta as observações gerais unificadas de fábrica ou transferência
  const obsGeralTexto =
    dadosDaTela.observacaoGeral || formulario.observacaoGeral || dadosDaTela.descricao || ''

  const modoPosVenda = !!(assinaturas?.responsavelNome || assinaturas?.motoristaNome)
  const tipoPdf = dadosDaTela.tipoPdf || dadosDaTela.tipo || ''

  let tituloPdf = 'RELATÓRIO DE AVALIAÇÃO'
  if (tipoPdf === 'recebimento_fabrica' || tipoPdf === 'recebimento') {
    tituloPdf = 'RECEBIMENTO DE FÁBRICA'
  } else if (tipoPdf === 'recebimento_usada') {
    tituloPdf = 'RECEBIMENTO NA UNIDADE'
  } else if (tipoPdf === 'coleta_usada_negociacao') {
    tituloPdf = 'COLETA DE MÁQUINA USADA (NEGOCIAÇÃO)'
  } else if (tipoPdf === 'transferencia_saida' || tipoPdf === 'transferencia') {
    tituloPdf = `TRANSFERÊNCIA: ${(formulario?.unidadeAtual || '').toUpperCase()} → ${(formulario?.unidadeDestino || formulario?.destino || '').toUpperCase()}`
  } else if (tipoPdf === 'recebimento_transferencia') {
    tituloPdf = `RECEBIMENTO DE TRANSFERÊNCIA (DE ${(formulario?.unidadeOrigem || '').toUpperCase()})`
  } else if (tipoPdf === 'venda') {
    tituloPdf = 'VENDA AO CLIENTE'
  } else if (tipoPdf === 'entrega_cliente') {
    tituloPdf = 'TERMO DE ENTREGA TÉCNICA AO CLIENTE'
  } else if (tipoPdf === 'edicao_checklist') {
    tituloPdf = 'EDIÇÃO DE CHECKLIST'
  }

  const assinaVend = modoPosVenda ? assinaturas?.responsavelNome : assinaturas?.vendedorNome
  const assinaCli = modoPosVenda ? assinaturas?.motoristaNome : assinaturas?.clienteNome

  const labelBlocoA = modoPosVenda ? 'Responsável Técnico' : 'Vendedor(a)'
  const labelBlocoB =
    tipoPdf === 'entrega_cliente' ? 'Cliente' : modoPosVenda ? 'Motorista' : 'Cliente'

  const imgPrim = formatarImagem(
    modoPosVenda ? assinaturas?.responsavelImagem : assinaturas?.vendedorImagem,
  )
  const imgSeg = formatarImagem(
    modoPosVenda ? assinaturas?.motoristaImagem : assinaturas?.clienteImagem,
  )

  // Identifica a unidade do usuário (priorizando o cadastro)
  const normalizar = (texto) =>
    (texto || '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

  const unidadeUsuario = dadosDaTela.unidadeUsuario || formulario?.unidadeAtual || ''

  const unidadeNormalizada = normalizar(unidadeUsuario)
  const logoEscolhida =
    unidadeNormalizada.includes('agro reforma') || unidadeNormalizada === 'agro reformas'
      ? logoAgroReformas
      : logoTimbrado

  let logoBase64 = null
  try {
    // Carrega a imagem escolhida dinamicamente
    logoBase64 = formatarImagem(await imagemParaBase64(logoEscolhida))
  } catch (e) {
    console.error('Erro ao carregar logo:', e)
  }

  const todasAsFotos = []
  if (fotosGerais) {
    ;['Frente', 'Direita', 'Traseira', 'Esquerda'].forEach((pos) => {
      const fotoLimpa = formatarImagem(fotosGerais[pos])
      if (fotoLimpa) todasAsFotos.push({ titulo: `Foto Geral - ${pos}`, base64: fotoLimpa })
    })
  }

  if (itens && itens.length > 0) {
    itens.forEach((item, index) => {
      if (item.fotos?.length > 0) {
        item.fotos.forEach((foto) => {
          const fotoLimpa = formatarImagem(foto)
          if (fotoLimpa)
            todasAsFotos.push({ titulo: `Item ${index + 1}: ${item.texto}`, base64: fotoLimpa })
        })
      }
    })
  }

  const anexosContent = []
  if (todasAsFotos.length > 0) {
    todasAsFotos.forEach((foto) => {
      anexosContent.push({
        unbreakable: true,
        stack: [
          {
            text: foto.titulo,
            style: 'sectionTitulo',
            fontSize: 12,
            alignment: 'center',
            margin: [0, 10, 0, 8],
          },
          {
            image: foto.base64,
            fit: [500, 280], // Altura ajustada para garantir que 2 fotos caibam por página sem sobrar folha em branco
            alignment: 'center',
            margin: [0, 0, 0, 15],
          },
        ],
      })
    })
  }

  // ==========================================
  // BLOCOS DE ASSINATURA CORRIGIDOS E ATIVOS
  // ==========================================
  const blocoAssinatura = (img, nome, label, documento = null) => ({
    stack: [
      img
        ? { image: img, width: 150, alignment: 'center' }
        : { text: '\n(Sem assinatura)\n', alignment: 'center', color: '#ccc' },
      { text: '____________________________________', alignment: 'center', margin: [0, 5, 0, 0] },
      { text: `${label}: ${nome || ''}`, alignment: 'center' },
      documento
        ? {
            text: `CPF: ${String(documento)
              .replace(/\D/g, '')
              .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}`,
            alignment: 'center',
            fontSize: 9,
            color: '#333',
          }
        : {},
    ],
  })

  const colunasAssinaturas =
    tipoPdf === 'edicao_checklist'
      ? [blocoAssinatura(imgPrim, assinaVend, labelBlocoA, assinaturas?.responsavelCpf)]
      : [
          blocoAssinatura(imgPrim, assinaVend, labelBlocoA, assinaturas?.responsavelCpf),
          blocoAssinatura(
            imgSeg,
            assinaCli,
            labelBlocoB,
            assinaturas?.motoristaCpf || assinaturas?.clienteCpf,
          ),
        ]

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [30, 100, 30, 60],
    header: () =>
      logoBase64
        ? { image: logoBase64, fit: [535, 70], alignment: 'center', margin: [0, 8, 0, 0] }
        : null,
    footer: (currentPage, pageCount) => ({
      stack: [
        {
          text: `Checklist realizado por: ${nomeUsuario} em ${dataHoraPdf}`,
          fontSize: 8,
          color: '#F3772C',
          alignment: 'center',
          margin: [40, 0, 40, 3],
          bold: true,
        },
        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#F3772C' },
          ],
          margin: [40, 0, 40, 5],
        },
        {
          text: `Dinâmica Máquinas Agrícolas LTDA — Página ${currentPage} de ${pageCount}`,
          fontSize: 7,
          color: '#555',
          alignment: 'center',
          margin: [40, 0, 40, 0],
        },
      ],
    }),
    content: [
      { text: tituloPdf, style: 'header', alignment: 'center' },
      {
        text: `\n${nomeMaquina ? nomeMaquina.toUpperCase() : 'EQUIPAMENTO'}`,
        style: 'subheader',
        alignment: 'center',
      },
      { text: 'DADOS DO EQUIPAMENTO', style: 'sectionTitulo' },
      { text: '\n' },
      {
        margin: [0, 0, 0, 20],
        columns: [
          {
            width: '45%',
            stack: [
              ...(!modoPosVenda ||
              tipoPdf === 'venda' ||
              tipoPdf === 'entrega_cliente' ||
              tipoPdf === 'coleta_usada_negociacao'
                ? [
                    { text: 'CLIENTE', style: 'label' },
                    { text: formulario?.cliente || '-', style: 'value', alignment: 'left' },
                    {
                      canvas: [
                        {
                          type: 'line',
                          x1: 0,
                          y1: 5,
                          x2: 230,
                          y2: 5,
                          lineWidth: 0.5,
                          lineColor: '#F3772C',
                        },
                      ],
                      margin: [0, 0, 0, 10],
                    },
                  ]
                : []),
              { text: 'MARCA', style: 'label' },
              { text: formulario?.marca || '-', style: 'value', alignment: 'left' },
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 0,
                    y1: 5,
                    x2: 230,
                    y2: 5,
                    lineWidth: 0.5,
                    lineColor: '#F3772C',
                  },
                ],
                margin: [0, 0, 0, 10],
              },
              { text: 'SÉRIE', style: 'label' },
              { text: formulario?.serie || '-', style: 'value', alignment: 'left' },
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 0,
                    y1: 5,
                    x2: 230,
                    y2: 5,
                    lineWidth: 0.5,
                    lineColor: '#F3772C',
                  },
                ],
                margin: [0, 0, 0, 10],
              },
              { text: 'HORÍMETRO', style: 'label' },
              { text: formulario?.horimetro || '-', style: 'value', alignment: 'left' },
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 0,
                    y1: 5,
                    x2: 230,
                    y2: 5,
                    lineWidth: 0.5,
                    lineColor: '#F3772C',
                  },
                ],
                margin: [0, 0, 0, 10],
              },
            ],
          },
          { text: '', width: '10%' },
          {
            width: '45%',
            stack: [
              {
                text:
                  tipoPdf === 'recebimento_usada'
                    ? 'UNIDADE RECEPTORA'
                    : tipoPdf === 'coleta_usada_negociacao'
                      ? 'LOCAL DE COLETA'
                      : 'UNIDADE EMISSORA / CIDADE',
                style: 'label',
              },
              {
                text:
                  tipoPdf === 'coleta_usada_negociacao'
                    ? formulario?.unidadeOrigem || formulario?.cliente || 'FAZENDA DO CLIENTE'
                    : formulario?.unidadeDestino ||
                      formulario?.unidadeAtual ||
                      formulario?.cidade ||
                      '-',
                style: 'value',
                alignment: 'left',
              },
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 0,
                    y1: 5,
                    x2: 230,
                    y2: 5,
                    lineWidth: 0.5,
                    lineColor: '#F3772C',
                  },
                ],
                margin: [0, 0, 0, 10],
              },
              { text: 'MODELO', style: 'label' },
              { text: formulario?.modelo || '-', style: 'value', alignment: 'left' },
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 0,
                    y1: 5,
                    x2: 230,
                    y2: 5,
                    lineWidth: 0.5,
                    lineColor: '#F3772C',
                  },
                ],
                margin: [0, 0, 0, 10],
              },
              { text: 'ANO', style: 'label' },
              { text: formulario?.ano || '-', style: 'value', alignment: 'left' },
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 0,
                    y1: 5,
                    x2: 230,
                    y2: 5,
                    lineWidth: 0.5,
                    lineColor: '#F3772C',
                  },
                ],
                margin: [0, 0, 0, 10],
              },
            ],
          },
        ],
      },
      { text: 'ITENS VERIFICADOS', style: 'sectionTitulo' },
      {
        table: {
          widths: ['40%', '15%', '45%'],
          headerRows: 1,
          dontBreakRows: true,
          body: [
            [
              { text: 'ITEM', style: 'itemHeader', fillColor: '#F3772C', color: 'white' },
              {
                text: 'STATUS',
                style: 'itemHeader',
                alignment: 'center',
                fillColor: '#F3772C',
                color: 'white',
              },
              { text: 'OBSERVAÇÕES', style: 'itemHeader', fillColor: '#F3772C', color: 'white' },
            ],
            ...(itens || []).map((i, index) => {
              let corStatus = '#666'
              let textoStatus = i.resposta || 'N/A'
              if (['SIM', 'BOM', 'OK'].includes(textoStatus)) corStatus = '#2e7d32'
              else if (textoStatus === 'ATENCAO') corStatus = '#ef6c00'
              else if (['RUIM', 'NAO'].includes(textoStatus)) corStatus = '#c62828'

              const rowColor = index % 2 === 0 ? '#FFFFFF' : '#FDF2F0' // Efeito Zebra Premium

              return [
                {
                  text: limparTexto(i.texto),
                  style: 'itemText',
                  noWrap: false,
                  fillColor: rowColor,
                },
                {
                  text: textoStatus,
                  style: 'statusBadge',
                  color: corStatus,
                  bold: true,
                  fillColor: rowColor,
                },
                {
                  stack: processarLinhasObservacao(i.observacao || '-'),
                  style: 'itemText',
                  noWrap: false,
                  fillColor: rowColor,
                },
              ]
            }),
          ],
        },
        layout: {
          hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 0 : 0.5),
          vLineWidth: () => 0, // Remove linhas verticais para visual moderno
          hLineColor: () => '#E0E0E0',
          paddingLeft: () => 10,
          paddingRight: () => 10,
          paddingTop: () => 8,
          paddingBottom: () => 8,
        },
        margin: [0, 0, 0, 20],
      },
      ...(obsGeralTexto && obsGeralTexto.trim() !== ''
        ? [
            {
              unbreakable: true,
              stack: [
                {
                  text: 'OBSERVAÇÕES GERAIS DO PROCESSO',
                  style: 'sectionTitulo',
                  margin: [0, 15, 0, 5],
                },
                {
                  table: {
                    widths: ['*'],
                    body: [
                      [
                        {
                          stack: processarLinhasObservacao(obsGeralTexto, true),
                          fontSize: 10,
                          color: '#222',
                          margin: [8, 8, 8, 8],
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: () => '#F3772C',
                    vLineColor: () => '#F3772C',
                  },
                  margin: [0, 0, 0, 20],
                },
              ],
            },
          ]
        : []),
      ...(anexosContent || []),
      {
        unbreakable: true,
        stack: [
          {
            text: 'ASSINATURAS',
            style: 'sectionTitulo',
            margin: [0, 20, 0, 10],
          },
          {
            columns: colunasAssinaturas,
            columnGap: 40,
          },
        ],
      },
    ],
    styles: {
      header: { fontSize: 20, bold: true, color: '#F3772C', alignment: 'center' },
      subheader: { fontSize: 12, color: '#555', alignment: 'center', margin: [0, 0, 0, 20] },
      sectionTitulo: {
        fontSize: 14,
        bold: true,
        color: '#333',
        margin: [0, 5, 0, 10],
        decoration: 'underline',
        decorationColor: '#F3772C',
      },
      label: { fontSize: 8, bold: true, color: '#F3772C', letterSpacing: 1 },
      value: { fontSize: 11, color: '#000', margin: [0, 2, 0, 0] },
      itemHeader: {
        fontSize: 8,
        bold: true,
        letterSpacing: 1,
        margin: [0, 2, 0, 2],
      },
      itemText: {
        fontSize: 10,
        color: '#000',
        lineHeight: 1.2,
        margin: [0, 4, 0, 4],
      },
      statusBadge: { fontSize: 8, bold: true, alignment: 'center', margin: [5, 2, 5, 2] },
    },
  }

  const pdfDoc = pdfMake.createPdf(docDefinition)
  if (retornarBase64) return await pdfDoc.getDataUrl()
  const nomeArquivo = formulario?.serie || 'Equipamento'
  await pdfDoc.download(`Checklist_${nomeArquivo}.pdf`)
}
