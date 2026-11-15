// 전표 도우미 (/slip/) — 사장님 컴퓨터 전용. 손님 주문 글을 붙여넣으면 전표가 나오고, QR을 읽으면 손님 카드가 뜬다.
// 서버가 없어서 주문 기록은 이 컴퓨터(브라우저)에만 저장된다.
import qrcode from "qrcode-generator";
import { orderNo } from "./order-no";

type Slip = {
  no: string; name: string; phone: string; when: string; recv: string; addr: string;
  rush: boolean; special: string[]; items: { title: string; rows: string[] }[];
  raw: string; at: number; done?: boolean;
};

const KEY = "dain-slips";
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const load = (): Record<string, Slip> => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } };
const save = (m: Record<string, Slip>) => { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* 저장 공간 부족 */ } };
const todayISO = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);

function parse(raw: string): Slip | null {
  const lines = raw.replace(/\r/g, "").split("\n").map((l) => l.trimEnd());
  const head = lines.find((l) => l.startsWith("[주문]"));
  if (!head) return null;
  const [name = "", phone = ""] = head.replace("[주문]", "").split("·").map((x) => x.trim());
  const hi = lines.indexOf(head);
  const l2 = lines[hi + 1] || "";
  const rush = l2.includes("★당일★");
  const parts = l2.replace("★당일★", "").trim().split(" · ");
  const recv = (parts.length > 1 ? parts.pop()! : "").trim();
  const when = parts.join(" · ").trim();
  let addr = "";
  const special: string[] = [];
  const items: Slip["items"] = [];
  let mode: "" | "sp" | "item" = "";
  let numLine = "";
  for (let i = hi + 2; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith("주소:")) { addr = l.slice(3).trim(); continue; }
    if (l.startsWith("⚠️")) { mode = "sp"; continue; }
    if (l.startsWith("━")) { mode = "item"; items.push({ title: "", rows: [] }); continue; }
    if (l.startsWith("주문번호")) { numLine = l.split(":")[1]?.trim() || ""; continue; }
    if (!l.trim()) { if (mode === "sp") mode = ""; continue; }
    if (mode === "sp") special.push(l.replace(/^·\s*/, ""));
    else if (mode === "item") { const it = items[items.length - 1]; if (!it.title) it.title = l; else it.rows.push(l); }
  }
  const body = lines.filter((l) => !l.startsWith("주문번호")).join("\n").trim();
  const no = numLine || orderNo(body, todayISO());
  return { no, name, phone, when, recv, addr, rush, special, items, raw, at: Date.now() };
}

const qrSvg = (t: string) => { const q = qrcode(0, "M"); q.addData(t); q.make(); return q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); };

function slipHtml(s: Slip): string {
  return `<div class="slip-h"><b>다인인쇄소</b><span>작업 전표</span></div>
<div class="slip-top"><div><div class="no">${esc(s.no)}</div>${s.rush ? '<div class="rush">★ 당일 ★</div>' : ""}</div><div class="qr">${qrSvg(s.no)}</div></div>
<div class="big">${esc(s.name)}</div><div class="big ph">${esc(s.phone)}</div>
<div class="row"><b>날짜</b>${esc(s.when || "-")}</div>
<div class="row"><b>받는 방법</b>${esc(s.recv || "-")}${s.addr ? `<br>${esc(s.addr)}` : ""}</div>
${s.special.length ? `<div class="warn"><b>⚠ 특이사항</b>${s.special.map((x) => `<div>· ${esc(x)}</div>`).join("")}</div>` : ""}
${s.items.map((it) => `<div class="item"><b>${esc(it.title)}</b>${it.rows.map((r) => `<div>${esc(r)}</div>`).join("")}</div>`).join("")}
<div class="slip-f">출력 ${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</div>`;
}

function doneMsg(s: Slip): string {
  const r = s.recv;
  const how = r.includes("택배") ? "택배로 발송했습니다. (CJ대한통운, 발송 후 1~2일 걸립니다)" : r.includes("퀵") ? "퀵 기사님 호출해 곧 출발합니다." : "방문 수령하시면 됩니다. (마른내로4길 27 1층, 평일 19시까지)";
  return `[다인인쇄소] ${s.name}님, 주문하신 인쇄물 작업이 완료되었습니다.\n${how}\n주문번호 ${s.no}`;
}

