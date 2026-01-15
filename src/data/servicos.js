


 export const servicosBarbearia = [
  // --- Categoria: Cortes e Barba Clássicos ---
  {
    categoria: "Cortes e Barba Clássicos",
    servicos: [
      {
        nome: "Corte de Cabelo Simples/Máquina",
        descricao: "Corte rápido com máquina e acabamento básico.",
        precoMin: 20.00,
        precoMax: 40.00,
      },
      {
        nome: "Corte Elaborado/Clássico",
        descricao: "Corte com tesoura ou máquina, incluindo lavagem e finalização (ex: Undercut, Social).",
        precoMin: 50.00,
        precoMax: 85.00,
      },
      {
        nome: "Corte Degradê (Fade)",
        descricao: "Corte que utiliza a técnica de degradê (Fade) com alta precisão.",
        precoMin: 50.00,
        precoMax: 80.00,
      },
      {
        nome: "Barba Simples/Acabamento",
        descricao: "Alinhamento da barba e desenho do contorno com máquina ou navalha.",
        precoMin: 25.00,
        precoMax: 45.00,
      },
      {
        nome: "Barboterapia Clássica",
        descricao: "Barba feita com navalha, toalha quente, espuma, pós-barba e massagem relaxante.",
        precoMin: 50.00,
        precoMax: 80.00,
      },
      {
        nome: "Combo (Corte + Barba)",
        descricao: "Corte de cabelo e Barboterapia Clássica.",
        precoMin: 70.00,
        precoMax: 130.00,
      },
      {
        nome: "Corte Infantil",
        descricao: "Corte de cabelo para crianças.",
        precoMin: 30.00,
        precoMax: 50.00,
      },
    ],
  },

  // --- Categoria: Serviços Químicos e Coloração ---
  {
    categoria: "Serviços Químicos e Coloração",
    observacao: "Os preços podem variar significativamente dependendo do comprimento e volume.",
    servicos: [
      {
        nome: "Pigmentação de Cabelo",
        descricao: "Uso de tonalizante para cobrir falhas e uniformizar a cor dos fios.",
        precoMin: 60.00,
        precoMax: 120.00,
      },
      {
        nome: "Pigmentação de Barba",
        descricao: "Uso de tonalizante para preenchimento e realce da barba.",
        precoMin: 40.00,
        precoMax: 70.00,
      },
      {
        nome: "Luzes / Reflexos",
        descricao: "Clareamento de mechas do cabelo (inclui descoloração e tonalização).",
        precoMin: 100.00, // Preço 'A partir de'
        precoMax: 250.00,
      },
      {
        nome: "Platinado",
        descricao: "Descoloração e tonalização para atingir o tom loiro/branco (exige avaliação).",
        precoMin: 150.00, // Preço 'A partir de'
        precoMax: 300.00,
      },
      {
        nome: "Progressiva / Selagem",
        descricao: "Tratamento químico para alisar, reduzir o volume e o frizz.",
        precoMin: 100.00, // Preço 'A partir de'
        precoMax: 200.00,
      },
    ],
  },

  // --- Categoria: Estética e Tratamentos ---
  {
    categoria: "Estética e Tratamentos",
    servicos: [
      {
        nome: "Hidratação Capilar",
        descricao: "Tratamento para repor nutrientes, brilho e maciez nos fios.",
        precoMin: 20.00,
        precoMax: 50.00,
      },
      {
        nome: "Limpeza de Pele Facial",
        descricao: "Limpeza profunda, remoção de impurezas e aplicação de máscara.",
        precoMin: 30.00,
        precoMax: 100.00,
      },
      {
        nome: "Design de Sobrancelha",
        descricao: "Modelagem e alinhamento das sobrancelhas (pinça e/ou navalha).",
        precoMin: 20.00,
        precoMax: 40.00,
      },
      {
        nome: "Depilação (Nariz e Orelha)",
        descricao: "Remoção de pelos indesejados com cera específica ou máquina.",
        precoMin: 10.00,
        precoMax: 30.00,
      },
      {
        nome: "Pézinho / Contorno",
        descricao: "Apenas o acabamento e alinhamento da nuca e costeletas.",
        precoMin: 15.00,
        precoMax: 35.00,
      },
    ],
  },
];

