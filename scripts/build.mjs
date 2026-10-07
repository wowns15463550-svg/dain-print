// 정적 사이트 빌드: dist/ 에 index.html, app.js, site.css, assets/ 를 만든다.
import * as esbuild from "esbuild";
import { cpSync, mkdirSync, rmSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";

const SITE_URL = "https://www.dainprint.co.kr/";
const TITLE = "다인인쇄소 | 충무로 인쇄소 · 서울 출력 제본 원스톱";
const DESC =
  "서울 충무로 인쇄소, 충무로역 7번 출구 3분. 출력부터 제본까지 한곳에서 빠르고 정확하게. 무선 · 중철 · 스프링 제본, 전단지, 리플렛, 포스터, 명함.";

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
const { render } = require("../.build/render.cjs");
const body = render();

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${TITLE}</title>
<meta name="description" content="${DESC}">
<meta name="theme-color" content="#F4F5F7">
<link rel="canonical" href="${SITE_URL}">
<meta name="naver-site-verification" content="5041c298fea45ba971dc2cc87150db9972907da1" />
<meta property="og:type" content="website">
<meta property="og:title" content="${TITLE}">
<meta property="og:description" content="${DESC}">
<meta property="og:url" content="${SITE_URL}">
<meta property="og:site_name" content="다인인쇄소">
<meta property="og:locale" content="ko_KR">
<meta property="og:image" content="${SITE_URL}assets/og2.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="다인인쇄소 — 서울 충무로, 출력과 제본을 한 번에">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400&family=Noto+Serif+KR:wght@300;400&display=swap">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="site.css?v=${CSS_V}">
<link rel="preload" as="image" href="assets/hero-presses-r.webp">
<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
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
  makesOffer: ["무선제본", "중철제본", "스프링제본", "전단지", "리플렛", "명함", "엽서", "청첩장", "포스터"].map((n) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: n } })),
})}</script>
</head>
<body style="margin:0;background:#F4F5F7">
<div id="root">${body}</div>
<script type="module" src="app.js?v=${JS_V}"></script>
<!-- 네이버 애널리틱스 (통계는 사장님 계정에서만 보입니다) -->
<script src="https://wcs.naver.net/wcslog.js"></script>
<script>if(!window.wcs_add) window.wcs_add = {}; wcs_add["wa"] = "125a7b92b7210d0"; if(window.wcs) { wcs_do(); }</script>
</body>
</html>
`;
writeFileSync("dist/index.html", html);
cpSync("src/site.css", "dist/site.css");
if (existsSync("public")) cpSync("public", "dist", { recursive: true });
writeFileSync("dist/.nojekyll", "");
writeFileSync("dist/robots.txt", `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}sitemap.xml\n`);
writeFileSync(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${SITE_URL}</loc></url></urlset>\n`,
);
rmSync(".build", { recursive: true, force: true });
console.log("built dist/");
