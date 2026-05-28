import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import logoTimbrado from 'src/assets/logo-timbrado.png'

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

export const gerarChecklistPdf = async (dadosDaTela) => {
  const { nomeMaquina, formulario, itens, assinaturas, fotosGerais } = dadosDaTela

  let logoBase64 = ''
  try {
    logoBase64 = await imagemParaBase64(logoTimbrado)
  } catch (e) {
    console.error('Erro ao carregar a logo', e)
  }

  // --- MONTANDO LISTA ÚNICA DE FOTOS ---
  const todasAsFotos = []

  // 1. Adicionar Fotos Gerais
  if (fotosGerais) {
    ;['Frente', 'Direita', 'Traseira', 'Esquerda'].forEach((pos) => {
      if (fotosGerais[pos]) {
        todasAsFotos.push({ titulo: `Foto Geral - ${pos}`, base64: fotosGerais[pos] })
      }
    })
  }

  // 2. Adicionar Fotos dos Itens
  if (itens && itens.length > 0) {
    itens.forEach((item, index) => {
      if (item.fotos?.length > 0) {
        item.fotos.forEach((foto) => {
          todasAsFotos.push({ titulo: `Item ${index + 1}: ${item.texto}`, base64: foto })
        })
      }
    })
  }

  // 3. Criar páginas de anexos com 2 fotos por folha
  const anexosContent = []
  for (let i = 0; i < todasAsFotos.length; i += 2) {
    const par = todasAsFotos.slice(i, i + 2)

    // Monta o conteúdo da página
    const pagina = {
      stack: [],
      pageBreak: 'before',
      margin: [0, 0],
    }

    // Adiciona cada foto do par ao stack (uma embaixo da outra)
    par.forEach((foto, index) => {
      pagina.stack.push({
        text: foto.titulo,
        style: 'sectionTitulo',
        fontSize: 12,
        alignment: 'center',
        margin: [0, index === 0 ? 0 : 10, 0, 5], // Reduzi um pouco a margem para sobrar espaço
      })
      pagina.stack.push({
        image: foto.base64,
        width: 400, // Largura máxima
        height: 300, // ALTURA MÁXIMA FORÇADA
        fit: [400, 300], // O 'fit' garante que ela não ultrapasse esse retângulo
        alignment: 'center',
        margin: [0, 0, 0, 5],
      })
    })
    anexosContent.push(pagina)
  }
  // --- DEFINIÇÃO DO DOCUMENTO ---
  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 70, 40, 70],
    header: () =>
      logoBase64
        ? { image: logoBase64, width: 515, alignment: 'center', margin: [0, 20, 0, 10] }
        : null,
    footer: (currentPage, pageCount) => {
      return {
        stack: [
          {
            // Linha laranja decorativa
            canvas: [
              { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#F3772C' },
            ],
            margin: [40, 0, 40, 5],
          },
          {
            // Seu novo texto de rodapé
            text: `Dinâmica Máquinas Agrícolas LTDA, Fone: (65) 3382-4743\nEndereço: Av. Olacyr Francisco de Moraes, nº 3005 - Bairro Area Urbana II, CEP 78.360-000 - Campo Novo do Parecis/MT\nPágina ${currentPage} de ${pageCount}`,
            fontSize: 8, // Diminui um pouquinho para garantir que tudo caiba em duas linhas
            color: '#555',
            alignment: 'center',
            margin: [40, 0, 40, 0],
          },
        ],
      }
    },
    content: [
      { text: '\nRELATÓRIO DE AVALIAÇÃO', style: 'header', alignment: 'center' },
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
            stack: [
              { text: 'CLIENTE', style: 'label' },
              { text: formulario?.cliente || '-', style: 'value' },
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
              { text: 'MARCA', style: 'label' },
              { text: formulario?.marca || '-', style: 'value' },
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
              { text: formulario?.serie || '-', style: 'value' },
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
            width: '45%',
          },
          { text: '', width: '10%' },
          {
            stack: [
              { text: 'CIDADE', style: 'label' },
              { text: formulario?.cidade || '-', style: 'value' },
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
              { text: formulario?.modelo || '-', style: 'value' },
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
              { text: formulario?.horimetro || '-', style: 'value' },
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
            width: '45%',
          },
        ],
      },

      { text: 'ITENS VERIFICADOS', style: 'sectionTitulo' },
      {
        table: {
          widths: ['*', 70, '*'],
          headerRows: 1,
          dontBreakRows: true,
          body: [
            [
              { text: 'ITEM', style: 'itemHeader' },
              { text: 'STATUS', style: 'itemHeader', alignment: 'center' },
              { text: 'OBSERVAÇÕES', style: 'itemHeader' },
            ],
            ...(itens || []).map((i) => {
              let corStatus = '#666'
              let textoStatus = i.resposta || 'N/A'
              if (['SIM', 'BOM', 'OK'].includes(textoStatus)) corStatus = '#2e7d32'
              else if (textoStatus === 'ATENCAO') corStatus = '#ef6c00'
              else if (['RUIM', 'NAO'].includes(textoStatus)) corStatus = '#c62828'
              return [
                { text: i.texto, style: 'itemText' },
                { text: textoStatus, style: 'statusBadge', color: corStatus, bold: true },
                { text: i.observacao || '-', style: 'itemText' },
              ]
            }),
          ],
        },
        layout: { hLineWidth: () => 0.5, vLineWidth: () => 0, hLineColor: () => '#ddd' },
        margin: [0, 0, 0, 20],
      },

      // ... código anterior ...
      { text: 'ASSINATURAS', style: 'sectionTitulo', pageBreak: 'before' },
      {
        columns: [
          // Coluna do Vendedor
          {
            stack: [
              // Se tiver imagem, mostra a imagem. Se não, dá um espaço em branco.
              assinaturas?.vendedorImagem
                ? { image: assinaturas.vendedorImagem, width: 150, alignment: 'center' }
                : { text: '\n\n', margin: [0, 20] },
              {
                text: '____________________________________',
                alignment: 'center',
                margin: [0, 5, 0, 0],
              },
              { text: 'Vendedor(a): ' + (assinaturas?.vendedorNome || ''), alignment: 'center' },
            ],
            margin: [0, 20, 0, 0],
          },
          // Coluna do Cliente
          {
            stack: [
              assinaturas?.clienteImagem
                ? { image: assinaturas.clienteImagem, width: 150, alignment: 'center' }
                : { text: '\n\n', margin: [0, 20] },
              {
                text: '____________________________________',
                alignment: 'center',
                margin: [0, 5, 0, 0],
              },
              { text: 'Cliente: ' + (assinaturas?.clienteNome || ''), alignment: 'center' },
            ],
            margin: [0, 20, 0, 0],
          },
        ],
      },
      // Coluna do Técnico (Aparece centralizada embaixo, apenas se ele tiver assinado ou colocado o nome)
      assinaturas?.tecnicoImagem || assinaturas?.tecnicoNome
        ? {
            stack: [
              assinaturas.tecnicoImagem
                ? { image: assinaturas.tecnicoImagem, width: 150, alignment: 'center' }
                : { text: '\n\n', margin: [0, 20] },
              {
                text: '____________________________________',
                alignment: 'center',
                margin: [0, 5, 0, 0],
              },
              { text: 'Técnico: ' + (assinaturas?.tecnicoNome || ''), alignment: 'center' },
            ],
            margin: [0, 40, 0, 0],
          }
        : null,

      ...anexosContent, // Suas páginas de fotos que configuramos antes
      // ... resto do código ...
    ],
    styles: {
      header: { fontSize: 18, bold: true, color: '#F3772C', alignment: 'center' },
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
      itemHeader: { fontSize: 9, bold: true, color: '#666', margin: [0, 5, 0, 5] },
      itemText: { fontSize: 10, color: '#333', margin: [0, 5, 0, 5] },
      statusBadge: { fontSize: 9, bold: true, alignment: 'center', margin: [5, 2, 5, 2] },
    },
  }

  pdfMake.createPdf(docDefinition).download(`Checklist_${formulario?.cliente || 'Equipamento'}.pdf`)
}
