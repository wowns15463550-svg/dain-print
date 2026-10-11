// 주문서 도우미(/order/)에서 고르는 품목과 사양. 가격은 넣지 않습니다.
// 사장님 단가 계산기(인쇄 단가 계산기 v4.94)의 선택지를 기준으로 맞췄습니다.

export type Vals = Record<string, string | number | boolean>;

export type Field =
  | {
      k: string;
      label: string;
      type: "pick";
      opts: string[];
      def: string;
      hint?: string;
      // 고르면 글을 직접 적을 수 있는 선택지 (값은 vals[k + "_txt"])
      custom?: string;
      // 다른 칸 값에 따라 선택지가 바뀜 (예: 포스터 종이 종류 → 평량)
      dep?: { k: string; map: Record<string, string[]> };
      // "없음"이 아닌 선택지를 막는 조건. 막히면 이유를 돌려줌
      block?: (v: Vals) => string | null;
    }
  | { k: string; label: string; type: "num"; def: number; min: number; step: number; unit: string; hint?: string; mult4?: boolean }
  | { k: string; label: string; type: "check"; text: string; def: boolean; hint?: string };

export type Product = { id: string; name: string; slug?: string; note?: string; fields: Field[] };

const DIRECT = "다른 종이 (직접 적기)";
const UNSURE = "잘 모르겠어요";
const SHEET_PAPERS = ["스노우지 250g", "스노우지 200g", "스노우지 150g", "랑데뷰 240g", "랑데뷰 190g", "랑데뷰 160g", UNSURE];

// 코팅 조건: 190g 이상만 / 랑데뷰는 50권 이상만
const gsm = (p: unknown) => Number(String(p).match(/(\d+)\s*g/)?.[1] || 0);
const coat200 = (v: Vals) => {
  const g = gsm(v.paper);
  if (g && g < 190) return "코팅은 190g 이상 종이만 가능해요.";
  return null;
};
const saddleCoat = (v: Vals) => {
  const why = coat200(v);
  if (why) return why;
  if (String(v.paper).startsWith("랑데뷰") && Number(v.qty) < 50) return "랑데뷰 종이는 50권 이상부터 코팅할 수 있어요.";
  return null;
};

// 포스터 종이 (종류 → 평량)
const POSTER_PAPERS: Record<string, string[]> = {
  스노우: ["120g", "150g", "180g", "200g", "250g", "300g"],
  아트: ["120g", "150g", "180g", "200g", "250g", "300g"],
  백색모조: ["100g", "120g", "150g", "180g", "220g", "260g"],
  "랑데뷰 울트라": ["105g", "130g", "160g", "190g", "210g", "240g"],
};

