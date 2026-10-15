// Content and verified public data. Sources: fmarquiteta.com.br (consulted 14/10/2026) and
// screenshots of the @arq.fernandamoraes Instagram profile supplied by the client (14/10/2026). Anything not confirmed there stays out.

export const SITE_URL = "https://fm-arquitetura-previa.vercel.app";

export const contact = {
  whatsappDisplay: "(21) 98145-7770",
  whatsappNumber: "5521981457770",
  whatsappMessage: "Olá, Fernanda! Vi a prévia do site e gostaria de conversar sobre um projeto.",
  instagramHandle: "@arq.fernandamoraes",
  instagramUrl: "https://www.instagram.com/arq.fernandamoraes/",
  officialSite: "https://www.fmarquiteta.com.br/",
  area: "Rio de Janeiro",
};

export const whatsappHref = `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(contact.whatsappMessage)}`;

export const nav = [
  { href: "#abordagem", label: "Abordagem" },
  { href: "#estudos", label: "Estudos" },
  { href: "#servicos", label: "Serviços" },
  { href: "#metodo", label: "Método" },
  { href: "#sobre", label: "Sobre" },
];

export type Img = { src: string; w: number; h: number };

/** Each study ships as webp at several widths: /img/<name>-<w>.webp */
export const studies = {
  hero: { src: "hero", w: 1920, h: 1080 },
  heroM: { src: "hero-m", w: 900, h: 1600 },
  living: { src: "hero", w: 1920, h: 1080 },
  dining: { src: "dining", w: 1600, h: 1000 },
  bedroom: { src: "bedroom", w: 1600, h: 1000 },
  office: { src: "office", w: 1600, h: 1000 },
  plant: { src: "plant", w: 1000, h: 1250 },
  light: { src: "light", w: 1000, h: 1250 },
  table: { src: "table", w: 1000, h: 1250 },
} satisfies Record<string, Img>;

export const widths: Record<string, number[]> = {
  hero: [960, 1440, 1920],
  "sala-vista": [960, 1440, 1920, 2560],
  leitura: [800, 1600, 2236],
  quarto: [800, 1600, 2236],
  jantar: [800, 1400, 1924],
  cozinha: [600, 1100],
  varanda: [600, 1270],
  lavabo: [600, 950],
  "home-office": [600, 950],
  banho: [500, 800],
  "hero-m": [600, 900],
  dining: [800, 1200, 1600],
  bedroom: [800, 1200, 1600],
  office: [800, 1200, 1600],
  plant: [500, 1000],
  light: [500, 1000],
  table: [500, 1000],
};

export function srcSet(name: string) {
  return widths[name].map((w) => `/img/${name}-${w}.webp ${w}w`).join(", ");
}
export function largest(name: string) {
  const ws = widths[name];
  return `/img/${name}-${ws[ws.length - 1]}.webp`;
}

/** Applied neuroarchitecture, as the official site describes it: biophilia, lighting, affective memory. */
export const pillars = [
  {
    key: "biofilia",
    title: "Biofilia",
    quote: "Plantas não são apenas decoração.",
    text: "Plantas, madeira, fibras naturais e a vista para fora. Trazer a natureza para dentro de casa é ponto de partida, não acabamento.",
    img: "leitura",
    alt: "Imagem ilustrativa: canto de leitura com poltrona, plantas e janela aberta para o verde.",
  },
  {
    key: "iluminacao",
    title: "Iluminação",
    quote: "Nem toda hora do dia pede a mesma luz.",
    text: "Luz natural bem aproveitada durante o dia e luz quente, em camadas, para a noite. O ambiente muda com as horas, e o projeto acompanha.",
    img: "quarto",
    alt: "Imagem ilustrativa: quarto com painel de madeira, pendentes de luz quente e cortina de linho.",
  },
  {
    key: "memoria",
    title: "Memória afetiva",
    quote: "Cada ambiente guarda um pouco da história de quem vive nele.",
    text: "Os objetos, as cores e as peças que contam a história de quem mora ali ganham lugar de destaque, em vez de ficarem guardados.",
    img: "jantar",
    alt: "Imagem ilustrativa: mesa de jantar em madeira com cadeiras estofadas e pendentes sobre a mesa.",
  },
] as const;

