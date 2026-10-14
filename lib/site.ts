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
    img: "plant",
    alt: "Estudo 3D: planta em vaso de barro ao lado de uma janela, com sol da tarde na parede.",
  },
  {
    key: "iluminacao",
    title: "Iluminação",
    quote: "Nem toda hora do dia pede a mesma luz.",
    text: "Luz natural bem aproveitada durante o dia e luz quente, em camadas, para a noite. O ambiente muda com as horas, e o projeto acompanha.",
    img: "light",
    alt: "Estudo 3D: janela do piso ao teto com cortina de linho e poltrona estampada em roxo e dourado.",
  },
  {
    key: "memoria",
    title: "Memória afetiva",
    quote: "Cada ambiente guarda um pouco da história de quem vive nele.",
    text: "Os objetos, as cores e as peças que contam a história de quem mora ali ganham lugar de destaque, em vez de ficarem guardados.",
    img: "table",
    alt: "Estudo 3D: mesa de centro em pedra com livros e uma peça de cerâmica escura.",
  },
] as const;

/** Kinds of work shown in the Instagram highlights (no client names). */
export const fields = ["Apartamentos", "Casas", "Quiosques e lojas", "Banheiros", "Espaços de saúde", "Consultoria à distância", "Palestras"];

export const gallery = [
  { img: "hero", title: "Sala de estar", note: "Ripado de madeira, veludo ameixa e a luz da tarde entrando pela lateral.", alt: "Estudo 3D de sala de estar com sofá de veludo ameixa, parede em ripado de madeira e janela do piso ao teto." },
  { img: "dining", title: "Sala de jantar", note: "Parede em tom de ameixa, aparador ripado e mesa redonda para reunir.", alt: "Estudo 3D de sala de jantar com mesa redonda de madeira, cadeiras claras, pendentes e parede ameixa." },
  { img: "bedroom", title: "Quarto", note: "Cabeceira estofada, arandelas de leitura e roupa de cama em linho.", alt: "Estudo 3D de quarto com cabeceira estofada em ameixa, painéis ripados e arandelas." },
  { img: "office", title: "Home office", note: "Estante de piso ao teto, tampo em pedra e a mesa voltada para a janela.", alt: "Estudo 3D de home office com estante de madeira, mesa com tampo de pedra e cadeira de veludo." },
] as const;

export const services = [
  {
    n: "01",
    title: "Projetos de arquitetura personalizados",
    text: "Da construção do zero à reforma: um projeto que traduz a identidade e as necessidades de cada cliente, dentro do orçamento combinado.",
    img: "dining",
  },
  {
    n: "02",
    title: "Consultorias 100% online",
    text: "Orientação especializada para reformas e decoração, para renovar ou aproveitar melhor os espaços que você já tem, de onde estiver.",
    img: "office",
  },
] as const;

/** Conceptual client journey. Not the firm's official procedure: stated on the page. */
export const steps = [
  { n: "01", title: "Escuta", text: "Uma conversa sobre rotina, gostos, memórias e orçamento. É daqui que sai o programa do projeto." },
  { n: "02", title: "Estudo", text: "Planta, fluxos e a luz de cada ambiente ao longo do dia." },
  { n: "03", title: "Projeto em 3D", text: "O espaço ganha volume, mobiliário e escala antes de qualquer obra." },
  { n: "04", title: "Materiais e cor", text: "Madeira, pedra, tecidos e iluminação definidos para viver bem ali." },
] as const;
