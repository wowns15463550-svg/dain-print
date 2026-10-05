// 다인인쇄소 홈페이지 내용. 공지사항은 content/notices.json 에서 고치면 됩니다.
import notices from "../content/notices.json";

export const CONTACT = {
  phone: "010-8244-4590",
  email: "dain969@naver.com",
  address: "서울 중구 마른내로4길 27",
  addressDetail: "다인시스템 1층",
  hours: "09:30 ~ 19:00",
  bizNo: "205-03-58831",
  blog: "https://blog.naver.com/dainsystem969",
  mapUrl: "https://map.naver.com/p/search/%EB%A7%88%EB%A5%B8%EB%82%B4%EB%A1%9C4%EA%B8%B8%2027",
};

export type Notice = { date: string; tag: string; hot?: boolean; title: string; body: string };
export const NOTICES: Notice[] = notices as Notice[];

export const SERVICES = [
  { img: "assets/l-perfect.webp", name: "무선제본", desc: "학원 교재, 포트폴리오, 보고서처럼 쪽수가 있는 책. 무선 제본기로 책등에 풀을 발라 붙이는 가장 일반적인 제본입니다.", spec: "표지 스노우지 250g 무광코팅" },
  { img: "assets/l-saddle.webp", name: "중철제본", desc: "카탈로그, 팜플렛, 행사 책자. 가운데를 스테이플로 묶어 활짝 펼쳐지는 얇은 책입니다.", spec: "소책자 · 카탈로그 · 프로그램북" },
  { img: "assets/l-spiral.webp", name: "스프링제본", desc: "보고서, 문제집, 매뉴얼처럼 펼쳐두고 보는 자료. 구멍을 뚫어 스프링으로 제본하는 방식입니다.", spec: "보고서 · 문제집 · 매뉴얼" },
  { img: "assets/l-flyer.webp", name: "전단지 · 리플렛", desc: "매장 홍보 전단부터 접는 리플렛까지. 소량도 또렷한 색으로 뽑아드립니다.", spec: "단면 · 양면 · 접지 리플렛" },
  { img: "assets/l-card.webp", name: "명함", desc: "두께감 있는 랑데뷰지 240g에 깔끔하게 인쇄합니다.", spec: "랑데뷰 240g · 52×92mm" },
  { img: "assets/l-poster.webp", name: "포스터", desc: "전시, 매장, 행사 포스터. 사진과 색이 살아 있는 출력물로 만들어 드립니다. A3부터 최대 B2까지.", spec: "A3 · A2 · B2" },
];

export const PAPERS = [
  ["모조", "80g · 100g"],
  ["스노우", "100g · 120g"],
  ["아르떼", "105g · 130g"],
  ["스노우 표지", "250g 무광코팅"],
];

export const EQUIPMENT = [
  { k: "컬러 인쇄", name: "AccurioPress C14000", sub: "코니카미놀타 컬러 프로덕션 프레스. 사진과 색이 중요한 책자, 포스터, 전단을 맡습니다.", img: "assets/m-konica.webp" },
  { k: "흑백 인쇄", name: "Canon varioPRINT 115", sub: "캐논 오세 흑백 프로덕션 프린터. 교재, 논문, 문제집처럼 쪽수 많은 흑백 작업을 맡습니다.", img: "assets/m-canon.webp" },
  { k: "제본", name: "호리존 무선제본기", sub: "책등까지 단단한 무선 제본", img: "" },
];

export const STEPS = [
  { t: "파일 접수", d: "메일로 PDF 파일과 원하는 사양을 보내주세요.", img: "assets/step1.webp", alt: "노트북으로 인쇄 파일을 메일로 보내는 고객" },
  { t: "확인 · 견적", d: "파일 상태를 확인하고 견적과 작업 일정을 알려드립니다.", img: "assets/step2.webp", alt: "휴대폰으로 견적 답장을 확인하는 고객" },
  { t: "선입금", d: "견적을 확인하고 계좌이체로 입금하시면 작업 순서에 올립니다.", img: "assets/step3.webp", alt: "휴대폰으로 계좌이체를 하는 고객" },
  { t: "출력 · 제본", d: "충무로 작업실에서 출력하고 색과 재단을 확인한 뒤 제본까지 마칩니다.", img: "assets/step4.webp", alt: "출력된 인쇄물을 확인하는 모습" },
  { t: "받아가기", d: "방문 픽업, CJ대한통운 택배, 서울 근교 퀵 중에서 고르세요.", img: "assets/step5.webp", alt: "완성된 책을 받아 든 고객" },
];

export const MAIL_TEMPLATE = `제목: [주문] 성함 / 품목

· 성함 / 연락처:
· 품목: (예: 무선제본, 전단지)
· 사이즈 / 수량:
· 용지: (모르시면 비워두세요)
· 인쇄: 단면 · 양면 / 컬러 · 흑백
· 받는 방법: 방문 픽업 / 택배(주소) / 퀵
· 첨부: PDF 파일`;

export const CHECKS = [
  { t: "재단 여백 3mm", d: "완성 사이즈보다 사방 3mm씩 크게 만들어 주세요." },
  { t: "글꼴 포함 또는 윤곽선", d: "글자가 깨지거나 다른 글꼴로 바뀌지 않습니다." },
  { t: "이미지 300dpi", d: "사진이 흐릿하거나 깨져 보이지 않습니다." },
  { t: "페이지 순서", d: "책자는 표지부터 순서대로 한 파일에 담아 주세요." },
];

export const FAQ = [
  { q: "1부, 10장도 인쇄되나요?", a: "네. 소량부터 대량까지 받습니다. 포트폴리오 한 권, 전단지 한 묶음도 괜찮습니다." },
  { q: "가격은 어떻게 알 수 있나요?", a: "품목, 수량, 용지에 따라 달라집니다. 파일과 사양을 보내주시면 확인 후 견적을 바로 알려드립니다." },
  { q: "디자인도 해주시나요?", a: "완성된 파일로 작업하는 것이 기본입니다. 디자인이 필요하시면 메일로 먼저 문의해 주세요." },
  { q: "결제는 어떻게 하나요?", a: "견적 확인 후 선입금으로 예약됩니다. 매장에 오시면 카드 결제도 가능합니다." },
  { q: "지방에서도 주문할 수 있나요?", a: "네. CJ대한통운 택배로 전국에 보내드립니다." },
  { q: "PDF 말고 다른 파일도 되나요?", a: "AI, JPG, PNG도 받습니다. 색과 배치가 가장 정확하게 나오는 형식은 PDF입니다." },
];
