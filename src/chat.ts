// 다인 AI 챗봇 — 모든 페이지 오른쪽 아래. 서버 없이 chat-kb.ts에 적힌 확인된 답만 보여줍니다.
// 로봇 표정: 되는 답 = 웃음, 안 되는 답 = 울음, 모르는 질문 = 갸우뚱
import { byId, FALLBACK, findIntent, GREETING, Intent, L, Link, Mood, MORE_CHIPS, START_CHIPS } from "./chat-kb";

type Face = Mood | "idle";

// 하얀 로봇 머리 + 검은 화면 얼굴 (표정만 바뀜)
export function robot(face: Face = "idle") {
  const eye = "#62E6FF";
  let f = "";
  if (face === "happy") {
    f = `<path d="M33 51q6-8 12 0M55 51q6-8 12 0" stroke="${eye}" stroke-width="4.2" fill="none" stroke-linecap="round"/>
<path d="M44 59q6 6 12 0" stroke="${eye}" stroke-width="3.6" fill="none" stroke-linecap="round"/>
<circle cx="31" cy="58" r="3.4" fill="#FF8FB1" opacity=".75"/><circle cx="69" cy="58" r="3.4" fill="#FF8FB1" opacity=".75"/>`;
  } else if (face === "sad") {
    f = `<path d="M33 51q5-5 11-4M67 51q-5-5-11-4" stroke="${eye}" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M44 62q6-5 12 0" stroke="${eye}" stroke-width="3.6" fill="none" stroke-linecap="round"/>
<path class="dc-tear" d="M36 54q-4 6 0 9q4-3 0-9z" fill="#7DD3FC"/><path class="dc-tear r" d="M64 54q-4 6 0 9q4-3 0-9z" fill="#7DD3FC"/>`;
  } else if (face === "unsure") {
    f = `<circle cx="39" cy="49" r="4.4" fill="${eye}"/><path d="M55 49h11" stroke="${eye}" stroke-width="4" stroke-linecap="round"/>
<path d="M42 60q3-3 6 0t6 0t6 0" stroke="${eye}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
<text x="84" y="22" font-size="22" font-weight="800" fill="#2F6BFF" font-family="system-ui,sans-serif">?</text>`;
  } else {
    f = `<g class="dc-eyes"><ellipse cx="39" cy="49" rx="4.4" ry="5.2" fill="${eye}"/><ellipse cx="61" cy="49" rx="4.4" ry="5.2" fill="${eye}"/></g>
<path d="M44 58q6 5 12 0" stroke="${eye}" stroke-width="3.6" fill="none" stroke-linecap="round"/>`;
  }
  return `<svg class="dc-bot" viewBox="0 0 100 100" aria-hidden="true">
<line x1="50" y1="9" x2="50" y2="20" stroke="#B7C3DA" stroke-width="3.5" stroke-linecap="round"/><circle cx="50" cy="8" r="5.5" fill="#2F6BFF"/>
<rect x="9" y="40" width="9" height="20" rx="4.5" fill="#D6DFEE"/><rect x="82" y="40" width="9" height="20" rx="4.5" fill="#D6DFEE"/>
<rect x="15" y="19" width="70" height="62" rx="27" fill="#fff" stroke="#DCE4F2" stroke-width="2.5"/>
<rect x="23" y="31" width="54" height="40" rx="18" fill="#17203D"/>
${f}</svg>`;
}

const ICON_OUT = `<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICON_TEL = `<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;
const ICON_GO = `<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

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

  const launch = el("button", "dc-launch", `<span class="dc-l-av">${robot()}</span><span class="dc-l-tx"><b>AI 챗봇</b><small>바로 물어보기</small></span><i class="dc-l-badge">AI</i>`) as HTMLButtonElement;
  launch.type = "button";
  launch.setAttribute("aria-label", "AI 챗봇 이용하기");
  launch.setAttribute("aria-expanded", "false");

  const tip = el("div", "dc-tip", `<span>궁금한 건 <b>AI 챗봇</b>에게 물어보세요!</span><button type="button" aria-label="닫기">×</button>`);

  const panel = el("section", "dc-panel");
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "다인 AI 챗봇");
  panel.hidden = true;
  panel.innerHTML = `
<header class="dc-hd">
  <span class="dc-av hd">${robot("happy")}</span>
  <div><b>다인 AI 챗봇</b><small>무엇을 도와드릴까요?</small></div>
  <button type="button" class="dc-x" aria-label="닫기"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>
