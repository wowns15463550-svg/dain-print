import { useEffect, useRef, useState } from "react";
import { CHECKS, CONTACT, EQUIPMENT, FAQ, MAIL_TEMPLATE, NOTICES, PAPERS, SERVICES, STEPS } from "./site-data";

const HERO_SLIDES = [
  { src: "assets/hero-presses-r.webp", w: 964, pos: "18% 62%", alt: "코니카미놀타 AccurioPress C14000과 캐논 varioPRINT 115" },
  { src: "assets/h-output.webp", w: 1344, pos: "40% 50%", alt: "C14000 배출부에 쌓인 컬러 인쇄물" },
  { src: "assets/h-binder.webp", w: 1344, pos: "30% 50%", alt: "호리존 무선제본기" },
  { src: "assets/h-cutter.webp", w: 1344, pos: "45% 50%", alt: "호리존 재단기로 교재를 재단하는 모습" },
  { src: "assets/h-handover.webp", w: 1344, pos: "62% 40%", alt: "완성된 교재를 고객에게 건네는 모습" },
];
const SLIDE_MS = 5500;

const NAV = [
  ["#notice", "공지사항"],
  ["#service", "인쇄 · 제본"],
  ["#equipment", "장비"],
  ["#process", "작업 과정"],
  ["#order", "주문 방법"],
  ["#visit", "오시는 길"],
] as const;