let cur: Slip | null = null;
function show(s: Slip) {
  cur = s;
  $("slip").innerHTML = slipHtml(s);
  $("slip-wrap").hidden = false;
}
function card(s: Slip) {
  cur = s;
  $("card").hidden = false;
  $("card").innerHTML = `<div class="c-no">${esc(s.no)} ${s.done ? '<em class="ok">완료됨</em>' : ""}</div>
<div class="c-name">${esc(s.name)} <a href="tel:${esc(s.phone)}">${esc(s.phone)}</a></div>
<div class="c-big">${s.rush ? "★당일★ " : ""}${esc(s.when)}</div>
<div class="c-big">${esc(s.recv)}${s.addr ? ` · ${esc(s.addr)}` : ""}</div>
${s.special.length ? `<div class="warn">${s.special.map((x) => `<div>⚠ ${esc(x)}</div>`).join("")}</div>` : ""}
${s.items.map((it) => `<div class="item"><b>${esc(it.title)}</b>${it.rows.map((r) => `<div>${esc(r)}</div>`).join("")}</div>`).join("")}
<div class="c-btn"><button id="b-done">완료 처리</button><button id="b-copy">완료 문자 복사</button><button id="b-phone">전화번호 복사</button><button id="b-print">전표 다시 출력</button></div>
<textarea id="c-msg" readonly>${esc(doneMsg(s))}</textarea>`;
  const copy = (t: string, el: HTMLElement) => { navigator.clipboard?.writeText(t); const o = el.textContent; el.textContent = "복사됨 ✓"; setTimeout(() => (el.textContent = o), 1500); };
  $("b-copy").onclick = (e) => copy(doneMsg(s), e.currentTarget as HTMLElement);
  $("b-phone").onclick = (e) => copy(s.phone, e.currentTarget as HTMLElement);
  $("b-print").onclick = () => { show(s); print(); };
  $("b-done").onclick = () => { const m = load(); if (m[s.no]) { m[s.no].done = true; save(m); } s.done = true; card(s); list(); };
}
function list() {
  const m = load();
  const all = Object.values(m).sort((a, b) => b.at - a.at).slice(0, 60);
  $("list").innerHTML = all.length
    ? all.map((s) => `<button class="li${s.done ? " d" : ""}" data-no="${esc(s.no)}"><b>${esc(s.no)}</b> ${esc(s.name)} · ${esc(s.when)} · ${esc(s.recv)}${s.done ? " ✓" : ""}</button>`).join("")
    : '<p class="mut">아직 저장된 주문이 없습니다.</p>';
}
function size(v: string) {
  document.body.dataset.size = v;
  let st = document.getElementById("pg") as HTMLStyleElement | null;
  if (!st) { st = document.createElement("style"); st.id = "pg"; document.head.appendChild(st); }
  st.textContent = v === "a4" ? "@page{size:A4;margin:12mm}" : v === "a5" ? "@page{size:A5;margin:8mm}" : "@page{size:80mm auto;margin:3mm}";
  try { localStorage.setItem("dain-slip-size", v); } catch { /* */ }
}

