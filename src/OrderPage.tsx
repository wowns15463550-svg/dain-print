// 주문서 도우미 (/order/) — 손님이 사양을 고르면 주문 글이 자동으로 완성됩니다. 가격은 보여주지 않습니다.
import { useEffect, useMemo, useState } from "react";
import { Arrow, Ico } from "./App";
import { Shell } from "./ServicePage";
import { CONTACT } from "./site-data";
import { PRODUCTS, SLOW_IDS, type Field, type Product, type Vals } from "./order-options";

type Item = { key: number; pid: string; vals: Vals };

const defaults = (p: Product): Vals => Object.fromEntries(p.fields.map((f) => [f.k, f.def]));
const prod = (id: string) => PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];
let seq = 1;
const newItem = (pid = PRODUCTS[0].id): Item => ({ key: seq++, pid, vals: defaults(prod(pid)) });

// 한국 시간 기준 오늘 (YYYY-MM-DD)
const todayKST = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
const dayName = (d: string) => "일월화수목금토"[new Date(d + "T12:00:00+09:00").getUTCDay()];

// 사장님이 한눈에 보기 쉽게: 품목마다 "항목 : 값" 줄로 정리
const NUM = "①②③④⑤⑥⑦⑧⑨⑩";
const paperOf = (v: Vals) => {
  const p = String(v.paper ?? "");
  if (p.startsWith("다른 종이")) return String(v.paper_txt || "").trim() || "다른 종이 (요청사항 참고)";
  return p.replace(/^복사용지 \(무림 M COPY 80g\)$/, "복사용지 80g");
};
const join = (...xs: unknown[]) => xs.filter((x) => x && x !== "없음").join(" · ");

function describe(it: Item) {
  const p = prod(it.pid);
  const v = it.vals;
  const r: [string, string][] = [];
  const size = String(v.size ?? "").startsWith("그 외") ? "그 외 (요청사항 참고)" : String(v.size ?? "");
  switch (p.id) {
    case "perfect":
      r.push(["크기", size], ["내지", join(paperOf(v), v.side, v.color)], ["표지", "스노우지 250g · 단면 · 무광코팅"], ["페이지", `${v.pages}p`], ["권수", `${v.qty}권`]);
      break;
    case "spring":
      r.push(["크기", size], ["내지", join(paperOf(v), v.side, v.color)], ["페이지", `${v.pages}p (표지 포함)`], ["권수", `${v.qty}권`]);
      break;
    case "saddle":
      r.push(["크기", size], ["용지", paperOf(v)], ["표지", v.coat === "없음" ? "코팅 없음" : `${v.coat}코팅`], ["페이지", `${v.pages}p (표지 포함)`], ["권수", `${v.qty}권`]);
      break;
    case "flyer":
      r.push(["크기", size], ["용지", join(paperOf(v), v.side)], ["수량", `${v.qty}장`]);
      break;
    case "sheet":
      r.push(["크기", size], ["용지", join(paperOf(v), v.side)]);
      if (v.coat !== "없음") r.push(["코팅", String(v.coat)]);
      if (v.fold !== "없음") r.push(["접지", String(v.fold)]);
      if (v.cut) r.push(["재단", "필요"]);
      r.push(["수량", `${v.qty}장`]);
      break;
    case "card":
      r.push(["용지", paperOf(v)], ["수량", `${v.kinds}종 × ${v.qty}장`]);
      break;
    case "poster":
      r.push(["크기", size], ["용지", `${v.paper} ${v.weight}`]);
      if (v.coat !== "없음") r.push(["코팅", String(v.coat)]);
      r.push(["수량", `${v.kinds}종 × ${v.qty}장`]);
      break;
    case "form":
      r.push(["크기", size], ["용지", join(paperOf(v), v.side, v.color)], ["페이지", `${v.pages}p (한 부당)`], ["부수", `${v.qty}부`]);
      if (v.staple) r.push(["스테이플", "왼쪽 위"]);
      break;
    default:
      r.push(["수량", `${v.qty}개`]);
  }
  return { name: p.name.replace(/ \(.*\)$/, ""), rows: r };
}

