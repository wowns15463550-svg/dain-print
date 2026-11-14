import { useEffect, useRef, useState } from "react";
import { SERVICE_PAGES } from "./service-pages";
import BLOG from "./blog-data.json";
import { CHECKS, CONTACT, EQUIPMENT, EVENTS, FAQ, FINISHING, GALLERY, MAIL_TEMPLATE, NOTICES, ORDER_NOTES, PAPER_GUIDE, SERVICES, STEPS } from "./site-data";


// 사장님이 직접 찍은 실제 매장 사진 (전화번호 지움, 사람 흐림 처리)
const SHOP_PHOTOS = [
  { src: "assets/shop-front.webp", w: 960, h: 1280, cap: "매장 외관 · 마른내로4길 27", alt: "다인인쇄소(다인시스템) 충무로 매장 외관 — 서울 중구 마른내로4길 27, 파란 다인시스템 간판" },
  { src: "assets/shop-inside.webp", w: 1200, h: 1265, cap: "작업실 · 코니카미놀타 C14000과 제본기", alt: "다인인쇄소(다인시스템) 작업실 내부 — 코니카미놀타 AccurioPress C14000과 호리존 무선제본기" },
  { src: "assets/shop-books.webp", w: 960, h: 960, cap: "제본을 마치고 나가는 책", alt: "다인인쇄소(다인시스템)에서 무선제본을 마친 책 묶음" },
];

type Ev = (typeof EVENTS)[number];
function EvCard({ e, hidden, label }: { e: Ev; hidden?: boolean; label?: string }) {
  return (
    <article className={`ev-card ev-${e.theme}`} aria-hidden={hidden} aria-label={label}>
      <img src={e.img} alt="" loading="lazy" width={800} height={800} />
      <div className="ev-text">
        <small>
          {e.no} <span>{e.tag}</span>
        </small>
        <h3>
          {e.title[0]}
          <br />
          <strong>{e.title[1]}</strong>
        </h3>
        <p>{e.sub}</p>
        {"link" in e && e.link && (
          <a className="ev-link" href={e.link} target="_blank" rel="noreferrer" tabIndex={hidden ? -1 : undefined}>
            {e.linkText} <Arrow />
          </a>
        )}
      </div>
    </article>
  );
}

declare global {
  interface Window { kakao?: any }
}