/** Kinds of work shown in the Instagram highlights (no client names). */
export const fields = ["Apartamentos", "Casas", "Quiosques e lojas", "Banheiros", "Espaços de saúde", "Consultoria à distância", "Palestras"];

export const gallery = [
  { img: "cozinha", title: "Cozinha", note: "Ilha em pedra, marcenaria em madeira e luz embutida nas prateleiras.", kind: "Imagem ilustrativa", alt: "Imagem ilustrativa de cozinha com ilha em pedra clara, banquetas e marcenaria em madeira." },
  { img: "dining", title: "Sala de jantar", note: "Parede em tom de ameixa, aparador ripado e mesa redonda para reunir.", kind: "Estudo 3D", alt: "Estudo 3D de sala de jantar com mesa redonda de madeira, cadeiras claras, pendentes e parede ameixa." },
  { img: "varanda", title: "Varanda", note: "Estofado em L, fogo baixo e a vista dos morros no fim da tarde.", kind: "Imagem ilustrativa", alt: "Imagem ilustrativa de varanda com sofá em L, lareira externa redonda e vista para os morros ao pôr do sol." },
  { img: "lavabo", title: "Lavabo", note: "Bancada esculpida em pedra e luz indireta sob o espelho.", kind: "Imagem ilustrativa", alt: "Imagem ilustrativa de lavabo com bancada esculpida em pedra, metais escuros e luz indireta." },
  { img: "bedroom", title: "Quarto", note: "Cabeceira estofada, arandelas de leitura e roupa de cama em linho.", kind: "Estudo 3D", alt: "Estudo 3D de quarto com cabeceira estofada em ameixa, painéis ripados e arandelas." },
  { img: "home-office", title: "Home office", note: "Bancada em madeira, prateleira iluminada e a janela para o verde.", kind: "Imagem ilustrativa", alt: "Imagem ilustrativa de home office com bancada de madeira, cadeira clara e prateleira com luz embutida." },
  { img: "banho", title: "Banheiro", note: "Cubas de apoio, pedra clara e o box em vidro com perfil escuro.", kind: "Imagem ilustrativa", alt: "Imagem ilustrativa de banheiro com duas cubas de apoio sobre bancada de pedra e box de vidro." },
  { img: "hero", title: "Sala de estar", note: "Ripado de madeira, veludo ameixa e a luz da tarde entrando pela lateral.", kind: "Estudo 3D", alt: "Estudo 3D de sala de estar com sofá de veludo ameixa, parede em ripado de madeira e janela do piso ao teto." },
] as const;

export const services = [
  {
    n: "01",
    title: "Projetos de arquitetura personalizados",
    text: "Da construção do zero à reforma: um projeto que traduz a identidade e as necessidades de cada cliente, dentro do orçamento combinado.",
    img: "cozinha",
  },
  {
    n: "02",
    title: "Consultorias 100% online",
    text: "Orientação especializada para reformas e decoração, para renovar ou aproveitar melhor os espaços que você já tem, de onde estiver.",
    img: "home-office",
  },
] as const;

/** Conceptual client journey. Not the firm's official procedure: stated on the page. */
export const steps = [
  { n: "01", title: "Escuta", text: "Uma conversa sobre rotina, gostos, memórias e orçamento. É daqui que sai o programa do projeto." },
  { n: "02", title: "Estudo", text: "Planta, fluxos e a luz de cada ambiente ao longo do dia." },
  { n: "03", title: "Projeto em 3D", text: "O espaço ganha volume, mobiliário e escala antes de qualquer obra." },
  { n: "04", title: "Materiais e cor", text: "Madeira, pedra, tecidos e iluminação definidos para viver bem ali." },
] as const;