// 따로 봐야 할 것 (특이사항으로 맨 위에 강조)
function flags(it: Item): string[] {
  const v = it.vals;
  const f: string[] = [];
  if (String(v.paper ?? "").startsWith("다른 종이")) f.push(`종이 직접 지정: ${paperOf(v)}`);
  if (v.paper === "잘 모르겠어요") f.push("종이 추천 필요 (손님이 잘 모름)");
  if (String(v.size ?? "").startsWith("그 외")) f.push("규격 외 크기 (요청사항 확인)");
  if (it.pid === "saddle" && Number(v.pages) % 4 !== 0) f.push(`중철 쪽수 ${v.pages}p — 4의 배수 아님`);
  if (it.pid === "etc") f.push("품목 미정 (요청사항 확인)");
  return f;
}

// 고른 값에 따라 선택지 · 막힘 상태 정리 (포스터 평량, 코팅 조건)
export function settle(p: Product, v: Vals): Vals {
  const o = { ...v };
  for (const f of p.fields) {
    if (f.type !== "pick") continue;
    if (f.dep) {
      const opts = f.dep.map[String(o[f.dep.k])] ?? f.opts;
      if (!opts.includes(String(o[f.k]))) o[f.k] = opts[Math.min(1, opts.length - 1)];
    }
    if (f.block && f.block(o) && o[f.k] !== "없음") o[f.k] = "없음";
  }
  return o;
}

function Ctl({ f, v, set }: { f: Field; v: Vals; set: (k: string, x: string | number | boolean) => void }) {
  if (f.type === "pick") {
    const opts = f.dep ? (f.dep.map[String(v[f.dep.k])] ?? f.opts) : f.opts;
    const why = f.block ? f.block(v) : null;
    const tone = (o: string) => (f.k === "color" ? (o === "흑백" ? " bk" : o === "칼라" ? " red" : "") : "");
    return (
      <div className="od-field">
        <span className="od-lab">{f.label}</span>
        <div className="od-chips" role="radiogroup" aria-label={f.label}>
          {opts.map((o) => {
            const off = !!why && o !== "없음";
            return (
              <button type="button" key={o} role="radio" aria-checked={v[f.k] === o} disabled={off} className={(v[f.k] === o ? "on" : "") + tone(o) || undefined} onClick={() => set(f.k, o)}>
                {o}
              </button>
            );
          })}
        </div>
        {f.custom && v[f.k] === f.custom && (
          <input className="od-in" value={String(v[f.k + "_txt"] ?? "")} onChange={(e) => set(f.k + "_txt", e.target.value)} placeholder="원하시는 종이를 적어 주세요 (예: 랑데뷰 130g)" />
        )}
        {why ? <small className="od-warn">{why}</small> : f.hint && <small className="od-hint">{f.hint}</small>}
      </div>
    );
  }
  if (f.type === "num") {
    const n = Number(v[f.k]) || 0;
    const fix = (x: number) => {
      let y = Math.max(f.min, Math.round(x));
      if (f.mult4) y = Math.max(8, Math.round(y / 4) * 4);
      else if (f.step > 1) y = Math.max(f.min, Math.round(y / f.step) * f.step);
      return y;
    };
    return (
      <div className="od-field">
        <label className="od-lab" htmlFor={`n-${f.k}`}>
          {f.label}
        </label>
        <div className="od-num">
          <button type="button" aria-label="줄이기" onClick={() => set(f.k, fix(n - f.step))}>
            −
          </button>
          <input id={`n-${f.k}`} inputMode="numeric" value={n || ""} onChange={(e) => set(f.k, Number(e.target.value.replace(/\D/g, "")) || 0)} onBlur={() => set(f.k, fix(n))} />
          <span>{f.unit}</span>
          <button type="button" aria-label="늘리기" onClick={() => set(f.k, fix(n + f.step))}>
            +
          </button>
        </div>
        {f.mult4 && n % 4 !== 0 && <small className="od-warn">중철은 4의 배수만 가능해요 (8 · 12 · 16 …)</small>}
        {f.hint && <small className="od-hint">{f.hint}</small>}
      </div>
    );
  }
  return (
    <div className="od-field">
      <span className="od-lab">{f.label}</span>
      <label className="od-check">
        <input type="checkbox" checked={!!v[f.k]} onChange={(e) => set(f.k, e.target.checked)} />
        <span>{f.text}</span>
      </label>
    </div>
  );
}

