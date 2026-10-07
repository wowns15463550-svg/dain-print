// 정적 사이트 빌드: dist/ 에 index.html, app.js, site.css, assets/ 를 만든다.
import * as esbuild from "esbuild";
import { cpSync, mkdirSync, rmSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";

const SITE_URL = "https://www.dainprint.co.kr/";
const TITLE = "다인인쇄소 | 충무로 인쇄소 · 서울 출력 제본 원스톱";
const DESC =
  "서울 충무로 인쇄소, 충무로역 7번 출구 3분. 출력부터 제본까지 한곳에서 빠르고 정확하게. 무선 · 중철 · 스프링 제본, 전단지, 리플렛, 포스터, 명함.";

// 네이버 블로그 최신 글 (빌드할 때마다 RSS에서 가져와 src/blog-data.json 에 저장, 실패하면 이전 내용 유지)
async function fetchBlog() {
  try {
    const res = await fetch("https://rss.blog.naver.com/dainsystem969.xml", { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const xml = await res.text();
    const pick = (block, tag) => {
      const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
      return m ? m[1].replace(/^<!\[CDATA\[|\]\]>$/g, "").trim() : "";
    };
    const clean = (t) =>
      t.replace(/<(br|\/p|\/div|\/li|img)[^>]*>/gi, " ").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 4).map(([, b]) => {
      const d = new Date(pick(b, "pubDate"));
      const date = isNaN(d) ? "" : new Date(d.getTime() + 9 * 3600e3).toISOString().slice(0, 10).replace(/-/g, ".");
      const text = clean(pick(b, "description"));
      return {
        title: clean(pick(b, "title")),
        link: pick(b, "link").replace(/[?&]fromRss=true.*$/, ""),
        date,
        category: clean(pick(b, "category")),
        excerpt: text.length > 90 ? text.slice(0, 90) + "…" : text,
      };
    }).filter((x) => x.title && x.link.startsWith("https://"));
    if (!items.length) throw new Error("글이 없음");
    writeFileSync("src/blog-data.json", JSON.stringify(items, null, 2) + "\n");
    console.log(`blog: ${items.length}개 글 가져옴`);
  } catch (e) {
    console.log("blog: 가져오기 실패, 이전 내용 사용 (" + e.message + ")");
  }
}
await fetchBlog();

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist", { recursive: true });

const common = { bundle: true, jsx: "automatic", logLevel: "warning", loader: { ".json": "json" } };

// 1) 브라우저용 스크립트
await esbuild.build({
  ...common,
  entryPoints: ["src/client.tsx"],
  outfile: "dist/app.js",
  platform: "browser",
  format: "esm",
  minify: true,
  target: ["es2019"],
  define: { "process.env.NODE_ENV": '"production"' },
});

// 파일이 바뀌면 주소 뒤 ?v= 값도 바뀌어서, 방문자 브라우저가 옛 파일을 쓰지 않는다
const ver = (f) => createHash("sha1").update(readFileSync(f)).digest("hex").slice(0, 8);
const JS_V = ver("dist/app.js");
const CSS_V = ver("src/site.css");

// 2) 미리 그린 HTML (검색 노출과 빠른 첫 화면용)
await esbuild.build({
  ...common,
  entryPoints: ["src/render.tsx"],
  outfile: ".build/render.cjs",
  platform: "node",
  format: "cjs",
  define: { "process.env.NODE_ENV": '"production"' },
});
const require = createRequire(import.meta.url);
const { render, renderService, renderTemplates, servicePages } = require("../.build/render.cjs");

const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const BUSINESS = {
  "@type": "LocalBusiness",
  "@id": SITE_URL + "#business",
  name: "다인인쇄소",
  legalName: "다인시스템",
  url: SITE_URL,
  telephone: "010-8244-4590",
  email: "dain969@naver.com",
  description: DESC,
  image: SITE_URL + "assets/og2.jpg",
  address: { "@type": "PostalAddress", streetAddress: "마른내로4길 27 1층", addressLocality: "중구", addressRegion: "서울", addressCountry: "KR" },
  areaServed: "서울",
  openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:30", closes: "19:00" }],
  paymentAccepted: "계좌이체, 카드",
  sameAs: ["https://naver.me/FDnCx1Wx", "https://blog.naver.com/dainsystem969", "https://www.instagram.com/dain969_/", "http://pf.kakao.com/_rGKVn"],
  makesOffer: servicePages.map((p) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: p.name, url: SITE_URL + p.slug + "/" } })),
};

