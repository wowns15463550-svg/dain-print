import { useEffect, useRef, useState } from "react";
import { CHECKS, CONTACT, EQUIPMENT, FAQ, FINISHING, MAIL_TEMPLATE, NOTICES, ORDER_NOTES, PAPER_GUIDE, SERVICES, STEPS } from "./site-data";

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
function Ico({ k }: { k: "talk" | "blog" | "insta" | "mail" | "pin" | "up" | "close" | "cloud" }) {
  const p = { stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      {k === "talk" && <path {...p} d="M12 4.5c4.7 0 8.5 3 8.5 6.7s-3.8 6.7-8.5 6.7c-.8 0-1.6-.1-2.3-.3L5.5 20l.9-3.6c-1.8-1.2-2.9-3-2.9-5.2 0-3.7 3.8-6.7 8.5-6.7Z" />}
      {k === "blog" && (
        <>
          <path {...p} d="M5 4.5h10l4 4v11H5z" />
          <path {...p} d="M8.5 11h7M8.5 14.5h7M8.5 7.5h4" />
        </>
      )}
      {k === "insta" && (
        <>
          <rect {...p} x="4" y="4" width="16" height="16" rx="4.5" />
          <circle {...p} cx="12" cy="12" r="3.6" />
          <circle cx="16.6" cy="7.4" r="1" fill="currentColor" />
        </>
      )}
      {k === "mail" && (
        <>
          <rect {...p} x="3.5" y="5.5" width="17" height="13" rx="1" />
          <path {...p} d="m4 6.5 8 6 8-6" />
        </>
      )}
      {k === "pin" && (
        <>
          <path {...p} d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
          <circle {...p} cx="12" cy="10" r="2.3" />
        </>
      )}
      {k === "cloud" && (
        <>
          <path {...p} d="M7 18.5h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.6 4.5 4.5 0 0 0 7 18.5Z" />
          <path {...p} d="M12 15.5v-5M9.8 12.5 12 10.3l2.2 2.2" />
        </>
      )}
      {k === "up" && <path {...p} d="M12 19V5M6 11l6-6 6 6" />}
      {k === "close" && <path {...p} d="M6 6l12 12M18 6 6 18" />}
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
  const [paperOpen, setPaperOpen] = useState<number | null>(null);
  const [checkOpen, setCheckOpen] = useState<number | null>(null);
  const [solid, setSolid] = useState(false);
  const [svc, setSvc] = useState(0);
  const [visit, setVisit] = useState(false);
  const stepsRef = useRef<HTMLOListElement>(null);
  const [stepAnim, setStepAnim] = useState(false);
  const [stepOn, setStepOn] = useState(-1);
  const visitClose = useRef<HTMLButtonElement>(null);
  const visitFrom = useRef<HTMLElement | null>(null);
  const openVisit = (e?: { preventDefault(): void }) => {
    e?.preventDefault();
    visitFrom.current = document.activeElement as HTMLElement | null;
    setMenu(false);
    setVisit(true);
  };
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

  // 작업 과정: 화면에 들어오면 1번부터 하나씩 올라오고, 지금 나온 단계만 파란색
  useEffect(() => {
    const el = stepsRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStepOn(STEPS.length - 1);
      return;
    }
    setStepAnim(true);
    const timers: number[] = [];
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        STEPS.forEach((_, i) => timers.push(window.setTimeout(() => setStepOn(i), 350 + i * 700)));
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  // 오시는 길 modal: lock scroll, Esc closes, focus moves in and returns
  useEffect(() => {
    if (!visit) return;
    document.body.style.overflow = "hidden";
    visitClose.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setVisit(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      visitFrom.current?.focus?.();
    };
  }, [visit]);

  return (
    <div className="dn" id="top">
      <header className={solid || menu ? "hdr solid" : "hdr"}>
        <div className="wrap hdr-in">
          <Mark />
          <nav className="nav" aria-label="주요 메뉴">
            {NAV.map(([h, l]) => (
              <a key={h} href={h} onClick={h === "#visit" ? openVisit : undefined}>
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
          <a key={h} href={h} onClick={h === "#visit" ? openVisit : () => setMenu(false)}>
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
                <a className="btn btn-accent" href={CONTACT.mailWrite} target="_blank" rel="noreferrer">
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
            <div className="paper">
              <div className="paper-head rv">
                <h3 className="serif">자주 쓰는 종이</h3>
                <p>
                  여기 없는 종이도 가능합니다. 다른 종이는{" "}
                  <a href={CONTACT.mailWrite} target="_blank" rel="noreferrer">
                    메일로 문의
                  </a>
                  해 주세요.
                </p>
              </div>
              <div className="paper-grid">
                {PAPER_GUIDE.map((pp, i) => (
                  <article className={paperOpen === i ? "pc rv open" : "pc rv"} key={pp.name} data-d={i}>
                    <button
                      type="button"
                      className="pc-img"
                      aria-pressed={paperOpen === i}
                      aria-label={`${pp.name} 종이가 쓰이는 모습 보기`}
                      onClick={() => setPaperOpen((v) => (v === i ? null : i))}
                    >
                      <img src={pp.img} alt={`${pp.name} 종이 질감`} loading="lazy" width={1168} height={880} />
                      <img className="pc-use" src={pp.use} alt={`${pp.name} 종이로 만든 ${pp.useLabel}`} loading="lazy" width={1168} height={880} />
                      <span className="pc-cap">{pp.useLabel}</span>
                    </button>
                    <div className="pc-body">
                      <div className="pc-top">
                        <h4>{pp.name}</h4>
                        <span>{pp.finish}</span>
                      </div>
                      <p>{pp.desc}</p>
                      <dl>
                        {pp.rows.map(([w, u]) => (
                          <div key={w}>
                            <dt>{w}</dt>
                            <dd>{u}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </article>
                ))}
              </div>
              <p className="paper-note">※ 종이 사진은 이해를 돕기 위한 참고 이미지입니다. 실제 종이의 색과 질감은 다르게 보일 수 있습니다.</p>
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
              {EQUIPMENT.map((e) => (
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
            <div className="eq-sub-head rv">
              <h3>후가공 장비</h3>
              <p>재단, 제본, 코팅까지 작업실 안에서 바로 이어집니다.</p>
            </div>
            <div className="eq-sub">
              {FINISHING.map((e) => (
                <article className="eq-card eq-mini rv" key={e.name}>
                  <figure>
                    <img src={e.img} alt={e.name} loading="lazy" width={900} height={675} />
                  </figure>
                  <div className="eq-body">
                    <small>{e.k}</small>
                    <h3>{e.name}</h3>
                    <p>{e.sub}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="sec proc" id="process">
          <div className="wrap">
            <div className="rv rv-soft">
              <h2 className="serif sec-title">작업은 이렇게 진행됩니다</h2>
              <p className="sec-lead">파일을 보내주시면 그다음은 저희가 챙깁니다. 단계마다 연락드립니다.</p>
            </div>
            <ol className={stepAnim ? "steps anim" : "steps"} ref={stepsRef}>
              {STEPS.map((s, i) => (
                <li className={"step" + (i <= stepOn ? " on" : "") + (i === stepOn ? " cur" : "")} key={s.t}>
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
              <h2 className="serif sec-title">
                주문은 <strong>메일</strong> 한{"\u00a0"}통이면 됩니다
              </h2>
              <p className="sec-lead">양식을 복사해서 채운 뒤 파일과 함께 보내주세요. 모르는 칸은 비워두셔도 됩니다.</p>
            </div>
            <div className="order-grid">
              <div className="order-l">
                <div className="mail rv">
                  <div className="mail-h">
                    <span className="mail-to">
                      <small>받는 사람</small>
                      {CONTACT.email}
                    </span>
                    <span className="mail-acts">
                      <a className="mini mini-accent" href={CONTACT.mailWrite} target="_blank" rel="noreferrer">
                        메일 쓰기
                      </a>
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
              <div className="notes rv">
                <h3>주문 전에 꼭 읽어주세요</h3>
                <ol>
                  {ORDER_NOTES.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ol>
              </div>
              </div>
              <div className="rv">
                <ul className="chk">
                  <li>
                    <b>받는 파일</b>
                    <span>PDF 권장. AI, JPG, PNG도 받습니다.</span>
                  </li>
                  <li>
                    <b>보내기 전에</b>
                    <span>재단 여백과 해상도 등 여섯 가지만 확인해 주세요.</span>
                  </li>
                  <li>
                    <b>급한 작업</b>
                    <span>
                      전화나 문자({CONTACT.phone})로 먼저 알려주세요.
                    </span>
                  </li>
                </ul>
                <div className="wh" id="webhard">
                  <div className="wh-h">
                    <Ico k="cloud" />
                    <b>용량이 큰 파일은 웹하드로</b>
                  </div>
                  <dl>
                    <dt>아이디</dt>
                    <dd>
                      {CONTACT.webhardId}
                      <button type="button" className={copied === "whid" ? "mini done" : "mini"} onClick={() => copy("whid", CONTACT.webhardId)}>
                        {copied === "whid" ? "복사됨" : "복사"}
                      </button>
                    </dd>
                    <dt>비밀번호</dt>
                    <dd>
                      {CONTACT.webhardPw}
                      <button type="button" className={copied === "whpw" ? "mini done" : "mini"} onClick={() => copy("whpw", CONTACT.webhardPw)}>
                        {copied === "whpw" ? "복사됨" : "복사"}
                      </button>
                    </dd>
                    <dt>올릴 폴더</dt>
                    <dd>
                      <span className="wh-folder">{CONTACT.webhardFolder}</span>
                    </dd>
                  </dl>
                  <p>올리신 뒤 메일이나 문자로 성함과 파일 이름을 알려주세요.</p>
                  <a className="btn btn-accent" href={CONTACT.webhard} target="_blank" rel="noreferrer">
                    웹하드 열기 <Arrow />
                  </a>
                </div>
                <a className="link-line fmt" href="#check">
                  인쇄 전 확인 사항 보기 <Arrow />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="sec chk-sec" id="check">
          <div className="wrap">
            <div className="rv">
              <h2 className="serif sec-title">인쇄 전 꼭 확인하세요</h2>
              <p className="sec-lead">디자인 파일은 직접 준비해 주셔야 해요. 카드에 마우스를 올리거나 누르면 자세한 설명이 나옵니다.</p>
            </div>
            <div className="ck-grid">
              {CHECKS.map((c, i) => (
                <button
                  type="button"
                  key={c.t}
                  className={checkOpen === i ? "ck rv open" : "ck rv"}
                  data-d={i % 3}
                  aria-expanded={checkOpen === i}
                  onClick={() => setCheckOpen((v) => (v === i ? null : i))}
                >
                  <span className="ck-img">
                    <img src={c.img} alt="" loading="lazy" width={1168} height={880} />
                    <span className="ck-detail">{c.d}</span>
                  </span>
                  <span className="ck-body">
                    <small>CHECK {String(i + 1).padStart(2, "0")}</small>
                    <b>{c.t}</b>
                    <span>{c.s}</span>
                  </span>
                </button>
              ))}
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
                  <small>{CONTACT.addressDetail} · {CONTACT.subway}</small>
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
                <dt>카카오톡</dt>
                <dd>
                  채널 {CONTACT.kakaoId}
                  <small>카카오톡에서 '{CONTACT.kakaoId}' 검색</small>
                </dd>
              </dl>
              <div className="visit-acts">
                <button type="button" className="btn" onClick={() => openVisit()}>
                  <Ico k="pin" /> 지도 보기
                </button>
                <a className="btn" href={CONTACT.kakao} target="_blank" rel="noreferrer">
                  카카오톡 상담
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
              <a href={CONTACT.insta} target="_blank" rel="noreferrer">
                인스타그램
              </a>
              <a href={CONTACT.kakao} target="_blank" rel="noreferrer">
                카카오톡 채널
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

      <nav className={solid ? "qm" : "qm top"} aria-label="빠른 문의" hidden={menu || visit}>
        <a className="qm-i qm-kakao" href={CONTACT.kakao} target="_blank" rel="noreferrer">
          <Ico k="talk" />
          <span>카톡상담</span>
        </a>
        <a className="qm-i qm-tel" href={`tel:${tel}`}>
          <Phone />
          <span>전화</span>
        </a>
        <a className="qm-i qm-mail" href={CONTACT.mailWrite} target="_blank" rel="noreferrer">
          <Ico k="mail" />
          <span>메일</span>
        </a>
        <a className="qm-i qm-wh" href="#webhard">
          <Ico k="cloud" />
          <span>웹하드</span>
        </a>
        <a className="qm-i qm-map" href="#visit" onClick={openVisit}>
          <Ico k="pin" />
          <span>오시는 길</span>
        </a>
        <a className="qm-i qm-blog" href={CONTACT.blog} target="_blank" rel="noreferrer">
          <Ico k="blog" />
          <span>블로그</span>
        </a>
        <a className="qm-i qm-insta" href={CONTACT.insta} target="_blank" rel="noreferrer">
          <Ico k="insta" />
          <span>인스타</span>
        </a>
        <a className="qm-i qm-up" href="#top" aria-label="맨 위로">
          <Ico k="up" />
        </a>
      </nav>

      {visit && (
        <div className="vm" onClick={(e) => e.target === e.currentTarget && setVisit(false)}>
          <div className="vm-box" role="dialog" aria-modal="true" aria-labelledby="vm-h">
            <button type="button" className="vm-x" ref={visitClose} onClick={() => setVisit(false)} aria-label="닫기">
              <Ico k="close" />
            </button>
            <div className="vm-map">
              <iframe
                title="다인인쇄소 위치 지도"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(CONTACT.address)}&z=17&hl=ko&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="vm-info">
              <small>VISIT</small>
              <h2 className="serif" id="vm-h">
                오시는 길
              </h2>
              <dl className="dl">
                <dt>주소</dt>
                <dd>
                  {CONTACT.address}
                  <small>{CONTACT.addressDetail}</small>
                </dd>
                <dt>지하철</dt>
                <dd>{CONTACT.subway}</dd>
                <dt>영업시간</dt>
                <dd>{CONTACT.hours}</dd>
                <dt>전화</dt>
                <dd>
                  <a href={`tel:${tel}`}>{CONTACT.phone}</a>
                  <small>문자도 받습니다</small>
                </dd>
                <dt>카카오톡</dt>
                <dd>
                  채널 {CONTACT.kakaoId}
                </dd>
              </dl>
              <div className="vm-acts">
                <a className="btn" href={CONTACT.mapUrl} target="_blank" rel="noreferrer">
                  네이버 지도 <Arrow />
                </a>
                <a className="btn btn-accent" href={`tel:${tel}`}>
                  <Phone /> 전화하기
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
