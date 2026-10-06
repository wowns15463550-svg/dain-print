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
  kakao: "http://pf.kakao.com/_rGKVn/chat",
  kakaoId: "dain969",
  insta: "https://www.instagram.com/dain969_/",
  mailWrite: "https://mail.naver.com/write/direct?orderType=new&to=dain969@naver.com",
  webhard: "https://www.webhard.co.kr",
  webhardId: "dain0496",
  webhardPw: "22710496",
  webhardFolder: "1.인터넷손님",
  subway: "충무로역 7번 출구 도보 3분",
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
  { img: "assets/l-invite.webp", name: "엽서 · 청첩장", desc: "두께감 있고 결이 고운 랑데뷰 240g으로 많이 만듭니다. 손에 쥐었을 때 고급스러운 인상이 남습니다.", spec: "랑데뷰 240g" },
  { img: "assets/l-poster.webp", name: "포스터", desc: "전시, 매장, 행사 포스터. 사진과 색이 살아 있는 출력물로 만들어 드립니다. A3부터 최대 B2까지.", spec: "A3 · A2 · B2" },
];

// 주문 전 안내 (주문 방법 아래에 번호 목록으로 나옵니다)
export const ORDER_NOTES = [
  "파일은 PDF가 가장 안전합니다. 다른 형식은 글꼴이나 배치가 바뀔 수 있어요.",
  "저작권 문제가 있는 파일은 제작할 수 없습니다.",
  "해상도가 낮은 이미지는 인쇄 품질을 보장하기 어렵습니다.",
  "모니터 화면과 실제 인쇄물의 색은 차이가 있을 수 있습니다.",
  "주문 제작이라 작업이 시작된 뒤에는 변경 · 취소 · 환불이 어렵습니다.",
  "저희 실수로 잘못 인쇄된 경우 다시 인쇄해 드립니다. 이때 파일 수정은 할 수 없습니다.",
];

export type Paper = { name: string; finish: string; desc: string; rows: [string, string][]; img: string; use: string; useLabel: string };
export const PAPER_GUIDE: Paper[] = [
  {
    name: "모조",
    finish: "무광 · 비코팅",
    desc: "코팅이 없어 빛 반사가 없고 글씨가 편하게 읽힙니다. 교재와 책 내지에 가장 많이 씁니다.",
    rows: [
      ["80g", "쪽수가 많아 두꺼운 책의 내지"],
      ["100g", "교재 · 책 내지"],
    ],
    img: "assets/paper-mojo.webp",
    use: "assets/paper-mojo-use.webp",
    useLabel: "교재 · 책 내지",
  },
  {
    name: "스노우",
    finish: "유광 · 코팅",
    desc: "표면에 광택이 있어 사진과 색이 선명하게 나옵니다. 전단지와 리플렛, 표지에 씁니다.",
    rows: [
      ["100g · 120g", "전단지"],
      ["150g 이상", "리플렛 · 표지"],
      ["250g", "무선제본 표지 (무광코팅)"],
    ],
    img: "assets/paper-snow2.webp",
    use: "assets/paper-snow-use.webp",
    useLabel: "전단지 · 리플렛 · 표지",
  },
  {
    name: "랑데뷰",
    finish: "무광 · 고운 결",
    desc: "표면에 은은하고 고운 결이 있는 무광 종이입니다. 차분하고 고급스러운 인상을 줍니다.",
    rows: [
      ["105g · 130g", "내지"],
      ["160g · 190g · 240g", "엽서 · 청첩장 · 리플렛 · 팜플렛"],
    ],
    img: "assets/paper-rdv2.webp",
    use: "assets/paper-rdv-use.webp",
    useLabel: "엽서 · 청첩장 · 팜플렛",
  },
  {
    name: "고급 복사용지",
    finish: "무림 M COPY · 백색",
    desc: "하얗고 매끄러운 무림 M COPY 80g입니다. 보고서와 스프링 제본, 일반 복사·출력에 가장 많이 씁니다.",
    rows: [["80g", "보고서 · 스프링 제본 · 일반 복사"]],
    img: "assets/paper-mcopy.webp",
    use: "assets/paper-mcopy-use.webp",
    useLabel: "보고서 · 스프링 제본",
  },
];

export const EQUIPMENT = [
  { k: "컬러 인쇄", name: "AccurioPress C14000", sub: "코니카미놀타 컬러 프로덕션 프레스. 사진과 색이 중요한 책자, 포스터, 전단을 맡습니다.", img: "assets/m-c14000.webp" },
  { k: "흑백 인쇄", name: "Canon varioPRINT 115", sub: "캐논 오세 흑백 프로덕션 프린터. 교재, 논문, 문제집처럼 쪽수 많은 흑백 작업을 맡습니다.", img: "assets/m-canon.webp" },
];

// 후가공 장비 (장비 소개 아래 작은 카드)
export const FINISHING = [
  { k: "무선제본", name: "호리존 BQ-270", sub: "책등을 다듬고 풀을 발라 표지를 붙입니다. 교재, 논문, 포트폴리오처럼 쪽수 있는 책을 만듭니다.", img: "assets/m-binder.webp" },
  { k: "재단", name: "호리존 APC-T61", sub: "유압 프로그램 재단기. 책 세 면과 명함, 엽서를 정확한 치수로 반듯하게 자릅니다.", img: "assets/m-cutter.webp" },
  { k: "코팅", name: "JS CHICO 460AT", sub: "자동 코팅기. 표지와 포스터에 무광·유광 필름을 입혀 오염과 긁힘을 막습니다.", img: "assets/m-lami.webp" },
  { k: "타공", name: "스프링 제본 펀칭기", sub: "스프링 제본용 구멍을 일정한 간격으로 깔끔하게 뚫습니다. 보고서, 문제집, 매뉴얼에 씁니다.", img: "assets/m-punch.webp" },
];