export const PRODUCTS: Product[] = [
  {
    id: "perfect",
    name: "무선제본 (책 · 교재 · 포트폴리오)",
    slug: "perfect-binding",
    note: "표지는 스노우지 250g 코팅으로 고정입니다. 표지는 단면이라 내지 1쪽은 오른쪽부터 시작해요.",
    fields: [
      { k: "size", label: "크기", type: "pick", opts: ["A4", "A5", "B5", "그 외 (요청사항에 적기)"], def: "A4" },
      { k: "color", label: "내지 인쇄", type: "pick", opts: ["흑백", "칼라", "섞여 있음"], def: "흑백" },
      { k: "side", label: "내지 면", type: "pick", opts: ["양면", "단면"], def: "양면" },
      { k: "paper", label: "내지 용지", type: "pick", opts: ["모조 100g", DIRECT, UNSURE], def: "모조 100g", custom: DIRECT },
      { k: "coat", label: "표지 코팅", type: "pick", opts: ["무광", "유광"], def: "무광" },
      { k: "pages", label: "쪽수 (표지 제외)", type: "num", def: 100, min: 1, step: 1, unit: "쪽" },
      { k: "qty", label: "권수", type: "num", def: 1, min: 1, step: 1, unit: "권" },
    ],
  },
  {
    id: "spring",
    name: "스프링제본 (보고서 · 문제집)",
    slug: "spring-binding",
    note: "검정 트윈링, 앞뒤 무광 반투명 PVC로 마감합니다. 표지도 양면으로 시작하고, 표지와 내지는 같은 용지예요.",
    fields: [
      { k: "size", label: "크기", type: "pick", opts: ["A4", "A5", "B5", "그 외 (요청사항에 적기)"], def: "A4" },
      { k: "color", label: "인쇄", type: "pick", opts: ["흑백", "칼라", "섞여 있음"], def: "흑백" },
      { k: "side", label: "면", type: "pick", opts: ["양면", "단면"], def: "양면" },
      { k: "paper", label: "용지", type: "pick", opts: ["복사용지 (무림 M COPY 80g)", DIRECT, UNSURE], def: "복사용지 (무림 M COPY 80g)", custom: DIRECT },
      { k: "pages", label: "쪽수 (표지 포함)", type: "num", def: 50, min: 1, step: 1, unit: "쪽" },
      { k: "qty", label: "권수", type: "num", def: 1, min: 1, step: 1, unit: "권" },
    ],
  },
  {
    id: "saddle",
    name: "중철제본 (소책자 · 카탈로그)",
    slug: "saddle-stitch",
    note: "쪽수는 표지 포함 8쪽부터 4의 배수예요. 표지도 양면으로 인쇄합니다.",
    fields: [
      { k: "size", label: "접었을 때 크기", type: "pick", opts: ["A4", "A5"], def: "A4" },
      { k: "pages", label: "쪽수 (표지 포함)", type: "num", def: 8, min: 8, step: 4, unit: "쪽", mult4: true },
      { k: "paper", label: "용지", type: "pick", opts: ["모조 100g", "스노우지 250g", "스노우지 200g", "스노우지 150g", "랑데뷰 240g", "랑데뷰 190g", "랑데뷰 160g", UNSURE], def: "모조 100g" },
      { k: "qty", label: "권수", type: "num", def: 10, min: 1, step: 1, unit: "권" },
      { k: "coat", label: "표지 코팅", type: "pick", opts: ["없음", "무광", "유광"], def: "없음", block: saddleCoat, hint: "코팅은 190g 이상 종이만, 랑데뷰는 50권 이상부터 가능해요." },
    ],
  },
  {
    id: "flyer",
    name: "전단지",
    slug: "flyer-leaflet",
    fields: [
      { k: "size", label: "크기", type: "pick", opts: ["A4", "A5"], def: "A4" },
      { k: "side", label: "면", type: "pick", opts: ["단면", "양면"], def: "단면" },
      { k: "paper", label: "용지", type: "pick", opts: ["스노우지 100g", "스노우지 120g"], def: "스노우지 100g" },
      { k: "qty", label: "수량", type: "num", def: 100, min: 100, step: 100, unit: "장", hint: "100장 단위" },
    ],
  },
  {
    id: "sheet",
    name: "리플렛 · 엽서 · 카드 · 낱장 인쇄",
    slug: "postcard-invitation",
    note: "아르떼 · 랑데뷰 소량 코팅과 박 · 미싱 · 귀도리 같은 극소량 후가공은 하지 않아요.",
    fields: [
      { k: "size", label: "펼쳤을 때 크기", type: "pick", opts: ["A3", "A4", "A5", "A6", "그 외 (요청사항에 적기)"], def: "A4" },
      { k: "side", label: "면", type: "pick", opts: ["단면", "양면"], def: "양면" },
      { k: "paper", label: "용지", type: "pick", opts: SHEET_PAPERS, def: "스노우지 200g" },
      { k: "coat", label: "코팅", type: "pick", opts: ["없음", "무광", "유광 (단면만)"], def: "없음", block: coat200 },
      { k: "fold", label: "접지", type: "pick", opts: ["없음", "2단 접지", "3단 접지"], def: "없음", hint: "접지는 오시를 넣고 접어 드려요. A4 3단은 97 · 100 · 100mm" },
      { k: "cut", label: "재단", type: "check", text: "재단 필요 (가장자리까지 배경이 있는 경우)", def: false },
      { k: "qty", label: "수량", type: "num", def: 50, min: 1, step: 1, unit: "장" },
    ],
  },
  {
    id: "card",
    name: "명함",
    slug: "business-card",
    note: "양면 인쇄 기본, 완성 90 × 50mm (작업 92 × 52mm)입니다.",
    fields: [
      { k: "paper", label: "용지", type: "pick", opts: ["스노우지 250g", "랑데뷰지 240g", "반누보 227g"], def: "랑데뷰지 240g" },
      { k: "kinds", label: "종류 (이름 수)", type: "num", def: 1, min: 1, step: 1, unit: "종" },
      { k: "qty", label: "종류당 수량", type: "num", def: 100, min: 100, step: 100, unit: "장", hint: "100장 단위" },
    ],
  },
  {
    id: "poster",
    name: "포스터",
    slug: "poster",
    note: "B2보다 큰 크기(A1 · A0 · B1 · B0)는 제작하지 않아요.",
    fields: [
      { k: "size", label: "크기", type: "pick", opts: ["A2", "B3", "B2"], def: "A2" },
      { k: "paper", label: "종이", type: "pick", opts: Object.keys(POSTER_PAPERS), def: "스노우" },
      { k: "weight", label: "두께 (평량)", type: "pick", opts: POSTER_PAPERS["스노우"], def: "150g", dep: { k: "paper", map: POSTER_PAPERS } },
      { k: "coat", label: "코팅", type: "pick", opts: ["없음", "무광", "유광"], def: "없음" },
      { k: "kinds", label: "종류 (디자인 가짓수)", type: "num", def: 1, min: 1, step: 1, unit: "종" },
      { k: "qty", label: "종류당 수량", type: "num", def: 1, min: 1, step: 1, unit: "장" },
    ],
  },
  {
    id: "form",
    name: "양식 · 스테이플 (왼쪽 위 1곳)",
    slug: "form-stapling",
    note: "자동 스테이플이라 뒷면 심이 납작하게 눌려 마감됩니다.",
    fields: [
      { k: "size", label: "크기", type: "pick", opts: ["A4", "그 외 (요청사항에 적기)"], def: "A4" },
      { k: "color", label: "인쇄", type: "pick", opts: ["흑백", "칼라"], def: "흑백" },
      { k: "side", label: "면", type: "pick", opts: ["단면", "양면"], def: "단면" },
      { k: "paper", label: "용지", type: "pick", opts: ["복사용지 (무림 M COPY 80g)", "모조 100g"], def: "복사용지 (무림 M COPY 80g)" },
      { k: "pages", label: "페이지 수 (한 부당)", type: "num", def: 2, min: 1, step: 1, unit: "쪽" },
      { k: "qty", label: "부수", type: "num", def: 50, min: 1, step: 1, unit: "부" },
      { k: "staple", label: "스테이플", type: "check", text: "왼쪽 위 스테이플", def: true },
    ],
  },
  {
    id: "etc",
    name: "그 외 · 잘 모르겠어요",
    fields: [{ k: "qty", label: "수량", type: "num", def: 1, min: 1, step: 1, unit: "개" }],
    note: "원하시는 내용을 요청사항에 적어 주시면 맞는 방법을 안내해 드립니다.",
  },
];

// 당일 출고가 어려운 품목 (오전 주문 → 오후 5시쯤 출고 규칙에서 제외)
export const SLOW_IDS = ["saddle", "card"];