$("go").onclick = () => {
  const s = parse($<HTMLTextAreaElement>("paste").value);
  if (!s) {
    // 주문서가 아닌 문의 글: 직접 입력 칸을 열고 붙여넣은 글을 내용 칸에 넣어 줌
    $("err").textContent = "주문서 글이 아니에요. 아래 직접 입력 칸에 적어 주세요.";
    openManual($<HTMLTextAreaElement>("paste").value.trim());
    return;
  }
  $("err").textContent = "";
  const m = load(); if (m[s.no]) s.done = m[s.no].done; m[s.no] = s; save(m);
  show(s); list();
};
// 문의 글에서 연락처·이름·날짜·받는 방법·당일을 뽑아 빈 칸에 미리 채워 줌 (틀릴 수 있어서 눈으로 확인)
function guess(t: string) {
  const set = (id: string, v: string) => { const el = $<HTMLInputElement>(id); if (v && !el.value) el.value = v; };
  const ph = t.match(/01[016789][-\s]?\d{3,4}[-\s]?\d{4}/);
  if (ph) {
    const d = ph[0].replace(/\D/g, "");
    set("m-phone", `${d.slice(0, 3)}-${d.slice(3, d.length - 4)}-${d.slice(-4)}`);
    const nm = t.slice(0, ph.index).match(/([가-힣]{2,4})\s*[\/,·]?\s*$/);
    if (nm) set("m-name", nm[1]);
  }
  const dt = t.match(/(\d{1,2})[\/.](\d{1,2})/);
  const tm = t.match(/(오전|오후)?\s*(\d{1,2})\s*시/);
  set("m-when", [dt ? `${dt[1]}.${dt[2]}` : "", tm ? `${tm[1] || ""} ${tm[2]}시`.trim() : ""].filter(Boolean).join(" "));
  const r = $<HTMLSelectElement>("m-recv");
  if (/퀵/.test(t)) r.value = "퀵"; else if (/택배/.test(t)) r.value = "택배"; else r.value = "방문 픽업";
  if (/오늘|당일/.test(t)) $<HTMLInputElement>("m-rush").checked = true;
}
function openManual(memo = "") {
  $("manual").hidden = false;
  if (memo) { $<HTMLTextAreaElement>("m-memo").value = memo; guess(memo); }
  $<HTMLInputElement>("m-name").focus();
}
$("manual-open").onclick = () => openManual();
$("m-go").onclick = () => {
  const v = (id: string) => ($(id) as HTMLInputElement).value.trim();
  if (!v("m-name") && !v("m-phone")) { $("err").textContent = "성함이나 연락처 중 하나는 적어 주세요."; return; }
  const rush = ($("m-rush") as HTMLInputElement).checked;
  const memo = v("m-memo");
  const raw = `[주문] ${v("m-name") || "성함"} · ${v("m-phone") || "연락처"}\n${rush ? "★당일★ " : ""}${v("m-when")} · ${v("m-recv")}\n${memo}`;
  const s: Slip = {
    no: orderNo(raw, todayISO()) , name: v("m-name") || "성함", phone: v("m-phone") || "연락처", when: v("m-when"), recv: v("m-recv"), addr: v("m-addr"),
    rush, special: rush ? ["당일 필요 (오늘 받아야 함)"] : [], items: [{ title: "문의 내용", rows: memo ? memo.split("\n").filter(Boolean) : [] }], raw, at: Date.now(),
  };
  $("err").textContent = "";
  const m = load(); if (m[s.no]) s.done = m[s.no].done; m[s.no] = s; save(m);
  show(s); list();
};
$("print").onclick = () => print();
// 클로드가 만들어 준 링크(/slip/#d=...)로 들어오면 바로 전표를 만든다
function fromHash() {
  const m0 = location.hash.match(/^#d=(.+)$/);
  if (!m0) return;
  try {
    const b = atob(m0[1].replace(/-/g, "+").replace(/_/g, "/"));
    const j = JSON.parse(new TextDecoder().decode(Uint8Array.from(b, (c) => c.charCodeAt(0))));
    const items = Array.isArray(j.items) ? j.items.map((it: { title?: string; rows?: string[] }) => ({ title: String(it.title || ""), rows: (it.rows || []).map(String) })) : [];
    const raw = JSON.stringify(j);
    const s: Slip = { no: orderNo(raw, todayISO()), name: String(j.name || "성함"), phone: String(j.phone || "연락처"), when: String(j.when || ""), recv: String(j.recv || ""), addr: String(j.addr || ""), rush: !!j.rush, special: Array.isArray(j.special) ? j.special.map(String) : [], items, raw, at: Date.now() };
    const m = load(); if (m[s.no]) s.done = m[s.no].done; m[s.no] = s; save(m);
    history.replaceState(null, "", location.pathname);
    show(s); list(); card(s);
  } catch { $("err").textContent = "링크의 주문 내용을 읽지 못했어요."; }
}
$("scan").addEventListener("keydown", (e) => {
  if ((e as KeyboardEvent).key !== "Enter") return;
  const v = $<HTMLInputElement>("scan").value.trim().toUpperCase();
  $<HTMLInputElement>("scan").value = "";
  const s = load()[v];
  if (s) { $("err2").textContent = ""; card(s); } else { $("card").hidden = true; $("err2").textContent = `${v} 번호의 주문이 이 컴퓨터에 없어요. 전표를 만든 컴퓨터에서 확인해 주세요.`; }
});
$("list").onclick = (e) => { const b = (e.target as HTMLElement).closest("button.li") as HTMLElement | null; if (b) { const s = load()[b.dataset.no!]; if (s) { show(s); card(s); } } };
$<HTMLSelectElement>("size").onchange = (e) => size((e.target as HTMLSelectElement).value);
$("clear").onclick = () => { if (confirm("저장된 주문 기록을 모두 지울까요?")) { save({}); list(); $("card").hidden = true; } };
let sv = "r80"; try { sv = localStorage.getItem("dain-slip-size") || "r80"; } catch { /* */ }
$<HTMLSelectElement>("size").value = sv; size(sv); list();
fromHash();