// 모든 페이지가 같이 쓰는 머리 부분
function page({ title, desc, url, body, ld, image = "assets/og2.jpg", app = false, preload = "" }) {
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#F4F5F7">
<link rel="canonical" href="${url}">
<meta name="naver-site-verification" content="5041c298fea45ba971dc2cc87150db9972907da1" />
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="다인인쇄소">
<meta property="og:locale" content="ko_KR">
<meta property="og:image" content="${SITE_URL}${image}">
${image === "assets/og2.jpg" ? `<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
` : ""}<meta property="og:image:alt" content="${esc(title)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400&family=Noto+Serif+KR:wght@300;400&display=swap">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="/site.css?v=${CSS_V}">
${preload}<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body style="margin:0;background:#F4F5F7">
<div id="root">${body}</div>
${app ? `<script type="module" src="/app.js?v=${JS_V}"></script>\n` : ""}<!-- 네이버 애널리틱스 (통계는 사장님 계정에서만 보입니다) -->
<script src="https://wcs.naver.net/wcslog.js"></script>
<script>if(!window.wcs_add) window.wcs_add = {}; wcs_add["wa"] = "125a7b92b7210d0"; if(window.wcs) { wcs_do(); }</script>
</body>
</html>
`;
}

// 첫 화면
writeFileSync(
  "dist/index.html",
  page({
    title: TITLE,
    desc: DESC,
    url: SITE_URL,
    body: render(),
    ld: { "@context": "https://schema.org", ...BUSINESS },
    app: true,
    preload: `<link rel="preload" as="image" href="/assets/hero-presses-r.webp">\n`,
  }),
);
cpSync("src/site.css", "dist/site.css");
if (existsSync("public")) cpSync("public", "dist", { recursive: true });

// 품목별 페이지: dist/{slug}/index.html
for (const p of servicePages) {
  const url = `${SITE_URL}${p.slug}/`;
  mkdirSync(`dist/${p.slug}`, { recursive: true });
  writeFileSync(
    `dist/${p.slug}/index.html`,
    page({
      title: p.title,
      desc: p.desc,
      url,
      body: renderService(p.slug),
      ld: {
        "@context": "https://schema.org",
        "@graph": [
          BUSINESS,
          { "@type": "Service", name: p.name, serviceType: p.name, description: p.desc, url, image: SITE_URL + p.img, areaServed: "서울", provider: { "@id": SITE_URL + "#business" } },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "다인인쇄소", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: p.name, item: url },
            ],
          },
          { "@type": "FAQPage", mainEntity: p.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
        ],
      },
    }),
  );
}

// 작업 템플릿 페이지
mkdirSync("dist/templates", { recursive: true });
writeFileSync(
  "dist/templates/index.html",
  page({
    title: "인쇄 작업 템플릿 무료 받기 · 3단 리플렛 · 명함 · A4 전단 | 다인인쇄소",
    desc: "A4 3단 리플렛(97 · 100 · 100mm), 명함(92 × 52mm), A4 전단(216 × 303mm) 작업 템플릿 PDF. 재단선 · 안전선 · 접는 선이 그려져 있어 바로 쓸 수 있습니다. 충무로 다인인쇄소.",
    url: `${SITE_URL}templates/`,
    body: renderTemplates(),
    ld: {
      "@context": "https://schema.org",
      "@graph": [
        BUSINESS,
        { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "다인인쇄소", item: SITE_URL }, { "@type": "ListItem", position: 2, name: "작업 템플릿", item: `${SITE_URL}templates/` }] },
      ],
    },
  }),
);

writeFileSync("dist/.nojekyll", "");
writeFileSync("dist/robots.txt", `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}sitemap.xml\n`);
const today = new Date().toISOString().slice(0, 10);
const urls = [SITE_URL, ...servicePages.map((p) => `${SITE_URL}${p.slug}/`), `${SITE_URL}templates/`];
writeFileSync(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`,
);
rmSync(".build", { recursive: true, force: true });
console.log("built dist/");
