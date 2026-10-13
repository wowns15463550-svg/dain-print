// 다인이 챗봇 — 모든 페이지 오른쪽 아래. 서버 없이 chat-kb.ts에 적힌 확인된 답만 보여줍니다.
import { byId, FALLBACK, findIntent, GREETING, Intent, L, Link, MORE_CHIPS, START_CHIPS } from "./chat-kb";

// 다인이 얼굴 (웃는 종이 + CMYK 점)
export const FACE = `<svg class="dc-face" viewBox="0 0 100 100" aria-hidden="true">
<path d="M22 10h42l16 16v62a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z" fill="#FAF7EF" stroke="#1A1A1A" stroke-width="5" stroke-linejoin="round"/>
<path d="M64 10v16h16" fill="#E9E3D6" stroke="#1A1A1A" stroke-width="5" stroke-linejoin="round"/>
<circle cx="30" cy="24" r="3.6" fill="#00AEEF"/><circle cx="39.5" cy="24" r="3.6" fill="#EC008C"/><circle cx="49" cy="24" r="3.6" fill="#FFC20E"/><circle cx="58.5" cy="24" r="3.6" fill="#1A1A1A"/>
<g class="dc-eyes"><circle cx="40" cy="57" r="5.2" fill="#1A1A1A"/><circle cx="60" cy="57" r="5.2" fill="#1A1A1A"/></g>
<circle cx="31.5" cy="67" r="4.6" fill="#FFC20E"/><circle cx="68.5" cy="67" r="4.6" fill="#FFC20E"/>
<path d="M39 69q11 10 22 0" fill="none" stroke="#1A1A1A" stroke-width="4.2" stroke-linecap="round"/>
</svg>`;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const reduce = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const ss = {
  get(k: string) {
    try {
      return sessionStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string) {
    try {
      sessionStorage.setItem(k, v);
    } catch {}
  },
};

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, html?: string) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

