export const categories = [
  "Pratos do chef",
  "Pratos executivos",
  "Combinados na tábua",
  "Porções The Fish",
  "Porções Boteco",
];
const accompany = "Acompanha arroz, batata frita e salada.";
const item = (id, category, name, price, description, extra = {}) => ({
  id,
  category,
  name,
  price: price === null ? null : price * 100,
  description,
  available: true,
  photo: "",
  ...extra,
});
const variants = (names, prices) =>
  names.map((name, i) => ({ name, price: prices[i] * 100 }));
export const catalog = [
  item(
    "moranga",
    0,
    "Camarão na moranga",
    68,
    `Creme de abóbora preparado com requeijão, mussarela e camarões sem casca. ${accompany}`,
    { portion: "Média de 6 unidades de camarão — 32 g." },
  ),
  item(
    "chiclete",
    0,
    "Chiclete de camarão",
    68,
    `Camarão sem casca, finalizado com cream cheese e queijo mussarela. ${accompany}`,
    { portion: "Média de 6 unidades de camarão — 32 g." },
  ),
  item(
    "havaiano",
    0,
    "Camarão havaiano",
    68,
    `Prato agridoce preparado com camarões sem casca e abacaxi, finalizado com requeijão e mussarela. ${accompany}`,
    { portion: "Média de 6 unidades de camarão — 32 g." },
  ),
  item(
    "parmegiana",
    0,
    "Parmegianas",
    48,
    "Preparadas com molho da casa. Acompanham arroz, salada e batata frita.",
    {
      portion: "Porção média de 100 g.",
      variants: variants(
        ["Tilápia", "Frango", "Mignon", "Camarão"],
        [58, 48, 72, 78],
      ),
    },
  ),
  item(
    "lombo",
    0,
    "Lombo de tilápia ao molho de camarão",
    82,
    `Posta de lombo de tilápia grelhada, coberta com molho cremoso de camarão. ${accompany}`,
    { portion: "200 g de tilápia." },
  ),
  item(
    "salmao",
    0,
    "Salmão grelhado",
    82,
    `Salmão grelhado com geleia de maracujá e alcaparras. ${accompany}`,
    { portion: "200 g de salmão." },
  ),
  item(
    "bife",
    1,
    "Bife a cavalo",
    42,
    "Contrafilé grelhado, arroz, ovo frito, salada e batata frita.",
  ),
  item(
    "omelete",
    1,
    "Omelete",
    38,
    "Omelete recheado com mussarela. Acompanha arroz, salada e batata frita.",
  ),
  item(
    "grelhados",
    1,
    "Grelhados / à milanesa",
    38,
    "Acompanham arroz, salada e batata frita.",
    {
      variants: variants(
        ["Filé de frango", "Filé de tilápia", "Contrafilé"],
        [38, 42, 42],
      ),
      preparations: ["Grelhado", "À milanesa"],
    },
  ),
  item(
    "strogonoff",
    1,
    "Strogonoff",
    38,
    "Servido no molho rosé. Acompanha arroz, batata frita e salada.",
    { variants: variants(["Mignon", "Camarão", "Frango"], [64, 68, 38]) },
  ),
  item(
    "picadinho",
    1,
    "Picadinho de carne com batata",
    null,
    "Cubos de carne ao molho com batatas. Acompanha arroz, feijão e salada.",
  ),
  item(
    "mineiro",
    1,
    "Mineiro",
    null,
    "Bisteca suína grelhada. Acompanha arroz, tutu de feijão, ovo, banana frita e salada de couve.",
  ),
  item(
    "fish",
    2,
    "Fish camarão + tilápia",
    104,
    "Camarão e filé de tilápia à milanesa.",
    { portion: "12 unidades de camarão e 250 g de tilápia." },
  ),
  item(
    "carijo",
    2,
    "Carijó",
    104,
    "Iscas de frango à milanesa e batata frita com queijo mussarela gratinado.",
    { portion: "300 g de frango e 300 g de batata." },
  ),
  item(
    "pescador",
    2,
    "À moda do pescador",
    96,
    "Escolha 3 peixes do cardápio, exceto camarão.",
    {
      portion: "250 g de cada peixe.",
      combo: true,
      eligible: [],
      repeat: false,
    },
  ),
  item(
    "vip",
    2,
    "À moda do pescador VIP",
    146,
    "Escolha 3 opções entre os peixes do cardápio e o camarão.",
    {
      portion: "250 g de cada peixe; para camarão, 12 unidades.",
      combo: true,
      eligible: [],
      repeat: false,
    },
  ),
  item(
    "cliente",
    2,
    "À moda do cliente",
    162,
    "Escolha 3 opções de porções do cardápio.",
    {
      portion: "250 g de cada item; para camarão, 12 unidades.",
      combo: true,
      eligible: [],
      repeat: false,
    },
  ),
  item(
    "mix",
    2,
    "Mix de carnes",
    112,
    "Iscas de carne, frango grelhado e calabresa fatiada, preparados na chapa. Acompanha pão de alho e batata frita.",
    { portion: "200 g de cada carne e 300 g de batata." },
  ),
  item(
    "contra",
    2,
    "Contrafilé",
    132,
    "Tiras de carne preparadas na chapa. Acompanha pão de alho e batata frita.",
    { portion: "500 g de carne e 300 g de batata." },
  ),
  item(
    "acompanhamento",
    2,
    "Combo acompanhamento",
    18,
    "Arroz, feijão e salada.",
  ),
  item("tilapia", 3, "Tilápia", 86, "Iscas de filé de tilápia à milanesa."),
  item("merluza", 3, "Merluza", 78, "Iscas de filé de merluza à milanesa."),
  item(
    "camarao",
    3,
    "Camarão",
    112,
    "Camarões selecionados de tamanho médio.",
    {
      portion: "Indicação geral: 500 g. Quantidade informada: 25 unidades.",
      preparations: [
        "Rústico, com casca",
        "Rústico, sem casca",
        "À milanesa, com casca",
        "À milanesa, sem casca",
      ],
    },
  ),
  item("pintado", 3, "Pintado", 68, "Iscas de filé de pintado à milanesa."),
  item(
    "costelinha",
    3,
    "Costelinha de pacu",
    84,
    "Servida em postas com osso. Contém espinhas.",
  ),
  item(
    "torresmo-pacu",
    3,
    "Torresmo de pacu",
    68,
    "Iscas de pacu à milanesa, sem espinha.",
  ),
  item(
    "arraia",
    3,
    "Arraia",
    78,
    "Cubos de arraia à milanesa com geleia de pimenta.",
  ),
  item("lambari", 3, "Lambari", 76, "Lambaris fritos inteiros."),
  item("manjubas", 3, "Manjubas", 76, "Manjubinhas inteiras."),
  item(
    "torresmo",
    4,
    "Torresmo caipira",
    null,
    "Preparado com barriga de porco, panceta. Acompanha mandioca frita.",
    { portion: "250 g de cada item." },
  ),
].map((p) => ({
  ...p,
  portion:
    p.portion || (p.category === 3 ? "Indicação geral de porção: 500 g." : ""),
}));
export const initialSettings = {
  name: "The Fish — Restaurante e Petiscaria",
  address:
    "Av. Leonardo Vilas Boas, 2951 — Vila Nova Botucatu, Botucatu — SP, CEP 18608-227",
  phone: "(14) 99813-4791",
  whatsapp: "5514998134791",
  instagram: "https://www.instagram.com/thefishrestaurante/",
  facebook: "https://www.facebook.com/julianathefish",
  logo: "",
  botecoLogo: "",
  categories,
  timezone: "America/Sao_Paulo",
  hours: {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [
      ["11:00", "14:00"],
      ["18:00", "23:00"],
    ],
    5: [
      ["11:00", "14:00"],
      ["18:00", "23:00"],
    ],
    6: [
      ["11:00", "14:00"],
      ["18:00", "23:00"],
    ],
  },
  exceptions: {},
  cutoffMinutes: 0,
  paused: false,
  scheduling: false,
  pickup: true,
  delivery: false,
  deliveryAreas: [],
  payments: [],
  estimate: "",
  reviewNotes: [
    "Logo do restaurante e logo do Júlio.",
    "Fotos autorizadas.",
    "Preços do picadinho, Mineiro e torresmo caipira.",
    "Restante do cardápio Boteco.",
    "Esclarecer se os 32 g dos camarões são por unidade ou porção; informação preservada.",
    "Confirmar funcionamento habitual de segunda-feira; fechado inicialmente.",
    "Confirmar opções elegíveis e repetição nos combinados; bloqueados até configuração.",
    "Área e taxas de entrega.",
    "Formas de pagamento presencial.",
    "Na Vercel, conectar PostgreSQL e configurar FISH_ADMIN_PASSWORD. Conferir domínio HTTPS, backups e retenção. Pagamento online requer provedor e webhook real.",
  ],
};
export const money = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    v / 100,
  );
export const statuses = [
  "Recebido",
  "Confirmado",
  "Em preparo",
  "Pronto para retirada",
  "Saiu para entrega",
  "Concluído",
  "Recusado",
];
export function nextStatuses(order) {
  if (order.status === "Recebido") return ["Confirmado", "Recusado"];
  if (order.status === "Confirmado") return ["Em preparo", "Recusado"];
  if (order.status === "Em preparo")
    return [
      order.mode === "pickup" ? "Pronto para retirada" : "Saiu para entrega",
      "Recusado",
    ];
  if (["Pronto para retirada", "Saiu para entrega"].includes(order.status))
    return ["Concluído"];
  return [];
}