function Arrow() {
  return (
    <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true">
      <path d="M0 5h14.5M10.5 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
function Phone() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.6 3.5h3l1.7 4.3-2.2 1.4a11 11 0 0 0 5.7 5.7l1.4-2.2 4.3 1.7v3A1.9 1.9 0 0 1 18.6 19 15.5 15.5 0 0 1 4.6 5.4 1.9 1.9 0 0 1 6.6 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function Mark() {
  return (
    <a href="#top" className="mark" aria-label="다인인쇄소 처음으로">
      <b>DAIN PRINT</b>
      <span>다인인쇄소</span>
    </a>
  );
}

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (key: string, text: string) => {
    const ok = () => {
      setCopied(key);
      window.setTimeout(() => setCopied(null), 1800);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(ok, () => window.prompt("복사해서 사용하세요", text));
    } else {
      window.prompt("복사해서 사용하세요", text);
    }
  };
  return { copied, copy };
}

export default function App() {
  const [menu, setMenu] = useState(false);
  const [slide, setSlide] = useState(0);
  const [solid, setSolid] = useState(false);
  const [svc, setSvc] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const { copied, copy } = useCopy();
  const tel = CONTACT.phone.replace(/-/g, "");

  // hero slideshow; restarts its timer whenever the slide changes (auto or by dot)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setSlide((n) => (n + 1) % HERO_SLIDES.length), SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [slide]);

  // header turns solid once the hero leaves; sections lift in on entry
  useEffect(() => {
    const root = document.documentElement;
    const hero = heroRef.current;
    const ho = new IntersectionObserver(([e]) => setSolid(!e.isIntersecting), { rootMargin: "-80px 0px 0px 0px" });
    if (hero) ho.observe(hero);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => ho.disconnect();
    root.classList.add("js");
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    document.querySelectorAll(".rv").forEach((el) => io.observe(el));
    return () => {
      ho.disconnect();
      io.disconnect();
      root.classList.remove("js");
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  return (
    <div className="dn" id="top">
      <header className={solid || menu ? "hdr solid" : "hdr"}>
        <div className="wrap hdr-in">
          <Mark />
          <nav className="nav" aria-label="주요 메뉴">
            {NAV.map(([h, l]) => (
              <a key={h} href={h}>
                {l}
              </a>
            ))}
          </nav>
          <span className="hdr-tel">{CONTACT.phone}</span>
          <a className="btn btn-accent" href="#visit">
            문의하기
          </a>
          <button
            type="button"
            className="menu-btn"
            aria-label={menu ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={menu}
            aria-controls="sheet"
            onClick={() => setMenu((v) => !v)}
          >
            <i />
            <i />
          </button>
        </div>
      </header>
      <nav className="sheet" id="sheet" hidden={!menu} aria-label="모바일 메뉴">
        {NAV.map(([h, l]) => (
          <a key={h} href={h} onClick={() => setMenu(false)}>
            {l}
          </a>
        ))}
        <div className="sheet-foot">
          <a className="btn btn-accent" href={`tel:${tel}`}>
            <Phone /> {CONTACT.phone}
          </a>
          <span>영업시간 {CONTACT.hours}</span>
        </div>
      </nav>

      <main>
        <section className="hero" ref={heroRef} aria-label="다인인쇄소 소개">
          <div className="hero-body">
            <div className="wrap hero-grid">
              <div className="hero-copy">
              <h1 className="serif">
                <span className="ln">
                  <span>서울 충무로,</span>
                </span>
                <span className="ln">
                  <span>
                    <strong>출력과 제본</strong>을 한 번에
                  </span>
                </span>
              </h1>
              <p className="hero-sub">
                최고급 디지털 프레스로 출력하고 그 자리에서 제본까지. 빠르고 정확한 원스톱 인쇄소입니다.
              </p>
              <div className="hero-cta">
                <a className="btn" href="#order">
                  주문 방법 보기
                </a>
                <a className="btn btn-accent" href={`mailto:${CONTACT.email}`}>
                  파일 보내기 <Arrow />
                </a>
              </div>
              <div className="presses">
                <div>
                  <small>컬러</small>
                  <b>AccurioPress C14000</b>
                </div>
                <div>
                  <small>흑백</small>
                  <b>varioPRINT 115</b>
                </div>
              </div>
              </div>
              <div className="hero-img" aria-roledescription="carousel" aria-label="다인인쇄소 장비와 작업 모습">
                {HERO_SLIDES.map((h, i) => (
                  <img
                    key={h.src}
                    className={i === slide ? "on" : undefined}
                    src={h.src}
                    alt={h.alt}
                    style={{ objectPosition: h.pos }}
                    width={h.w}
                    height={752}
                    fetchPriority={i === 0 ? "high" : "low"}
                    loading={i === 0 ? "eager" : "lazy"}
                    aria-hidden={i !== slide}
                  />
                ))}
                <div className="hero-dots">
                  {HERO_SLIDES.map((h, i) => (
                    <button
                      key={h.src}
                      type="button"
                      className={i === slide ? "on" : undefined}
                      aria-label={`${i + 1}번째 사진 보기: ${h.alt}`}
                      aria-current={i === slide}
                      onClick={() => setSlide(i)}
                    >
                      <i />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <nav className="index" aria-label="인쇄 품목">
            <div className="index-row">
              {SERVICES.map((s, i) => (
                <a key={s.name} href="#service" onClick={() => setSvc(i)}>
                  {s.name}
                </a>
              ))}
            </div>
          </nav>
        </section>

        <section className="sec" id="notice">
          <div className="wrap notice">
            <div className="rv">
              <h2 className="serif sec-title">공지사항</h2>
              <p className="sec-lead">휴무, 택배 마감, 작업 안내를 이곳에 먼저 올립니다.</p>
            </div>
            <div className="nl rv">
              {NOTICES.map((n, i) => (
                <details className="ni" key={n.title} open={i === 0}>
                  <summary>
                    <time>{n.date}</time>
                    <span className={n.hot ? "tag hot" : "tag"}>{n.tag}</span>
                    <span className="ni-t">{n.title}</span>
                    <span className="plus" aria-hidden="true" />
                  </summary>
                  <p className="ni-b">{n.body}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="sec svc-sec" id="service">
          <div className="wrap">
            <div className="rv">
              <h2 className="serif sec-title">인쇄 · 제본</h2>
              <p className="sec-lead">출력, 재단, 제본을 한 작업실에서 끝냅니다. 색과 마감을 마지막까지 직접 확인합니다.</p>
            </div>
            <div className="svc">
              <ul className="svc-list">
                {SERVICES.map((s, i) => (
                  <li key={s.name} className={i === svc ? "svc-item on" : "svc-item"} onMouseEnter={() => setSvc(i)}>
                    <button type="button" className="svc-btn" aria-expanded={i === svc} onClick={() => setSvc(i)}>
                      <h3>{s.name}</h3>
                      <span className="spec">{s.spec}</span>
                    </button>
                    <div className="svc-desc">
                      <div>
                        <img className="svc-m" src={s.img} alt={`${s.name} 인쇄물`} loading="lazy" width={896} height={1120} />
                        <p>{s.desc}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="svc-view" aria-hidden="true">
                {SERVICES.map((s, i) => (
                  <img key={s.img} src={s.img} alt="" className={i === svc ? "on" : undefined} loading="lazy" width={896} height={1120} />
                ))}
              </div>
            </div>
            <div className="papers">
              <span className="pt">자주 쓰는 용지</span>
              {PAPERS.map(([n, w]) => (
                <span key={n}>
                  <b>{n}</b>
                  {w}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="sec" id="equipment" aria-labelledby="eq-h">
          <div className="wrap">
            <div className="rv">
              <h2 className="serif sec-title" id="eq-h">
                장비가 좋아야 색이 정확합니다
              </h2>
              <p className="sec-lead">출력부터 재단, 제본까지 바깥에 맡기지 않고 작업실에서 직접 끝냅니다.</p>
            </div>
            <div className="eq-grid">
              {EQUIPMENT.slice(0, 2).map((e) => (
                <article className="eq-card rv" key={e.name}>
                  <figure>
                    <img src={e.img} alt={e.name} loading="lazy" width={1184} height={888} />
                  </figure>
                  <div className="eq-body">
                    <small>{e.k}</small>
                    <h3>{e.name}</h3>
                    <p>{e.sub}</p>
                  </div>
                </article>
              ))}
            </div>
            <p className="eq-note rv">
              <span>
                <b>{EQUIPMENT[2].k}</b>
                {EQUIPMENT[2].name}
              </span>
            </p>
          </div>
        </section>

        <section className="sec proc" id="process">
          <div className="wrap">
            <div className="rv">
              <h2 className="serif sec-title">작업은 이렇게 진행됩니다</h2>
              <p className="sec-lead">파일을 보내주시면 그다음은 저희가 챙깁니다. 단계마다 연락드립니다.</p>
            </div>
            <ol className="steps">
              {STEPS.map((s, i) => (
                <li className="step rv" key={s.t} data-d={i}>
                  <figure className="step-img">
                    <img src={s.img} alt={s.alt} loading="lazy" width={1100} height={825} />
                  </figure>
                  <div className="step-body">
                    <span className="step-n">{i + 1}</span>
                    <h3>{s.t}</h3>
                    <p>{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="sec" id="order">
          <div className="wrap">
            <div className="rv">
              <h2 className="serif sec-title">주문은 메일 한 통이면 됩니다</h2>
              <p className="sec-lead">양식을 복사해서 채운 뒤 파일과 함께 보내주세요. 모르는 칸은 비워두셔도 됩니다.</p>
            </div>
            <div className="order-grid">
              <div className="mail rv">
                <div className="mail-h">
                  <span className="mail-to">
                    <small>받는 사람</small>
                    {CONTACT.email}
                  </span>
                  <span className="mail-acts">
                    <button type="button" className={copied === "mail" ? "mini done" : "mini"} onClick={() => copy("mail", CONTACT.email)}>
                      {copied === "mail" ? "복사됨" : "주소 복사"}
                    </button>
                    <button type="button" className={copied === "tpl" ? "mini done" : "mini"} onClick={() => copy("tpl", MAIL_TEMPLATE)}>
                      {copied === "tpl" ? "복사됨" : "양식 복사"}
                    </button>
                  </span>
                </div>
                <pre>{MAIL_TEMPLATE}</pre>
              </div>
              <div className="rv">
                <ul className="chk">
                  {CHECKS.map((c) => (
                    <li key={c.t}>
                      <b>{c.t}</b>
                      <span>{c.d}</span>
                    </li>
                  ))}
                </ul>
                <p className="fmt">
                  <b>받는 파일</b> PDF 권장, AI, JPG, PNG
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="sec" id="faq">
          <div className="wrap faq">
            <h2 className="serif sec-title rv">자주 묻는 질문</h2>
            <div className="rv">
              {FAQ.map((f) => (
                <details className="qa" key={f.q}>
                  <summary>
                    <span>{f.q}</span>
                    <span className="plus" aria-hidden="true" />
                  </summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="sec visit-sec" id="visit">
          <div className="wrap visit">
            <div className="visit-img rv">
              <img src="assets/studio.webp" alt="밝은 인쇄 작업실의 작업대와 인쇄물" loading="lazy" width={1344} height={752} />
            </div>
            <div className="visit-info rv">
              <h2 className="serif sec-title">오시는 길</h2>
              <dl className="dl">
                <dt>주소</dt>
                <dd>
                  {CONTACT.address}
                  <small>{CONTACT.addressDetail} · 충무로역 7번 출구 3분</small>
                </dd>
                <dt>영업시간</dt>
                <dd>{CONTACT.hours}</dd>
                <dt>전화</dt>
                <dd>
                  {CONTACT.phone}
                  <small>문자도 받습니다</small>
                </dd>
                <dt>메일</dt>
                <dd>{CONTACT.email}</dd>
              </dl>
              <div className="visit-acts">
                <a className="btn" href={CONTACT.mapUrl} target="_blank" rel="noreferrer">
                  네이버 지도
                </a>
                <a className="btn" href={CONTACT.blog} target="_blank" rel="noreferrer">
                  블로그
                </a>
                <a className="btn btn-accent" href={`tel:${tel}`}>
                  <Phone /> 전화하기
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="ftr">
        <div className="wrap">
          <div className="ftr-top">
            <Mark />
            <nav className="ftr-nav" aria-label="하단 메뉴">
              {NAV.map(([h, l]) => (
                <a key={h} href={h}>
                  {l}
                </a>
              ))}
              <a href={CONTACT.blog} target="_blank" rel="noreferrer">
                블로그
              </a>
            </nav>
          </div>
          <div className="ftr-info">
            <span>상호 다인시스템</span>
            <span>사업자등록번호 {CONTACT.bizNo}</span>
            <span>
              {CONTACT.address} {CONTACT.addressDetail}
            </span>
            <span>영업시간 {CONTACT.hours}</span>
            <span>전화 {CONTACT.phone}</span>
            <span>메일 {CONTACT.email}</span>
          </div>
          <p className="ftr-copy">© 2026 다인인쇄소</p>
        </div>
      </footer>

      <a className={solid ? "fab" : "fab away"} href={`tel:${tel}`} hidden={menu}>
        <Phone /> 전화 문의
      </a>
    </div>
  );
}