function mount() {
  if (document.querySelector(".dc-launch")) return;
  const root = el("div", "dc");
  if (document.querySelector(".qm-hot")) root.classList.add("dc-up");

  const launch = el("button", "dc-launch", FACE) as HTMLButtonElement;
  launch.type = "button";
  launch.setAttribute("aria-label", "다인이에게 물어보기 (자동 안내)");
  launch.setAttribute("aria-expanded", "false");

  const tip = el("div", "dc-tip", `<b>다인이</b>에게 물어보세요!<button type="button" aria-label="닫기">×</button>`);

  const panel = el("section", "dc-panel");
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "다인이 안내 챗봇");
  panel.hidden = true;
  panel.innerHTML = `
<header class="dc-hd">
  <span class="dc-av">${FACE}</span>
  <div><b>다인이</b><small>다인인쇄소 안내 도우미</small></div>
  <button type="button" class="dc-x" aria-label="닫기"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
</header>
<div class="dc-log" aria-live="polite"></div>
<form class="dc-in">
  <input type="text" placeholder="궁금한 걸 적어 주세요" aria-label="질문 입력" maxlength="200" autocomplete="off">
  <button type="submit" aria-label="보내기"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 12l16-8-6 16-2-6-8-2z" fill="currentColor"/></svg></button>
</form>
<p class="dc-note">자동 안내예요. 정확한 견적·일정은 사장님께 확인해 주세요.</p>`;

  root.append(panel, tip, launch);
  document.body.appendChild(root);

  const log = panel.querySelector(".dc-log") as HTMLDivElement;
  const form = panel.querySelector(".dc-in") as HTMLFormElement;
  const input = form.querySelector("input") as HTMLInputElement;
  let started = false;
  let busy = false;

  const scroll = () => {
    log.scrollTop = log.scrollHeight;
  };

  function linkBtns(links: Link[]) {
    const wrap = el("div", "dc-acts");
    for (const l of links) {
      const a = el("a", l.href.startsWith("tel:") ? "dc-act tel" : "dc-act") as HTMLAnchorElement;
      a.href = l.href;
      a.textContent = l.label;
      if (l.ext) {
        a.target = "_blank";
        a.rel = "noreferrer";
      }
      wrap.appendChild(a);
    }
    return wrap;
  }

  function chips(ids: string[], more = false) {
    const wrap = el("div", "dc-chips");
    for (const id of ids) {
      const it = byId(id);
      if (!it?.chip) continue;
      const b = el("button", "dc-chip") as HTMLButtonElement;
      b.type = "button";
      b.textContent = it.chip;
      b.onclick = () => ask(it.chip!, it);
      wrap.appendChild(b);
    }
    if (more) {
      const b = el("button", "dc-chip ghost") as HTMLButtonElement;
      b.type = "button";
      b.textContent = "다른 질문 더 보기";
      b.onclick = () => {
        b.remove();
        const m = chips(MORE_CHIPS);
        wrap.after(m);
        scroll();
      };
      wrap.appendChild(b);
    }
    return wrap;
  }

  function bot(text: string, links?: Link[], next?: string[], more = false) {
    const row = el("div", "dc-row bot");
    row.appendChild(el("span", "dc-av sm", FACE));
    const col = el("div", "dc-col");
    col.appendChild(el("div", "dc-msg", esc(text).replace(/\n/g, "<br>")));
    if (links?.length) col.appendChild(linkBtns(links));
    row.appendChild(col);
    log.appendChild(row);
    if (next?.length || more) log.appendChild(chips(next || [], more));
    scroll();
  }

  function user(text: string) {
    const row = el("div", "dc-row me");
    row.appendChild(el("div", "dc-msg", esc(text)));
    log.appendChild(row);
    scroll();
  }

  function answer(it: Intent | undefined, also: Intent[] = []) {
    if (!it) {
      bot(FALLBACK, [L.kakao, L.tel, L.mail], START_CHIPS.filter((id) => id !== "kakao").slice(0, 4));
      return;
    }
    const next = [...also.map((a) => a.id), ...(it.next || [])].filter((id, i, a) => id !== it.id && a.indexOf(id) === i).slice(0, 3);
    bot(it.a, it.links, next);
  }

  function ask(text: string, it?: Intent) {
    if (busy) return;
    user(text);
    busy = true;
    const typing = el("div", "dc-row bot dc-typing", `<span class="dc-av sm">${FACE}</span><div class="dc-msg"><i></i><i></i><i></i></div>`);
    log.appendChild(typing);
    scroll();
    const r = it ? { best: it, also: [] as Intent[] } : findIntent(text);
    setTimeout(() => {
      typing.remove();
      answer(r.best, r.also);
      busy = false;
    }, reduce ? 0 : 450);
  }

  function open() {
    panel.hidden = false;
    root.classList.add("open");
    launch.setAttribute("aria-expanded", "true");
    tip.remove();
    ss.set("dc-tip", "1");
    if (!started) {
      started = true;
      bot(GREETING, undefined, START_CHIPS, true);
    }
    if (matchMedia("(min-width: 701px)").matches) setTimeout(() => input.focus(), 50);
  }
  function close() {
    panel.hidden = true;
    root.classList.remove("open");
    launch.setAttribute("aria-expanded", "false");
    launch.focus();
  }

  launch.onclick = () => (panel.hidden ? open() : close());
  (panel.querySelector(".dc-x") as HTMLButtonElement).onclick = close;
  tip.onclick = (e) => {
    if ((e.target as HTMLElement).tagName === "BUTTON") {
      tip.remove();
      ss.set("dc-tip", "1");
    } else open();
  };
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) close();
  });
  form.onsubmit = (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v) return;
    input.value = "";
    ask(v);
  };

  // 말풍선 안내: 처음 들어온 방문자에게 잠깐 보여주기
  if (ss.get("dc-tip")) tip.remove();
  else {
    setTimeout(() => tip.classList.add("show"), 2500);
    setTimeout(() => tip.classList.remove("show"), 11000);
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
else mount();
