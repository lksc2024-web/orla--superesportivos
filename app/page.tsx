import Effects from "@/components/Effects";
import Header from "@/components/Header";
import HeroDepth from "@/components/HeroDepth";
import Maquete from "@/components/Maquete";
import Picture from "@/components/Picture";
import { contact, fields, gallery, largest, pillars, services, whatsappHref } from "@/lib/site";

const manifesto =
  "Uma casa guarda mais do que móveis. Guarda o café sem pressa, a luz da tarde na parede, o canto onde alguém lê. Projetar com *afeto* é começar por essas histórias, e só depois desenhar as paredes.";

function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((w, i) => {
        const accent = w.startsWith("*");
        const clean = w.replaceAll("*", "");
        return (
          <span key={i} className={`w${accent ? " accent" : ""}`}>
            {clean}{" "}
          </span>
        );
      })}
    </>
  );
}

const Arrow = () => <span className="arr" aria-hidden="true">→</span>;

export default function Home() {
  return (
    <>
      <Header />
      <Effects />
      <main id="conteudo">
        {/* ---------- hero ---------- */}
        <section id="inicio" className="hero" aria-label="Apresentação">
          <HeroDepth alt="Estudo 3D de sala de estar: sofá de veludo ameixa, parede em ripado de madeira e luz da tarde entrando por uma janela do piso ao teto." />
          <div className="hero-shade" />
          <div data-hero-copy className="wrap relative z-10 flex h-full flex-col justify-end pb-[calc(48px+env(safe-area-inset-bottom,0px))] md:pb-16">
            <p className="label fade-up mb-6 opacity-90">Arq. Fernanda Moraes · Neuroarquitetura e Interiores</p>
            <h1 className="display max-w-[13ch]">
              <span className="line-mask"><span>Espaços que acolhem.</span></span>
              <span className="line-mask"><span><em>Histórias que permanecem.</em></span></span>
            </h1>
            <div className="fade-up mt-9 flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
              <p className="max-w-[46ch] text-[16.5px] leading-relaxed text-paper/85">
                Projetos pensados a partir de quem vive ali: luz natural, verde por perto e lugar para a memória de cada família. No Rio de Janeiro, presencial e online.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#abordagem" className="btn btn-light">Conheça nossa abordagem <Arrow /></a>
                <a href={whatsappHref} target="_blank" rel="noopener" className="btn btn-ghost">Fale sobre seu projeto</a>
              </div>
            </div>
          </div>
          <p className="absolute bottom-4 right-[var(--gutter)] z-10 hidden text-[11px] tracking-wide text-paper/60 md:block">Estudo conceitual em 3D · imagem ilustrativa</p>
          <div className="absolute bottom-0 left-1/2 z-10 hidden -translate-x-1/2 md:block"><div className="scroll-cue" /></div>
        </section>

        {/* ---------- manifesto ---------- */}
        <section id="abordagem" className="wrap grid gap-10 py-[clamp(96px,14vw,200px)] md:grid-cols-12" aria-labelledby="abordagem-title">
          <div className="md:col-span-3">
            <p className="label text-violet" data-reveal>Arquitetura com afeto</p>
            <p className="display mt-4 max-w-[16ch] text-[1.25rem] italic leading-snug text-mute" data-reveal data-delay="1">Transformando sonhos em projetos com afeto.</p>
            <h2 id="abordagem-title" className="sr-only">Nossa abordagem</h2>
          </div>
          <div className="md:col-span-9">
            <p className="manifesto display text-[clamp(1.85rem,4.1vw,3.65rem)] leading-[1.14]">
              <Words text={manifesto} />
            </p>
            <figure className="mt-14 md:mt-20" data-reveal>
              <blockquote className="display max-w-[28ch] text-[clamp(1.4rem,2.2vw,1.9rem)] leading-snug text-plum">“Antes de projetar espaços, é preciso entender pessoas.”</blockquote>
              <figcaption className="label mt-3 text-mute">Fernanda Moraes, no Instagram</figcaption>
            </figure>
            <div className="mt-12 grid gap-8 border-t border-line pt-8 text-[15.5px] text-mute sm:grid-cols-2">
              <p data-reveal>Cada projeto é tratado como único, respeitando o jeito de viver, o orçamento e o prazo de quem nos procura.</p>
              <p data-reveal data-delay="1">Atendimento presencial na região do Rio de Janeiro e consultorias 100% online, para quem está em qualquer lugar.</p>
            </div>
          </div>
        </section>

        {/* ---------- sticky editorial: neuroarchitecture ---------- */}
        <section className="bg-linen" aria-labelledby="neuro-title" data-pillars>
          <div className="wrap grid gap-10 py-[clamp(80px,10vw,140px)] lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <p className="label text-violet" data-reveal>Neuroarquitetura no dia a dia</p>
              <h2 id="neuro-title" className="display mt-5 text-[clamp(2.2rem,4.2vw,3.9rem)] leading-[1.02]" data-reveal data-delay="1">
                O espaço muda <em>como a gente se sente</em> nele.
              </h2>
              <p className="mt-6 max-w-[44ch] text-mute" data-reveal data-delay="2">
                Fernanda é pós-graduada em neuroarquitetura e aplica esse olhar nos projetos por três caminhos.
              </p>
              <div className="mt-10 lg:mt-[22vh]">
                {pillars.map((p, i) => (
                  <article key={p.key} className="pillar pb-[10vh] lg:min-h-[62vh] lg:pb-0">
                    <div className="bar" />
                    <div className="flex items-baseline gap-4 pt-6">
                      <span className="label text-mute">0{i + 1}</span>
                      <h3 className="display text-[clamp(1.8rem,2.8vw,2.5rem)] leading-tight">{p.title}</h3>
                    </div>
                    <p className="display mt-4 pl-[38px] text-[1.2rem] italic text-plum">“{p.quote}”</p>
                    <p className="mt-2 max-w-[42ch] pl-[38px] text-[16.5px]">{p.text}</p>
                    <div className="pframe mt-6 aspect-[4/5] lg:hidden">
                      <Picture name={p.img} alt={p.alt} sizes="100vw" className="!static !h-full" />
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="hidden lg:col-span-7 lg:block">
              <div className="sticky top-[calc(var(--header-h)+28px)] h-[calc(100vh-var(--header-h)-56px)]">
                <div className="pillar-media h-full">
                  {pillars.map((p) => (
                    <figure key={p.key}>
                      <Picture name={p.img} alt={p.alt} sizes="(min-width:1024px) 58vw, 100vw" />
                    </figure>
                  ))}
                </div>
                <p className="mt-3 text-right text-[11.5px] text-mute">Estudos conceituais em 3D, ilustrativos</p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- studies (portfolio) ---------- */}
        <section id="estudos" className="wrap py-[clamp(96px,12vw,180px)]" aria-labelledby="estudos-title">
          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="label text-violet" data-reveal>Estudos de ambiente</p>
              <h2 id="estudos-title" className="display mt-5 text-[clamp(2.4rem,5vw,4.6rem)] leading-[1]" data-reveal data-delay="1">
                Materiais nobres, <em>luz que entra</em> e cor com intenção.
              </h2>
            </div>
            <p className="max-w-[46ch] text-[14.5px] leading-relaxed text-mute md:col-span-5" data-reveal data-delay="2">
              As imagens desta prévia são estudos conceituais criados em 3D para ilustrar a proposta visual. Não são projetos executados pela FM Arquitetura. Na versão final, esta galeria recebe os projetos reais do escritório.
            </p>
          </div>

          <div className="mt-16 grid gap-x-6 gap-y-16 md:mt-24 md:grid-cols-12 md:gap-y-28">
            {gallery.map((g, i) => {
              const layout = [
                "md:col-span-8",
                "md:col-span-4 md:col-start-9 md:mt-[38%]",
                "md:col-span-5 md:col-start-2",
                "md:col-span-6 md:col-start-7 md:-mt-[10%]",
              ][i];
              const ratio = ["aspect-[16/10]", "aspect-[4/5]", "aspect-[4/5]", "aspect-[16/11]"][i];
              return (
                <figure key={g.img + i} className={`study m-0 ${layout}`}>
                  <div className={`pframe ${ratio}`} data-reveal="clip">
                    <Picture name={g.img} alt={g.alt} sizes={i === 0 ? "(min-width:768px) 66vw, 100vw" : "(min-width:768px) 45vw, 100vw"} parallax />
                    <span className="sr-only">Estudo conceitual ilustrativo</span>
                  </div>
                  <figcaption className="mt-4 flex items-baseline justify-between gap-6 border-b border-line pb-4" data-reveal>
                    <span>
                      <span className="display text-[1.45rem]">{g.title}</span>
                      <span className="mt-1 block max-w-[48ch] text-[14px] text-mute">{g.note}</span>
                    </span>
                    <span className="label shrink-0 text-[10px] text-mute">Estudo 3D</span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </section>

        {/* ---------- services ---------- */}
        <section id="servicos" className="bg-ink py-[clamp(96px,12vw,170px)] text-paper" aria-labelledby="servicos-title">
          <div className="wrap">
            <div className="grid gap-8 md:grid-cols-12">
              <p className="label text-[#c9a8c2] md:col-span-3" data-reveal>Serviços</p>
              <h2 id="servicos-title" className="display text-[clamp(2.3rem,4.6vw,4.2rem)] leading-[1.02] md:col-span-9" data-reveal data-delay="1">
                Do projeto completo à <em>consultoria online</em>, sob medida para você.
              </h2>
            </div>
            <div className="mt-16 md:mt-24 [&_.svc]:border-paper/15">
              {services.map((s) => (
                <a key={s.n} href={whatsappHref} target="_blank" rel="noopener" className="svc group grid gap-4 py-10 no-underline md:grid-cols-12 md:py-14" data-svc={largest(s.img)} data-reveal>
                  <span className="label text-paper/50 md:col-span-1 md:pt-4">{s.n}</span>
                  <span className="t display text-[clamp(1.9rem,3.6vw,3.3rem)] leading-[1.05] md:col-span-6">{s.title}</span>
                  <span className="flex flex-col gap-5 text-[16px] text-paper/70 md:col-span-5 md:pt-3">
                    {s.text}
                    <span className="inline-flex items-center gap-2 text-[14px] text-paper">
                      <span className="ulink">Conversar sobre isso</span>
                      <span className="transition-transform duration-500 group-hover:translate-x-1" aria-hidden="true">→</span>
                    </span>
                  </span>
                </a>
              ))}
            </div>
            <div className="mt-14 grid gap-6 md:grid-cols-12" data-reveal>
              <p className="label text-paper/50 md:col-span-3">Onde a FM atua</p>
              <ul className="flex flex-wrap gap-x-8 gap-y-3 md:col-span-9">
                {fields.map((f) => (
                  <li key={f} className="display text-[1.35rem] text-paper/85">{f}</li>
                ))}
              </ul>
            </div>
            <p className="mt-10 text-[13.5px] text-paper/55" data-reveal>Atendimento presencial no Rio de Janeiro e consultoria online, como mostram os destaques do Instagram.</p>
          </div>
          <div className="svc-peek" aria-hidden="true"><img alt="" src={largest("dining")} /></div>
        </section>

        {/* ---------- method (3D study model) ---------- */}
        <Maquete />

        {/* ---------- about ---------- */}
        <section id="sobre" className="wrap grid gap-12 py-[clamp(96px,12vw,180px)] md:grid-cols-12" aria-labelledby="sobre-title">
          <div className="md:col-span-5">
            <div className="relative pb-[18%] md:pb-[22%]">
              <div className="pframe aspect-[4/5] w-[78%]" data-reveal="clip">
                <Picture name="light" alt="Estudo 3D: luz natural atravessando uma cortina de linho sobre uma poltrona estampada." sizes="(min-width:768px) 32vw, 78vw" parallax />
              </div>
              <figure className="absolute bottom-0 right-0 m-0 w-[52%] bg-paper p-2.5 shadow-[0_24px_60px_-28px_rgba(36,33,31,.45)]" data-reveal data-delay="2">
                <img src="/img/fernanda-710.webp" srcSet="/img/fernanda-355.webp 355w, /img/fernanda-710.webp 710w" sizes="(min-width:768px) 22vw, 52vw" alt="Fernanda Moraes sorrindo, segurando amostras de pedra." width={710} height={710} loading="lazy" decoding="async" className="aspect-square w-full object-cover" />
                <figcaption className="px-1 pt-2 text-[11px] leading-snug text-mute">Fernanda Moraes. Foto do Instagram, provisória.</figcaption>
              </figure>
            </div>
          </div>
          <div className="md:col-span-6 md:col-start-7 md:pt-[8%]">
            <p className="label text-violet" data-reveal>Sobre</p>
            <h2 id="sobre-title" className="display mt-5 text-[clamp(2.6rem,5vw,4.6rem)] leading-[0.98]" data-reveal data-delay="1">Fernanda Moraes</h2>
            <p className="display mt-3 text-[1.35rem] italic text-mute" data-reveal data-delay="2">Arquiteta e urbanista</p>
            <div className="mt-10 grid gap-6 text-[16.5px]" data-reveal>
              <p>
                Formada em Arquitetura e Urbanismo pela Universidade Federal Rural do Rio de Janeiro (UFRRJ), com pós-graduação em neuroarquitetura e especialização em projetos de interiores.
              </p>
              <p className="text-mute">
                À frente da FM Arquitetura e Interiores, trabalha para que cada projeto transmita a essência de quem vai viver nele, com atenção ao prazo e ao orçamento combinados. Também leva a neuroarquitetura para palestras.
              </p>
            </div>
            <blockquote className="mt-12 border-l border-plum pl-6" data-reveal>
              <p className="display text-[clamp(1.6rem,2.6vw,2.2rem)] leading-snug">“Projetar com qualidade, zelo e verdade.”</p>
              <footer className="label mt-3 text-mute">Do site da FM Arquitetura</footer>
            </blockquote>
            <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-line pt-8 text-[14.5px]" data-reveal>
              <div><dt className="label text-mute">Formação</dt><dd className="mt-2">UFRRJ</dd></div>
              <div><dt className="label text-mute">Pós-graduação</dt><dd className="mt-2">Neuroarquitetura</dd></div>
              <div><dt className="label text-mute">Especialização</dt><dd className="mt-2">Projetos de interiores</dd></div>
              <div><dt className="label text-mute">Atuação</dt><dd className="mt-2">Rio de Janeiro e online</dd></div>
            </dl>
          </div>
        </section>

        {/* ---------- contact ---------- */}
        <section id="contato" className="contact relative overflow-hidden" aria-labelledby="contato-title">
          <div className="wrap grid gap-12 py-[clamp(96px,12vw,170px)] md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="label text-paper/60" data-reveal>Contato</p>
              <h2 id="contato-title" className="display mt-5 text-[clamp(2.6rem,6vw,5.6rem)] leading-[0.98]" data-reveal data-delay="1">
                Vamos conversar sobre <em>o seu espaço?</em>
              </h2>
              <div className="mt-12 flex flex-wrap gap-3" data-reveal data-delay="2">
                <a href={whatsappHref} target="_blank" rel="noopener" className="btn btn-light">Chamar no WhatsApp <Arrow /></a>
                <a href={contact.instagramUrl} target="_blank" rel="noopener" className="btn btn-ghost">Ver o Instagram</a>
              </div>
            </div>
            <address className="grid content-end gap-8 not-italic md:col-span-4 md:col-start-9" data-reveal>
              <div><p className="label text-paper/55">WhatsApp</p><a href={whatsappHref} target="_blank" rel="noopener" className="ulink display mt-2 inline-block text-[1.7rem]">{contact.whatsappDisplay}</a></div>
              <div><p className="label text-paper/55">Instagram</p><a href={contact.instagramUrl} target="_blank" rel="noopener" className="ulink mt-2 inline-block text-[1.05rem]">{contact.instagramHandle}</a></div>
              <div><p className="label text-paper/55">Atendimento</p><p className="mt-2 text-[1.05rem]">Presencial no Rio de Janeiro e online</p></div>
            </address>
          </div>
        </section>
      </main>

      <footer className="bg-ink py-12 text-paper/65">
        <div className="wrap grid gap-8 text-[12.5px] leading-relaxed md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="display text-[1.5rem] italic text-paper">FM</p>
            <p className="mt-1">FM Arquitetura e Interiores · Arq. Fernanda Moraes</p>
          </div>
          <div className="grid gap-3 md:col-span-8">
            <p>
              <strong className="font-medium text-paper">Prévia conceitual, não oficial.</strong> Desenvolvida para apresentação de proposta e sujeita à aprovação da FM Arquitetura e Interiores. Os textos usam informações públicas do Instagram e do site oficial (<a className="ulink" href={contact.officialSite} target="_blank" rel="noopener">fmarquiteta.com.br</a>).
            </p>
            <p>
              Imagens: estudos conceituais renderizados em 3D para esta prévia; não retratam obras ou clientes reais. Retrato da Fernanda e frases citadas: perfil @arq.fernandamoraes no Instagram. Mobiliário 3D: Glam Velvet Sofa, Chair Damask Purplegold e Anisotropy Barn Lamp © Wayfair (CC BY 4.0), Sheen Chair © Wayfair (CC0), Diffuse Transmission Plant © Darmstadt Graphics Group (CC BY 4.0), via Khronos glTF Sample Assets.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