</header>
<div class="dc-log" aria-live="polite"></div>
<form class="dc-in">
  <input type="text" placeholder="궁금한 내용을 입력하세요" aria-label="질문 입력" maxlength="200" autocomplete="off">
  <button type="button" class="dc-mic" aria-label="말로 물어보기" hidden><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
  <button type="submit" aria-label="보내기"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M3.4 20.4l17.5-7.5a1 1 0 0 0 0-1.8L3.4 3.6a.7.7 0 0 0-1 .8L4 10.7l9 1.3-9 1.3-1.6 6.3a.7.7 0 0 0 1 .8z" fill="currentColor"/></svg></button>
</form>
<p class="dc-note">자동 응답이에요. 정확한 견적·일정은 사장님께 확인해 주세요.</p>`;

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
      const tel = l.href.startsWith("tel:");
      const a = el("a", "dc-act", `${tel ? ICON_TEL : l.ext ? ICON_OUT : ICON_GO}<span>${esc(l.label)}</span>`) as HTMLAnchorElement;
      a.href = l.href;
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
      b.textContent = "+ 더 보기";
      b.onclick = () => {
        b.remove();
        wrap.after(chips(MORE_CHIPS));
        scroll();
      };
      wrap.appendChild(b);
    }
    return wrap;
  }

  function bot(text: string, face: Face, links?: Link[], next?: string[], more = false) {
    const row = el("div", "dc-row bot");
    row.appendChild(el("span", `dc-av ${face}`, robot(face)));
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
      bot(FALLBACK, "unsure", [L.kakao, L.tel]);
      return;
    }
    const next = [...also.map((a) => a.id), ...(it.next || [])].filter((id, i, a) => id !== it.id && a.indexOf(id) === i).slice(0, 3);
    bot(it.a, it.mood || "happy", it.links, next);
  }

  function ask(text: string, it?: Intent) {
    if (busy) return;
    user(text);
    busy = true;
    const typing = el("div", "dc-row bot dc-typing", `<span class="dc-av">${robot()}</span><div class="dc-msg"><i></i><i></i><i></i></div>`);
    log.appendChild(typing);
    scroll();
    const r = it ? { best: it, also: [] as Intent[] } : findIntent(text);
    setTimeout(() => {
      typing.remove();
      answer(r.best, r.also);
      busy = false;
    }, reduce ? 0 : 500);
  }

  function open() {
    panel.hidden = false;
    root.classList.add("open");
    launch.setAttribute("aria-expanded", "true");
    tip.remove();
    ss.set("dc-tip", "1");
    if (!started) {
      started = true;
      bot(GREETING, "happy", undefined, START_CHIPS, true);
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
  // 마이크: 말하면 글자로 바꿔 질문 (브라우저 음성 인식, 서버로 보내지 않음)
  const mic = form.querySelector(".dc-mic") as HTMLButtonElement;
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const inApp = /NAVER|KAKAOTALK|Instagram|FBAN|FBAV|Line\//i.test(navigator.userAgent);
  if (SR && !inApp) {
    mic.hidden = false;
    let rec: any = null;
    let heard = "";
    const stop = () => {
      mic.classList.remove("on");
      mic.setAttribute("aria-label", "말로 물어보기");
      input.placeholder = "궁금한 내용을 입력하세요";
    };
    mic.onclick = () => {
      if (rec) {
        rec.stop();
        return;
      }
      rec = new SR();
      rec.lang = "ko-KR";
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      heard = "";
      rec.onresult = (ev: any) => {
        heard = Array.from(ev.results as ArrayLike<any>).map((r: any) => r[0].transcript).join("");
        input.value = heard;
      };
      rec.onerror = (ev: any) => {
        if (ev.error === "not-allowed" || ev.error === "service-not-allowed") bot("마이크 사용이 막혀 있어요. 브라우저에서 마이크를 허용하거나 글로 적어 주세요.", "unsure");
        else if (ev.error === "no-speech") bot("잘 안 들렸어요. 다시 한번 말씀해 주세요!", "unsure");
      };
      rec.onend = () => {
        rec = null;
        stop();
        const v = heard.trim();
        if (v) {
          input.value = "";
          ask(v);
        }
      };
      try {
        rec.start();
        mic.classList.add("on");
        mic.setAttribute("aria-label", "듣는 중 · 누르면 멈춤");
        input.value = "";
        input.placeholder = "듣고 있어요… 말씀해 주세요";
      } catch {
        rec = null;
        stop();
      }
    };
  }

  form.onsubmit = (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v) return;
    input.value = "";
    ask(v);
  };

  if (ss.get("dc-tip")) tip.remove();
  else {
    setTimeout(() => tip.classList.add("show"), 2500);
    setTimeout(() => tip.classList.remove("show"), 11000);
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
else mount();
