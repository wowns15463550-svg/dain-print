// 카톡·메일로 연락하는 버튼을 누르면 먼저 '인쇄 데이터 유의사항' 안내창을 보여 준다.
// 모든 페이지(chat.js)에서 클릭을 가로채므로 품목 페이지 같은 정적 페이지에서도 동작한다.
import { CONTACT, ORDER_INFO, PRINT_NOTES, PRINT_NO_REPRINT, PRODUCT_NOTES } from "./site-data";

const PAGE_PRODUCT: Record<string, string> = { "perfect-binding": "perfect", "saddle-stitch": "saddle", "spring-binding": "spring" };
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const list = (items: string[]) => `<ul>${items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;

function open(href: string, kind: "kakao" | "mail") {
  document.getElementById("nm-modal")?.remove();
  const slug = location.pathname.split("/").filter(Boolean)[0] ?? "";
  const pn = PRODUCT_NOTES[PAGE_PRODUCT[slug]];
  const box = document.createElement("div");
  box.id = "nm-modal";
  box.className = "od-modal";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-label", "인쇄 데이터 유의사항");
  box.innerHTML = `<div class="od-modal-in">
<h3>⚠️ 인쇄 데이터 유의사항</h3>
<p class="od-modal-lead">보내시기 전에 파일을 한 번만 확인해 주세요.</p>
<section><h4>${esc(ORDER_INFO.title)}</h4>${list(ORDER_INFO.items)}</section>
${pn ? `<section class="od-modal-spring"><h4>${esc(pn.title)}</h4>${list(pn.items)}</section>` : ""}
${PRINT_NOTES.map((g) => `<section><h4>${esc(g.title)}</h4>${list(g.items)}</section>`).join("")}
<p class="od-modal-end">${esc(PRINT_NO_REPRINT)}</p>
<div class="od-modal-btn"><button type="button" class="btn" data-nm="close">돌아가기</button><button type="button" class="btn btn-accent" data-nm="go">확인했습니다 · ${kind === "kakao" ? "카톡 열기" : "메일 열기"}</button></div>
</div>`;
  const close = () => {
    box.remove();
    document.body.style.overflow = "";
    window.removeEventListener("keydown", onKey);
  };
  const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
  box.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;
    if (t === box || t.closest('[data-nm="close"]')) close();
    else if (t.closest('[data-nm="go"]')) {
      window.open(href, "_blank", "noopener");
      close();
    }
  });
  document.body.appendChild(box);
  document.body.style.overflow = "hidden";
  window.addEventListener("keydown", onKey);
  box.querySelector<HTMLButtonElement>('[data-nm="go"]')?.focus();
}

document.addEventListener(
  "click",
  (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const a = (e.target as HTMLElement).closest?.("a[href]") as HTMLAnchorElement | null;
    if (!a || a.closest(".dc-panel, .od-modal")) return;
    const href = a.getAttribute("href") ?? "";
    const kind = href === CONTACT.kakao ? "kakao" : href.startsWith(CONTACT.mailWrite) ? "mail" : null;
    if (!kind) return;
    e.preventDefault();
    open(href, kind);
  },
  true,
);