export const STEPS = [
  { t: "파일 접수", d: "메일로 PDF 파일과 원하는 사양을 보내주세요.", img: "assets/step1.webp", alt: "노트북으로 인쇄 파일을 메일로 보내는 고객" },
  { t: "확인 · 견적", d: "파일 상태를 확인하고 견적과 작업 일정을 알려드립니다.", img: "assets/step2.webp", alt: "휴대폰으로 견적 답장을 확인하는 고객" },
  { t: "선입금", d: "견적을 확인하고 계좌이체로 입금하시면 작업 순서에 올립니다.", img: "assets/step3.webp", alt: "휴대폰으로 계좌이체를 하는 고객" },
  { t: "출력 · 제본", d: "충무로 작업실에서 출력과 제본을 원스톱으로 함께 진행합니다.", img: "assets/step4.webp", alt: "출력된 인쇄물을 확인하는 모습" },
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
  {
    t: "재단 여백 3mm를 넣어 주세요",
    s: "완성 크기보다 사방 3mm씩 크게",
    d: "재단기는 여러 장을 한 번에 자르기 때문에 1mm 안팎으로 밀릴 수 있습니다. 배경색이나 사진이 가장자리까지 있다면 완성 크기보다 사방 3mm씩 크게 늘려 주세요. A4(210×297mm)라면 216×303mm로 만들면 됩니다. 늘린 부분은 잘려 나갑니다.",
    img: "assets/check-bleed.webp",
  },
  {
    t: "글자는 가장자리에서 5mm 안쪽에",
    s: "재단선에 붙은 글자는 잘릴 수 있어요",
    d: "재단선에 너무 붙은 글자나 로고는 잘리거나 끝에 붙어 보입니다. 중요한 내용은 재단선에서 5mm 이상 안쪽에 두세요. 책자는 제본되는 안쪽에 여유를 조금 더 주는 것이 좋습니다.",
    img: "assets/check-safe.webp",
  },
  {
    t: "해상도가 낮으면 흐리게 나와요",
    s: "사진은 300dpi 원본으로",
    d: "화면에서는 선명해 보여도 인쇄하면 깨질 수 있습니다. 사진은 실제 인쇄 크기 기준 300dpi를 권장합니다. 인터넷에서 캡처하거나 작은 이미지를 크게 늘린 사진은 피하고 원본을 사용해 주세요.",
    img: "assets/check-dpi.webp",
  },
  {
    t: "CMYK로 작업해 주세요",
    s: "화면 색과 인쇄 색은 달라요",
    d: "모니터는 빛(RGB)으로, 인쇄는 잉크(CMYK)로 색을 냅니다. 형광색이나 아주 쨍한 파랑·초록은 인쇄하면 차분하게 나옵니다. 처음부터 CMYK로 작업하면 결과를 예상하기 쉽습니다.",
    img: "assets/check-cmyk.webp",
  },
  {
    t: "글꼴은 윤곽선 처리해 주세요",
    s: "글꼴이 깨지거나 바뀌지 않게",
    d: "작업한 컴퓨터에만 있는 글꼴은 다른 곳에서 열면 깨지거나 다른 글꼴로 바뀝니다. PDF로 저장할 때 글꼴을 포함하거나, 일러스트레이터에서는 윤곽선 만들기를 해 주세요.",
    img: "assets/check-font.webp",
  },
  {
    t: "책자는 한 파일에 순서대로",
    s: "표지부터 마지막 쪽까지",
    d: "표지부터 마지막 쪽까지 한 쪽씩 순서대로 한 PDF에 담아 주세요. 두 쪽을 붙인 펼침면보다 낱장으로 보내 주시는 것이 좋습니다. 중철제본은 전체 쪽수가 4의 배수여야 합니다.",
    img: "assets/check-order.webp",
  },
];

export const FAQ = [
  { q: "1부, 10장도 인쇄되나요?", a: "네. 소량부터 대량까지 받습니다. 포트폴리오 한 권, 전단지 한 묶음도 괜찮습니다." },
  { q: "가격은 어떻게 알 수 있나요?", a: "품목, 수량, 용지에 따라 달라집니다. 파일과 사양을 보내주시면 확인 후 견적을 바로 알려드립니다." },
  { q: "디자인도 해주시나요?", a: "완성된 파일로 작업하는 것이 기본입니다. 디자인이 필요하시면 메일로 먼저 문의해 주세요." },
  { q: "결제는 어떻게 하나요?", a: "견적 확인 후 선입금으로 예약됩니다. 매장에 오시면 카드 결제도 가능합니다." },
  { q: "지방에서도 주문할 수 있나요?", a: "네. CJ대한통운 택배로 전국에 보내드립니다." },
  { q: "PDF 말고 다른 파일도 되나요?", a: "AI, JPG, PNG도 받습니다. 색과 배치가 가장 정확하게 나오는 형식은 PDF입니다." },
];