// 오시는 길 지도. 카카오 키가 있으면 카카오맵, 없으면 구글 지도.
function VisitMap() {
  const box = useRef<HTMLDivElement>(null);
  const key = CONTACT.kakaoMapKey;
  useEffect(() => {
    if (!key || !box.current) return;
    const el = box.current;
    const draw = () => {
      const k = window.kakao;
      k.maps.load(() => {
        new k.maps.services.Geocoder().addressSearch(CONTACT.address, (r: any[], st: string) => {
          if (st !== k.maps.services.Status.OK) return;
          const pos = new k.maps.LatLng(r[0].y, r[0].x);
          el.innerHTML = "";
          const map = new k.maps.Map(el, { center: pos, level: 3 });
          map.addControl(new k.maps.ZoomControl(), k.maps.ControlPosition.RIGHT);
          new k.maps.Marker({ map, position: pos });
          const tag = document.createElement("div");
          tag.className = "map-tag";
          tag.textContent = "다인인쇄소";
          new k.maps.CustomOverlay({ map, position: pos, content: tag, yAnchor: 2.6 });
        });
      });
    };
    if (window.kakao?.maps) return draw();
    const sc = document.createElement("script");
    sc.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false&libraries=services`;
    sc.onload = draw;
    document.head.appendChild(sc);
  }, [key]);
  return (
    <div className="map-box" ref={box}>
      {!key && (
        <iframe
          title="다인인쇄소 위치 지도"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(CONTACT.address)}&z=17&hl=ko&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
    </div>
  );
}

const NAV = [
  ["#notice", "공지사항"],
  ["#service", "인쇄 · 제본"],
  ["#gallery", "갤러리"],
  ["#equipment", "장비"],
  ["#process", "작업 과정"],
  ["#order", "주문 방법"],
  ["#visit", "오시는 길"],
] as const;

export function Arrow() {
  return (
    <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true">
      <path d="M0 5h14.5M10.5 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
export function Phone() {
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
export function Ico({ k }: { k: "talk" | "blog" | "insta" | "mail" | "pin" | "up" | "close" | "cloud" | "bank" | "order" }) {
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
      {k === "bank" && (
        <>
          <path {...p} d="M3.5 9 12 4.5 20.5 9M5 19.5h14M4 9h16" />
          <path {...p} d="M6.5 10v7M10.5 10v7M13.5 10v7M17.5 10v7" />
        </>
      )}
      {k === "order" && <path {...p} d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20V3.5ZM14 3.5v4h4M9.5 12h6M9.5 15.5h6" />}
      {k === "up" && <path {...p} d="M12 19V5M6 11l6-6 6 6" />}
      {k === "close" && <path {...p} d="M6 6l12 12M18 6 6 18" />}
    </svg>
  );
}
export function Mark({ white, href = "#top" }: { white?: boolean; href?: string }) {
  return (
    <a href={href} className="mark" aria-label="다인인쇄소 처음으로">
      <img src={white ? "/assets/logo-dain-white.svg" : "/assets/logo-dain.svg"} alt="다인인쇄소 DAIN PRINT" width={139} height={40} />
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

// 영업 안내 띠 — 오른쪽에서 왼쪽으로 흐름. 늘 "주말·공휴일 휴무"를 알리고, 주말(한국 시간)에 들어오면 "오늘은 휴무일"
function HoursBanner() {
  const [wk, setWk] = useState(false);
  useEffect(() => {
    const d = new Date(Date.now() + 9 * 3600e3).getUTCDay();
    setWk(d === 0 || d === 6);
  }, []);
  return (
    <p className={wk ? "hero-hours off" : "hero-hours"} role="note">
      <i aria-hidden="true" />
      {wk ? "오늘은 휴무일입니다 · 파일은 미리 보내 주세요" : `평일 ${CONTACT.hours} · ${CONTACT.closed}`}
    </p>
  );
}

// 작업 과정 장면: 처음엔 그림, 화면에 들어오면 5초 영상이 한 번 재생되고 마지막 장면에서 멈춤
function StepMedia({ s }: { s: (typeof STEPS)[number] }) {
  const fig = useRef<HTMLElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const [live, setLive] = useState(false);
  useEffect(() => {
    const f = fig.current;
    const v = vid.current;
    if (!f || !v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        v.src = s.vid;
        v.play().then(() => setLive(true)).catch(() => {});
      },
      { threshold: 0.6 },
    );
    io.observe(f);
    return () => io.disconnect();
  }, [s.vid]);
  return (
    <figure className={"step-img" + (live ? " live" : "")} ref={fig}>
      <img src={s.img} alt={s.alt} loading="lazy" width={720} height={720} />
      <video ref={vid} muted playsInline preload="none" aria-hidden="true" tabIndex={-1} />
      <figcaption className="step-say">{s.say}</figcaption>
    </figure>
  );
}

// 첫 화면 영상: 영상 1 → 영상 2 → C14000 사진 → 다시 영상 1 순서로 돈다(겹쳐서 부드럽게 바뀜)
const HERO_CLIPS = [
  { d: "/assets/hero-loop.mp4", m: "/assets/hero-loop-m.mp4", poster: "/assets/hero-loop.webp", label: "인쇄기에서 종이가 빠르게 지나가는 모습" },
  { d: "/assets/hero-loop2.mp4", m: "/assets/hero-loop2-m.mp4", poster: "/assets/hero-loop2.webp", label: "종이가 롤러를 따라 빠르게 이송되는 모습" },
];
const HERO_PHOTO = { src: "/assets/h-output.webp", label: "다인인쇄소의 AccurioPress C14000 출력기" };
// 슬라이드 0~(영상 수-1) = 영상, 마지막 = 사진
function HeroVideo() {
  const [cur, setCur] = useState(0);
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  const still = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => {
    if (still) return;
    if (cur === HERO_CLIPS.length) {
      const stop = window.setTimeout(() => refs.current.forEach((v) => v?.pause()), 900);
      const t = window.setTimeout(() => setCur(0), 4500);
      return () => {
        window.clearTimeout(stop);
        window.clearTimeout(t);
      };
    }
    refs.current.forEach((v, i) => {
      if (!v) return;
      if (i === cur) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else window.setTimeout(() => v.pause(), 900);
    });
  }, [cur, still]);
  return (
    <div className="hero-img">
      <img className={"hero-vid" + (cur === HERO_CLIPS.length ? " on" : "")} src={HERO_PHOTO.src} alt={HERO_PHOTO.label} width={1344} height={752} aria-hidden={cur !== HERO_CLIPS.length} />
      {HERO_CLIPS.map((c, i) => (
        <video
          key={c.d}
          ref={(el) => {
            refs.current[i] = el;
            if (el && still) el.pause();
          }}
          className={"hero-vid" + (i === cur ? " on" : "")}
          autoPlay={i === 0}
          muted
          playsInline
          preload={i === 0 ? "metadata" : "none"}
          poster={c.poster}
          width={1600}
          height={819}
          aria-label={c.label}
          aria-hidden={i !== cur}
          onEnded={() => setCur((n) => (n === i ? n + 1 : n))}
        >
          <source src={c.m} type="video/mp4" media="(max-width: 900px)" />
          <source src={c.d} type="video/mp4" />
        </video>
      ))}
    </div>
  );
}

export default function App() {
  const [menu, setMenu] = useState(false);
  const [paperOpen, setPaperOpen] = useState<number | null>(null);
  const [checkOpen, setCheckOpen] = useState<number | null>(null);
  const [solid, setSolid] = useState(false);
  // 지금 보고 있는 섹션 → 위쪽 메뉴에 표시
  const [here, setHere] = useState("");
  useEffect(() => {
    const ids = ["notice", "service", "equipment", "gallery", "process", "order", "check", "blog", "faq", "visit"];
    const alias: Record<string, string> = { check: "order" };
    let raf = 0;
    const calc = () => {
      raf = 0;
      const line = window.innerHeight * 0.35;
      let cur = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) cur = id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = "visit";
      setHere(alias[cur] ?? cur);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(calc);
    };
    calc();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  const [svc, setSvc] = useState(0);
  const [svcX, setSvcX] = useState(false);
  const [ev, setEv] = useState(0);
  const [evHold, setEvHold] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const evTouch = useRef<number | null>(null);
  const [visit, setVisit] = useState(false);
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);
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

  // header turns solid once the hero leaves; sections lift in on entry
  useEffect(() => {
    const root = document.documentElement;
    const hero = heroRef.current;
    // header turns solid as soon as the page scrolls, so nothing shows through it
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const ho = { disconnect: () => window.removeEventListener("scroll", onScroll) };
    void hero;
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

  // 이벤트 카드: 6초마다 다음 장 (마우스를 올리면 멈춤)
  useEffect(() => {
    if (evHold || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setEv((n) => (n + 1) % EVENTS.length), 6000);
    return () => window.clearTimeout(t);
  }, [ev, evHold]);
  const evGo = (d: number) => setEv((n) => (n + d + EVENTS.length) % EVENTS.length);

  // 장비 사진 크게 보기
  useEffect(() => {
    if (!zoom) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(null);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [zoom]);
  const lens = (e: { currentTarget: HTMLElement; clientX: number; clientY: number }) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--zx", `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty("--zy", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  // 휴대폰에서 종이 · 후가공 목록 접기
  const [paperMore, setPaperMore] = useState(false);
  const [finMore, setFinMore] = useState(false);
  const [faqMore, setFaqMore] = useState(false);

  // HOT EVENT 창
  const [evPop, setEvPop] = useState(false);
  // 입금 계좌 창 (아래 띠 · 오른쪽 띠의 '입금계좌', 다른 페이지에서 /#bank-pop 으로 들어와도 열림)
  const [bankPop, setBankPop] = useState(false);
  useEffect(() => {
    const open = () => {
      if (location.hash === "#bank-pop") {
        setBankPop(true);
        history.replaceState(null, "", location.pathname);
      }
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);
  useEffect(() => {
    if (!bankPop) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setBankPop(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bankPop]);
  const evPopClose = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!evPop) return;
    document.body.style.overflow = "hidden";
    evPopClose.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setEvPop(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [evPop]);

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
              <a key={h} href={h} onClick={h === "#visit" ? openVisit : h === "#notice" ? () => setNoticeOpen(true) : undefined} className={here === h.slice(1) ? "on" : undefined} aria-current={here === h.slice(1) ? "true" : undefined}>
                {l}
              </a>
            ))}
          </nav>
          <span className="hdr-tel">{CONTACT.phone}</span>
          <a className="btn btn-accent" href="/order/">
            주문하기
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
        <div className="sheet-sns">
          <a href={CONTACT.blog} target="_blank" rel="noreferrer">
            <Ico k="blog" /> 블로그
          </a>
          <a href={CONTACT.insta} target="_blank" rel="noreferrer">
            <Ico k="insta" /> 인스타그램
          </a>
          <a href={CONTACT.mailWrite} target="_blank" rel="noreferrer">
            <Ico k="mail" /> 메일 보내기
          </a>
        </div>
        <div className="sheet-foot">
          <a className="btn btn-accent" href={`tel:${tel}`}>
            <Phone /> {CONTACT.phone}
          </a>
          <span>영업시간 {CONTACT.hours} · {CONTACT.closed}</span>
        </div>
      </nav>

      <main>
        <section className="hero" ref={heroRef} aria-label="다인인쇄소 소개">
          <div className="hero-body">
            <div className="wrap hero-grid">
              <div className="hero-copy">
              <HoursBanner />
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
                <span className="sub-ln">
                  최고급 디지털 프레스로 출력하고 <span className="nw">그 자리에서 제본까지.</span>
                </span>
                <span className="sub-ln">
                  빠르고 정확한 <strong className="onestop">원스톱 인쇄소</strong>입니다.
                </span>
              </p>
              <div className="hero-cta">
                <a className="btn btn-order" href="/order/">
                  간단하게 주문하기 <Arrow />
                </a>
                <a className="btn" href={CONTACT.mailWrite} target="_blank" rel="noreferrer">
                  파일 보내기
                </a>
              </div>
              <dl className="hero-facts">
                <div>
                  <dt>컬러</dt>
                  <dd>AccurioPress C14000</dd>
                </div>
                <div>
                  <dt>흑백</dt>
                  <dd>varioPRINT 115</dd>
                </div>
                <div>
                  <dt>납기</dt>
                  <dd>오전 접수, 보통 오후 5시</dd>
                </div>
                <div>
                  <dt>수량</dt>
                  <dd>1부부터 대량까지</dd>
                </div>
              </dl>
              </div>
              <HeroVideo />
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

        <section className="notice-sec" id="notice" aria-label="공지사항">
          <div className="wrap">
            <div className="nbar">
              <span className="nbar-k">공지</span>
              <button type="button" className="nbar-t" onClick={() => setNoticeOpen((v) => !v)} aria-expanded={noticeOpen} aria-controls="notice-panel">
                <span className={NOTICES[0].hot ? "tag hot" : "tag"}>{NOTICES[0].tag}</span>
                <span className="nbar-title">{NOTICES[0].title}</span>
              </button>
              <button type="button" className={noticeOpen ? "nbar-more open" : "nbar-more"} onClick={() => setNoticeOpen((v) => !v)} aria-expanded={noticeOpen} aria-controls="notice-panel">
                {noticeOpen ? "접기" : "공지 · 이벤트 전체 보기"}
                <i aria-hidden="true" />
              </button>
            </div>
            <div className="notice" id="notice-panel" hidden={!noticeOpen}>
            <div className="ev-col">
              <div
                className="ev"
                aria-roledescription="carousel"
                aria-label="진행 중인 이벤트"
                onMouseEnter={() => setEvHold(true)}
                onMouseLeave={() => setEvHold(false)}
                onTouchStart={(e) => (evTouch.current = e.touches[0].clientX)}
                onTouchEnd={(e) => {
                  if (evTouch.current === null) return;
                  const dx = e.changedTouches[0].clientX - evTouch.current;
                  if (Math.abs(dx) > 40) evGo(dx < 0 ? 1 : -1);
                  evTouch.current = null;
                }}
              >
                <div className="ev-track" style={{ transform: `translateX(-${ev * 100}%)` }}>
                  {EVENTS.map((e, i) => (
                    <EvCard e={e} key={e.no} hidden={i !== ev} label={`${i + 1} / ${EVENTS.length}`} />
                  ))}
                </div>
                <div className="ev-ctrl">
                  <button type="button" onClick={() => evGo(-1)} aria-label="이전 이벤트">
                    ‹
                  </button>
                  <span className="ev-dots">
                    {EVENTS.map((e, i) => (
                      <button type="button" key={e.no} className={i === ev ? "on" : undefined} onClick={() => setEv(i)} aria-label={`${i + 1}번 이벤트`} />
                    ))}
                  </span>
                  <span className="ev-count">
                    {ev + 1} / {EVENTS.length}
                  </span>
                  <button type="button" onClick={() => evGo(1)} aria-label="다음 이벤트">
                    ›
                  </button>
                </div>
              </div>
            </div>
            <div className="nl-col">
              <div className="nl">
              {NOTICES.map((n, i) => (
                <details className="ni" key={n.title}>
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
            </div>
          </div>
        </section>

        <section className="sec svc-sec" id="service">
          <div className="wrap">
            <div className="rv">
              <h2 className="serif sec-title">인쇄 · 제본</h2>
              <p className="sec-lead">출력, 재단, 제본을 한 작업실에서 끝냅니다.</p>
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
                        {s.detail ? (
                          <button type="button" className={svcX ? "svc-m svc-mx x" : "svc-m svc-mx"} onClick={() => setSvcX((v) => !v)} aria-pressed={svcX}>
                            <img src={s.img} alt={`${s.name} 완성본`} loading="lazy" width={896} height={1120} />
                            <img src={s.detail} alt={`${s.name} 구성: ${s.parts?.join(", ")}`} loading="lazy" width={896} height={1120} />
                            <span className="x-chip">{svcX ? "완성본 보기" : "눌러서 구성 보기"}</span>
                          </button>
                        ) : (
                          <img className="svc-m" src={s.img} alt={`${s.name} 인쇄물`} loading="lazy" width={896} height={1120} />
                        )}
                        {s.parts && (
                          <ol className="x-parts">
                            {s.parts.map((pt) => (
                              <li key={pt}>{pt}</li>
                            ))}
                          </ol>
                        )}
                        <p>{s.desc}</p>
                        {SERVICE_PAGES.find((x) => x.name === s.name) && (
                          <a className="svc-more" href={`/${SERVICE_PAGES.find((x) => x.name === s.name)!.slug}/`}>
                            {s.name} 자세히 보기 <Arrow />
                          </a>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div
                className={SERVICES[svc].detail ? "svc-view has-x" : "svc-view"}
                aria-hidden="true"
                onMouseEnter={() => setSvcX(true)}
                onMouseLeave={() => setSvcX(false)}
              >
                {SERVICES.map((s, i) => (
                  <img key={s.img} src={s.img} alt="" className={i === svc && !(s.detail && svcX) ? "on" : undefined} loading="lazy" width={896} height={1120} />
                ))}
                {SERVICES.map((s, i) =>
                  s.detail ? <img key={s.detail} src={s.detail} alt="" className={i === svc && svcX ? "on" : undefined} loading="lazy" width={896} height={1120} /> : null,
                )}
                {SERVICES[svc].parts && (
                  <div className={svcX ? "x-legend on" : "x-legend"}>
                    <span className="x-chip">{svcX ? "구성" : "커서를 올리면 구성이 보여요"}</span>
                    {svcX && <b>{SERVICES[svc].parts?.join("  ·  ")}</b>}
                  </div>
                )}
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
              <div className={paperMore ? "paper-grid more" : "paper-grid"}>
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
              {!paperMore && (
                <button type="button" className="mob-more" onClick={() => setPaperMore(true)}>
                  종이 {PAPER_GUIDE.length - 2}종 더 보기
                </button>
              )}
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
                    <button type="button" className="zoomable" onMouseMove={lens} onClick={() => setZoom({ src: e.img, alt: e.name })} aria-label={`${e.name} 사진 크게 보기`}>
                      <img src={e.img} alt={e.name} loading="lazy" width={1184} height={888} />
                    </button>
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
              <p>재단, 오시, 제본, 코팅까지 작업실 안에서 바로 이어집니다.</p>
            </div>
            <div className={finMore ? "eq-sub more" : "eq-sub"}>
              {FINISHING.map((e) => (
                <article className="eq-card eq-mini rv" key={e.name}>
                  <figure>
                    <button type="button" className="zoomable" onMouseMove={lens} onClick={() => setZoom({ src: e.img, alt: e.name })} aria-label={`${e.name} 사진 크게 보기`}>
                      <img src={e.img} alt={e.name} loading="lazy" width={900} height={675} />
                    </button>
                  </figure>
                  <div className="eq-body">
                    <small>{e.k}</small>
                    <h3>{e.name}</h3>
                    <p>{e.sub}</p>
                  </div>
                </article>
              ))}
            </div>
            {!finMore && (
              <button type="button" className="mob-more" onClick={() => setFinMore(true)}>
                후가공 장비 {FINISHING.length - 2}대 더 보기
              </button>
            )}
          </div>
        </section>

        <section className="sec gal-sec" id="gallery" aria-labelledby="gal-h">
          <div className="wrap rv">
            <h2 className="serif sec-title" id="gal-h">
              이렇게 만들어 드립니다
            </h2>
            <p className="sec-lead">다인인쇄소에서 자주 만드는 책자와 인쇄물입니다. 실제 작업물을 토대로 다시 만든 사진입니다.</p>
          </div>
          <div className="gal">
            <ul className="gal-track">
              {[...GALLERY, ...GALLERY].map((g, i) => (
                <li key={i} aria-hidden={i >= GALLERY.length ? true : undefined}>
                  <button
                    type="button"
                    tabIndex={i >= GALLERY.length ? -1 : undefined}
                    onClick={() => setZoom({ src: g.img, alt: `${g.t} · ${g.spec}` })}
                  >
                    <img src={g.img} alt={`${g.t} 예시`} loading="lazy" width={720} height={900} />
                    <span className="gal-cap">
                      <b>{g.t}</b>
                      <small>{g.spec}</small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="sec proc" id="process">
          <div className="wrap">
            <div className="rv rv-soft">
              <h2 className="serif sec-title">작업은 이렇게 진행됩니다</h2>
              <p className="sec-lead">파일을 보내주시면 그다음은 저희가 챙깁니다.</p>
            </div>
            <ol className={stepAnim ? "steps anim" : "steps"} ref={stepsRef}>
              {STEPS.map((s, i) => (
                <li className={"step" + (i <= stepOn ? " on" : "") + (i === stepOn ? " cur" : "")} key={s.t}>
                  <StepMedia s={s} />
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
              <a className="order-helper" href="/order/">
                <span>
                  <b>간단하게 주문하기</b>
                  <small>품목 · 사양 · 필요한 날짜를 고르면 주문 내용이 자동으로 완성돼요</small>
                </span>
                <em>
                  간단하게 주문하기 <Arrow />
                </em>
              </a>
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
                      전화({CONTACT.phone})나 카톡으로 먼저 알려주세요.
                    </span>
                  </li>
                </ul>
                <div className="wh bank" id="bank">
                  <div className="wh-h">
                    <Ico k="bank" />
                    <b>입금 계좌</b>
                  </div>
                  <dl>
                    <dt>{CONTACT.bankName}</dt>
                    <dd>
                      {CONTACT.bankNo}
                      <button type="button" className={copied === "bank" ? "mini done" : "mini"} onClick={() => copy("bank", CONTACT.bankNo)}>
                        {copied === "bank" ? "복사됨" : "복사"}
                      </button>
                    </dd>
                    <dt>예금주</dt>
                    <dd>{CONTACT.bankHolder}</dd>
                  </dl>
                  <p>견적을 확인하신 뒤 입금해 주시면 작업 순서에 올립니다. 입금자명이 주문자와 다르면 알려주세요.</p>
                </div>
                <a className="link-line fmt" href="/templates/">
                  작업 템플릿 받기 (3단 리플렛 · 명함 · A4 전단) <Arrow />
                </a>
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
              <p className="sec-lead sec-lead-1">카드에 마우스를 올리거나 누르면 자세한 설명이 나옵니다.</p>
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

        {BLOG.length > 0 && (
          <section className="sec blog-sec" id="blog">
            <div className="wrap">
              <div className="blog-head rv">
                <div>
                  <h2 className="serif sec-title">작업 이야기</h2>
                  <p className="sec-lead">네이버 블로그에 올린 최근 작업과 소식입니다.</p>
                </div>
                <a className="link-line" href={CONTACT.blog} target="_blank" rel="noreferrer">
                  블로그 전체 보기 <Arrow />
                </a>
              </div>
              <ul className="blog-list">
                {(BLOG as { title: string; link: string; date: string; category: string; excerpt: string; img?: string }[]).map((b) => (
                  <li key={b.link} className="rv">
                    <a href={b.link} target="_blank" rel="noreferrer">
                      <span className={b.img ? "blog-img" : "blog-img none"}>
                        {b.img ? <img src={b.img} alt="" loading="lazy" width={640} height={640} /> : <span>DAIN PRINT</span>}
                      </span>
                      <span className="blog-meta">
                        {b.category && <em>{b.category}</em>}
                        <time>{b.date}</time>
                      </span>
                      <b>{b.title}</b>
                      {b.excerpt && <p>{b.excerpt}</p>}
                      <span className="blog-go">
                        읽어보기 <Arrow />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section className="sec" id="faq">
          <div className="wrap faq">
            <h2 className="serif sec-title rv">자주 묻는 질문</h2>
            <div className="rv">
              {(faqMore ? FAQ : FAQ.slice(0, 5)).map((f) => (
                <details className="qa" key={f.q}>
                  <summary>
                    <span>{f.q}</span>
                    <span className="plus" aria-hidden="true" />
                  </summary>
                  <p>
                    {f.a}
                    {f.link && (
                      <>
                        {" "}
                        <a className="qa-link" href={f.link.href} {...(f.link.href.startsWith("#") ? {} : { target: "_blank", rel: "noreferrer" })}>
                          {f.link.label} →
                        </a>
                      </>
                    )}
                  </p>
                </details>
              ))}
              {!faqMore && (
                <button type="button" className="faq-more" onClick={() => setFaqMore(true)}>
                  질문 {FAQ.length - 5}개 더 보기
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="sec visit-sec" id="visit">
          <div className="wrap visit">
            <div className="visit-map rv">
              <VisitMap />
              <div className="visit-map-links">
                <a href={CONTACT.kakaoMapUrl} target="_blank" rel="noreferrer">카카오맵</a>
                <a href={CONTACT.mapUrl} target="_blank" rel="noreferrer">네이버 지도</a>
              </div>
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
                <dd>
                  {CONTACT.hours}
                  <small>{CONTACT.closed} · 주말 작업은 미리 협의</small>
                </dd>
                <dt>입금 계좌</dt>
                <dd>
                  {CONTACT.bankName} {CONTACT.bankNo}
                  <small>예금주 {CONTACT.bankHolder}</small>
                </dd>
                <dt>주차</dt>
                <dd>
                  픽업 시 매장 앞 잠깐 정차
                  <small>따로 주차장은 없습니다</small>
                </dd>
                <dt>전화</dt>
                <dd>
                  {CONTACT.phone}
                  <small>카톡 상담도 받습니다</small>
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
                <a className="btn" href={CONTACT.kakao} target="_blank" rel="noreferrer">
                  카카오톡 상담
                </a>
                <a className="btn btn-accent" href={`tel:${tel}`}>
                  <Phone /> 전화하기
                </a>
              </div>
            </div>
          </div>
          <div className="wrap shop-photos rv">
            <div className="shop-head">
              <h3>실제 매장 사진</h3>
              <p>간판 이름은 <b>'다인시스템'</b>입니다. 충무로 골목의 파란 간판을 찾아오세요.</p>
            </div>
            <div className="shop-grid">
              {SHOP_PHOTOS.map((p) => (
                <figure key={p.src}>
                  <button type="button" className="zoomable" onClick={() => setZoom({ src: p.src, alt: p.alt })} aria-label={`${p.cap} 사진 크게 보기`}>
                    <img src={p.src} alt={p.alt} loading="lazy" width={p.w} height={p.h} />
                  </button>
                  <figcaption>{p.cap}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="ftr">
        <div className="wrap">
          <div className="ftr-top">
            <Mark white />
            <nav className="ftr-nav" aria-label="하단 메뉴">
              {NAV.map(([h, l]) => (
                <a key={h} href={h}>
                  {l}
                </a>
              ))}
              <a href={CONTACT.blog} target="_blank" rel="noreferrer">
                블로그
              </a>
              <a href={CONTACT.tistory} target="_blank" rel="noreferrer">
                티스토리
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
            <span>영업시간 {CONTACT.hours} · {CONTACT.closed}</span>
            <span>전화 {CONTACT.phone}</span>
            <span>메일 {CONTACT.email}</span>
            <span>
              입금 계좌 {CONTACT.bankName} {CONTACT.bankNo} {CONTACT.bankHolder}
            </span>
          </div>
          <nav className="ftr-svc" aria-label="품목별 안내">
            {SERVICE_PAGES.map((o) => (
              <a key={o.slug} href={`/${o.slug}/`}>
                {o.name}
              </a>
            ))}
            <a href="/templates/">작업 템플릿</a>
            <a href="/order/">간단하게 주문하기</a>
          </nav>
          <p className="ftr-copy">© 2026 다인인쇄소</p>
        </div>
      </footer>

      <nav className={solid ? "qm" : "qm top"} aria-label="빠른 문의" hidden={menu || visit || evPop || bankPop || !!zoom}>
        <a
          className="qm-hot"
          href="#notice"
          aria-label="진행 중인 이벤트 보기"
          onClick={(e) => {
            e.preventDefault();
            setEvPop(true);
          }}
        >
          <b>HOT</b>
          <span>EVENT</span>
        </a>
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
        <a className="qm-i qm-order" href="/order/">
          <Ico k="order" />
          <span>주문하기</span>
        </a>
        <a
          className="qm-i qm-bank"
          href="#bank-pop"
          onClick={(e) => {
            e.preventDefault();
            setBankPop(true);
          }}
        >
          <Ico k="bank" />
          <span>입금계좌</span>
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

      {zoom && (
        <div className="lb" onClick={() => setZoom(null)} role="dialog" aria-modal="true" aria-label={zoom.alt}>
          <figure>
            <img src={zoom.src} alt={zoom.alt} />
            <figcaption>{zoom.alt}</figcaption>
          </figure>
          <button type="button" className="vm-x" onClick={() => setZoom(null)} aria-label="닫기" autoFocus>
            <Ico k="close" />
          </button>
        </div>
      )}

      {bankPop && (
        <div className="vm" onClick={(e) => e.target === e.currentTarget && setBankPop(false)}>
          <div className="bank-box" role="dialog" aria-modal="true" aria-labelledby="bank-h">
            <button type="button" className="vm-x" onClick={() => setBankPop(false)} aria-label="닫기" autoFocus>
              <Ico k="close" />
            </button>
            <small>입금 계좌</small>
            <h2 className="serif" id="bank-h">
              {CONTACT.bankName}
            </h2>
            <p className="bank-no">{CONTACT.bankNo}</p>
            <p className="bank-holder">예금주 {CONTACT.bankHolder}</p>
            <button type="button" className={copied === "bankpop" ? "btn btn-accent done" : "btn btn-accent"} onClick={() => copy("bankpop", CONTACT.bankNo)}>
              {copied === "bankpop" ? "복사했습니다" : "계좌번호 복사"}
            </button>
            <p className="bank-note">견적을 확인하신 뒤 입금해 주시면 작업 순서에 올립니다. 입금자명이 주문자와 다르면 알려주세요.</p>
          </div>
        </div>
      )}

      {evPop && (
        <div className="vm evm" onClick={(e) => e.target === e.currentTarget && setEvPop(false)}>
          <div className="evm-box" role="dialog" aria-modal="true" aria-labelledby="evm-h">
            <div className="evm-head">
              <div>
                <small>HOT EVENT</small>
                <h2 className="serif" id="evm-h">
                  진행 중인 이벤트
                </h2>
              </div>
              <button type="button" className="vm-x" ref={evPopClose} onClick={() => setEvPop(false)} aria-label="닫기">
                <Ico k="close" />
              </button>
            </div>
            <div className="evm-grid">
              {EVENTS.map((e) => (
                <EvCard e={e} key={e.no} />
              ))}
            </div>
            <p className="evm-note">
              이벤트 적용 여부는 주문 메일이나 전화로 문의해 주세요.
            </p>
          </div>
        </div>
      )}

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
                <dd>
                  {CONTACT.hours}
                  <small>{CONTACT.closed} · 주말 작업은 미리 협의</small>
                </dd>
                <dt>입금 계좌</dt>
                <dd>
                  {CONTACT.bankName} {CONTACT.bankNo}
                  <small>예금주 {CONTACT.bankHolder}</small>
                </dd>
                <dt>주차</dt>
                <dd>
                  픽업 시 매장 앞 잠깐 정차
                  <small>따로 주차장은 없습니다</small>
                </dd>
                <dt>전화</dt>
                <dd>
                  <a href={`tel:${tel}`}>{CONTACT.phone}</a>
                  <small>카톡 상담도 받습니다</small>
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