export function OrderRoot() {
  return (
    <Shell>
      <OrderView />
    </Shell>
  );
}

export default function OrderView() {
  const [items, setItems] = useState<Item[]>([newItem()]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [due, setDue] = useState("");
  const [sameDay, setSameDay] = useState(false);
  const [dueTime, setDueTime] = useState("상관없음");
  const [recv, setRecv] = useState("방문 픽업");
  const [addr, setAddr] = useState("");
  const [memo, setMemo] = useState("");
  const [copied, setCopied] = useState("");
  const [today, setToday] = useState("");

  // 품목 페이지에서 ?item=spring-binding 처럼 들어오면 그 품목으로 시작
  useEffect(() => {
    setToday(todayKST());
    const q = new URLSearchParams(location.search).get("item");
    const p = PRODUCTS.find((x) => x.slug === q || x.id === q);
    if (p) setItems([newItem(p.id)]);
  }, []);

  const upd = (key: number, fn: (it: Item) => Item) => setItems((xs) => xs.map((x) => (x.key === key ? fn(x) : x)));

  const warns: string[] = [];
  const dueD = sameDay ? today : due;
  if (dueD && today) {
    const due = dueD;
    const wd = new Date(due + "T12:00:00+09:00").getUTCDay();
    if (due < today) warns.push("지난 날짜를 고르셨어요.");
    if (wd === 0 || wd === 6) warns.push("주말은 쉽니다. 주말 작업이 꼭 필요하면 미리 상의해 주세요 (협의 시 주말 출근 수당).");
    if (due === today) {
      const slow = items.some((it) => SLOW_IDS.includes(it.pid) || (it.pid === "sheet" && it.vals.fold !== "없음"));
      warns.push(
        slow
          ? "중철 · 명함 · 접지 작업은 당일 출고가 어려울 수 있어요. 먼저 전화나 카톡으로 가능 여부를 확인해 주세요."
          : "오전에 주문하시고 파일에 문제가 없으면 보통 오후 5시쯤 나옵니다. 오후 주문은 먼저 연락 주세요.",
      );
    }
  }

  const text = useMemo(() => {
    const L: string[] = [];
    const dd = sameDay ? today : due;
    const when = dd ? `${dd.slice(5).replace("-", ".")}(${dayName(dd)})${dueTime === "상관없음" ? "" : " " + dueTime}` : "급하지 않음";
    L.push(`[주문] ${name || "성함"} · ${phone || "연락처"}`);
    L.push(`${sameDay ? "★당일★ " : ""}${when} · ${recv.replace(/ \(.*\)$/, "")}`);
    if (recv !== "방문 픽업" && addr.trim()) L.push(`주소: ${addr.trim()}`);
    const special: string[] = [];
    if (sameDay) special.push("당일 필요 (오늘 받아야 함)");
    if (dd) {
      const wd = new Date(dd + "T12:00:00+09:00").getUTCDay();
      if (wd === 0 || wd === 6) special.push("주말 날짜");
    }
    items.forEach((it, i) => flags(it).forEach((x) => special.push(items.length > 1 ? `${NUM[i] ?? i + 1} ${x}` : x)));
    if (memo.trim()) special.push(`요청: ${memo.trim()}`);
    if (special.length) {
      L.push("", "⚠️ 특이사항");
      special.forEach((x) => L.push(`· ${x}`));
    }
    items.forEach((it, i) => {
      const d = describe(it);
      L.push("", "━━━━━━━━━━", `${items.length > 1 ? (NUM[i] ?? i + 1) + " " : ""}${d.name}`);
      d.rows.forEach(([k, v]) => L.push(`${k} : ${v}`));
    });
    return L.join("\n");
  }, [items, name, phone, due, sameDay, today, dueTime, recv, addr, memo]);

  const copy = async (tag: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(tag);
    window.setTimeout(() => setCopied(""), 2500);
  };
  const missing = !name.trim() || !phone.trim();

  return (
    <>
      <section className="sp-hero od-hero">
        <div className="wrap od-hero-grid">
          <div className="sp-hero-copy">
            <nav className="sp-crumb" aria-label="현재 위치">
              <a href="/">다인인쇄소</a>
              <span aria-hidden="true">/</span>
              <span aria-current="page">간단하게 주문하기</span>
            </nav>
            <h1 className="serif">
              간단하게 주문하기,
              <br />
              <strong>눌러서 고르면 끝</strong>
            </h1>
            <p className="sp-lead">원하는 사양을 고르면 주문 내용이 자동으로 정리됩니다. 카톡이나 네이버 메일로 보내주시면 파일을 확인하고 견적과 일정을 알려드려요.</p>
            <ol className="od-steps">
              <li>
                <b>1</b>
                <span>
                  품목 · 사양 <em>고르기</em>
                </span>
              </li>
              <li>
                <b>2</b>
                <span>
                  날짜 · 받는 방법 <em>적기</em>
                </span>
              </li>
              <li>
                <b>3</b>
                <span>
                  카톡 · 메일로 <em>보내기</em>
                </span>
              </li>
            </ol>
          </div>
          <div className="od-hero-img">
            <img src="/assets/order-hero.webp" alt="휴대폰으로 인쇄 주문서를 고르고 보내는 모습" width={847} height={752} />
          </div>
        </div>
      </section>

      <section className="sp-sec od">
        <div className="wrap od-grid">
          <div className="od-form">
            {items.map((it, idx) => {
              const p = prod(it.pid);
              return (
                <div className="od-card" key={it.key}>
                  <div className="od-card-h">
                    <h2>품목 {items.length > 1 ? idx + 1 : ""}</h2>
                    {items.length > 1 && (
                      <button type="button" className="od-del" onClick={() => setItems((xs) => xs.filter((x) => x.key !== it.key))}>
                        삭제
                      </button>
                    )}
                  </div>
                  <div className="od-field">
                    <span className="od-lab">무엇을 만드세요?</span>
                    <div className="od-chips od-prod">
                      {PRODUCTS.map((pp) => (
                        <button type="button" key={pp.id} className={pp.id === it.pid ? "on" : undefined} aria-pressed={pp.id === it.pid} onClick={() => upd(it.key, () => ({ key: it.key, pid: pp.id, vals: defaults(pp) }))}>
                          {pp.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  {p.note && <p className="od-note">{p.note}</p>}
                  {p.fields.map((f) => (
                    <Ctl key={f.k} f={f} v={it.vals} set={(k, x) => upd(it.key, (o) => ({ ...o, vals: settle(p, { ...o.vals, [k]: x }) }))} />
                  ))}
                  {p.slug && (
                    <a className="od-more" href={`/${p.slug}/`} target="_blank" rel="noreferrer">
                      이 품목 안내 보기 <Arrow />
                    </a>
                  )}
                </div>
              );
            })}
            <button type="button" className="od-add" onClick={() => setItems((xs) => [...xs, newItem()])}>
              + 품목 추가
            </button>

            <div className="od-card">
              <div className="od-card-h">
                <h2>받는 분 · 일정</h2>
              </div>
              <div className="od-row">
                <label className="od-field">
                  <span className="od-lab">성함 · 회사명 *</span>
                  <input className="od-in" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동 / ○○학원" />
                </label>
                <label className="od-field">
                  <span className="od-lab">연락처 *</span>
                  <input className="od-in" value={phone} inputMode="tel" onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" />
                </label>
              </div>
              <div className="od-row">
                <label className="od-field">
                  <span className="od-lab">언제까지 필요하세요?</span>
                  <button type="button" className={sameDay ? "od-today on" : "od-today"} aria-pressed={sameDay} onClick={() => setSameDay((x) => !x)}>
                    <i aria-hidden="true">{sameDay ? "✓" : ""}</i> 당일 (오늘 필요해요)
                  </button>
                  <input className="od-in" type="date" value={sameDay ? today : due} min={today || undefined} disabled={sameDay} onChange={(e) => setDue(e.target.value)} />
                  {!sameDay && <small className="od-hint">비워 두면 "급하지 않음"으로 보냅니다.</small>}
                </label>
                <div className="od-field">
                  <span className="od-lab">시간</span>
                  <div className="od-chips">
                    {["상관없음", "오전까지", "오후 5시쯤", "퇴근 전(7시)"].map((o) => (
                      <button type="button" key={o} className={dueTime === o ? "on" : undefined} onClick={() => setDueTime(o)}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {warns.map((w) => (
                <p className="od-warn od-warn-box" key={w}>
                  {w}
                </p>
              ))}
              <div className="od-field">
                <span className="od-lab">받는 방법</span>
                <div className="od-chips">
                  {["방문 픽업", "택배 (CJ대한통운)", "퀵 (서울 근교)"].map((o) => (
                    <button type="button" key={o} className={recv === o ? "on" : undefined} onClick={() => setRecv(o)}>
                      {o}
                    </button>
                  ))}
                </div>
                {recv !== "방문 픽업" ? (
                  <input className="od-in" value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="받으실 주소 · 받는 분 · 연락처" />
                ) : (
                  <small className="od-hint">충무로역 7번 출구 도보 3분. 주차장은 없고 매장 앞에 잠깐 정차 가능합니다.</small>
                )}
                {recv.startsWith("택배") && <small className="od-hint">발송 후 1~2일 걸리고 하루 더 걸릴 수 있어요. 날짜가 정해진 급한 인쇄물은 퀵을 권합니다.</small>}
              </div>
              <label className="od-field">
                <span className="od-lab">요청사항</span>
                <textarea className="od-in" rows={3} value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="예) 표지는 따로 보내요 / 3단 리플렛은 접어서" />
              </label>
            </div>
          </div>

          <aside className="od-out" aria-label="완성된 주문 내용">
            <div className="od-out-in">
              <h2>주문 내용</h2>
              <pre>{text}</pre>
              {missing && <p className="od-warn">성함과 연락처를 적어 주세요.</p>}
              <div className="od-send">
                <button
                  type="button"
                  className="btn btn-accent"
                  onClick={() => {
                    copy("kakao");
                    window.open(CONTACT.kakao, "_blank", "noopener");
                  }}
                >
                  <Ico k="talk" /> {copied === "kakao" ? "복사됨 · 채팅창에 붙여넣기" : "카톡으로 보내기"}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    copy("mail");
                    window.open(CONTACT.mailWrite, "_blank", "noopener");
                  }}
                >
                  <Ico k="mail" /> {copied === "mail" ? "복사됨 · 메일 본문에 붙여넣기" : "네이버 메일로 보내기"}
                </button>
                <button type="button" className="btn od-copy" onClick={() => copy("copy")}>
                  {copied === "copy" ? "복사됐어요" : "내용만 복사"}
                </button>
              </div>
              <ul className="od-tips">
                <li>
                  <b>카톡</b>은 내용이 복사된 채로 상담창이 열려요. 채팅창에 붙여넣기만 하면 됩니다.
                </li>
                <li>
                  <b>네이버 메일</b>은 받는 사람({CONTACT.email})이 채워진 메일 쓰기 창이 열려요. 복사된 내용을 본문에 붙여넣고 파일을 첨부해서 보내 주세요.
                </li>
                <li>가격은 파일을 확인한 뒤 견적으로 알려드립니다.</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
