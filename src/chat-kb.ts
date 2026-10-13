// 다인이 챗봇이 답하는 내용. 사장님이 확인해 준 사실만 넣습니다 (지어낸 답 금지).
// keys: 손님 질문에 이 낱말이 들어 있으면 이 답을 고릅니다 (띄어쓰기·대소문자 무시).
// 답을 고치려면 a(답), links(버튼)만 바꾸면 됩니다. FAQ와 같은 내용은 site-data의 FAQ를 그대로 씁니다.
import { CONTACT, EVENTS, FAQ } from "./site-data";

export type Link = { label: string; href: string; ext?: boolean };
export type Intent = { id: string; chip?: string; keys: string[]; a: string; links?: Link[]; next?: string[] };

const faq = (q: string) => FAQ.find((f) => f.q.startsWith(q))?.a || "";

export const L = {
  order: { label: "간단하게 주문하기", href: "/order/" },
  kakao: { label: "카톡 상담", href: CONTACT.kakao, ext: true },
  tel: { label: `전화 ${CONTACT.phone}`, href: `tel:${CONTACT.phone.replace(/-/g, "")}` },
  mail: { label: "메일로 파일 보내기", href: CONTACT.mailWrite, ext: true },
  webhard: { label: "웹하드 안내 보기", href: "/#webhard" },
  map: { label: "네이버 지도", href: CONTACT.mapUrl, ext: true },
  kmap: { label: "카카오맵", href: CONTACT.kakaoMapUrl, ext: true },
  tpl: { label: "작업 템플릿 받기", href: "/templates/" },
  paper: { label: "종이 안내 보기", href: "/#service" },
} satisfies Record<string, Link>;

export const INTENTS: Intent[] = [
  {
    id: "eta",
    chip: "언제 받을 수 있어요?",
    keys: ["언제", "당일", "오늘", "빨리", "급해", "급한", "급하", "납기", "몇시에나와", "얼마나걸", "며칠", "내일", "받을수있", "나와요", "나오나", "완성", "소요", "걸리"],
    a: `${faq("언제 받을")}\n급한 작업이면 주문 전에 전화나 카톡으로 먼저 알려주세요!`,
    links: [{ label: "당일 인쇄 자세히 보기", href: FAQ[0].link?.href || "/", ext: true }, L.order],
    next: ["order", "ship"],
  },
  {
    id: "price",
    chip: "가격 · 견적",
    keys: ["가격", "얼마", "견적", "비용", "금액", "단가", "요금", "싸", "저렴", "비싸", "할인"],
    a: `${faq("가격은")}\n홈페이지에는 가격을 따로 올려 두지 않았어요. 견적은 현금가 기준이라, 세금계산서나 현금영수증이 필요하시면 견적 요청할 때 같이 말씀해 주세요.\n'간단하게 주문하기'로 사양을 정리해서 보내 주시면 견적이 더 빨라요.`,
    links: [L.order, L.kakao],
    next: ["tax", "event"],
  },
  {
    id: "order",
    chip: "주문 방법",
    keys: ["주문", "신청", "맡기", "의뢰", "절차", "어떻게하", "진행", "접수", "예약"],
    a: "주문은 이렇게 하시면 돼요.\n① 파일(PDF 추천)과 원하시는 사양을 메일이나 웹하드로 보내 주세요.\n② 파일을 확인하고 견적을 알려드려요.\n③ 입금해 주시면 작업 순서에 올려요.\n④ 매장 방문 픽업, 택배, 서울 근교 퀵 중에 골라 받으시면 끝!\n사양을 고르기 어려우면 '간단하게 주문하기'에서 눌러서 주문서를 만들 수 있어요.",
    links: [L.order, L.mail, L.webhard],
    next: ["file", "pay"],
  },
  {
    id: "file",
    chip: "파일 보내기",
    keys: ["파일", "보내", "전송", "메일", "이메일", "웹하드", "pdf", "ai파일", "jpg", "png", "형식", "확장자", "용량", "업로드", "올리"],
    a: `파일은 메일(${CONTACT.email})이나 웹하드로 보내 주세요. 웹하드에 올리신 뒤에는 메일이나 카톡으로 성함과 파일 이름을 알려주셔야 해요.\n${faq("PDF 말고")}`,
    links: [L.mail, L.webhard, L.tpl],
    next: ["order", "template"],
  },
  {
    id: "hours",
    chip: "영업시간",
    keys: ["영업시간", "영업", "몇시까지", "몇시부터", "문열", "오픈", "마감", "닫는", "닫아", "쉬는날", "쉬어", "휴무", "주말", "토요일", "일요일", "공휴일", "연휴", "운영시간"],
    a: `${CONTACT.hours}에 문을 열어요. ${CONTACT.closed}이에요.\n${faq("주말에도")}`,
    links: [L.kakao],
    next: ["location", "eta"],
  },
  {
    id: "location",
    chip: "오시는 길 · 주차",
    keys: ["위치", "주소", "어디", "오시는", "찾아", "가는길", "가는법", "충무로", "지하철", "역에서", "출구", "지도", "방문", "주차", "차가지고", "차를", "픽업"],
    a: `${CONTACT.address} ${CONTACT.addressDetail}이에요. ${CONTACT.subway}예요.\n간판 이름은 파란색 '다인시스템'이니 그 간판을 찾아오세요!\n${faq("차를")}`,
    links: [L.map, L.kmap],
    next: ["hours", "paper"],
  },
  {
    id: "pay",
    chip: "결제 · 입금 계좌",
    keys: ["결제", "입금", "계좌", "카드결제", "카드", "송금", "이체", "선입금", "은행"],
    a: faq("결제는"),
    next: ["tax", "price"],
  },
  {
    id: "tax",
    chip: "세금계산서 · 현금영수증",
    keys: ["세금계산서", "계산서", "현금영수증", "영수증", "증빙", "사업자", "지출증빙"],
    a: faq("세금계산서"),
    links: [L.mail],
    next: ["pay", "price"],
  },
  {
    id: "ship",
    chip: "택배 · 퀵",
    keys: ["택배", "배송", "퀵", "지방", "배달", "발송", "보내주", "전국", "부산", "대구", "대전", "광주", "제주", "경기"],
    a: "CJ대한통운 택배로 전국 어디든 보내드려요. 보통 발송하고 1~2일이면 도착하는데, 택배사 사정으로 하루 더 걸릴 수 있어요. 택배가 늦어지는 건 저희가 책임지기 어려워서, 급한 작업은 퀵을 추천드려요.",
    next: ["event", "eta"],
  },
  {
    id: "perfect",
    chip: "무선제본",
    keys: ["무선", "책등", "교재", "논문", "포트폴리오", "작품집", "독립출판", "소설", "만화책", "졸업작품"],
    a: "무선제본은 책등을 풀로 붙여 만드는 책이에요. 표지는 스노우지 250g에 코팅해서 만들어요.\n표지는 단면 인쇄라서 내지 1쪽은 오른쪽 페이지부터 시작해요.\n지금 100부 이상 주문하시면 무선 제본비를 1,000원으로 해드리는 이벤트도 하고 있어요!",
    links: [{ label: "무선제본 자세히 보기", href: "/perfect-binding/" }, { label: "무선제본 주문서", href: "/order/?item=perfect-binding" }],
    next: ["saddle", "spring"],
  },
  {
    id: "saddle",
    chip: "중철제본",
    keys: ["중철", "브로슈어", "카탈로그", "팜플렛", "팸플릿", "소책자", "회보", "프로그램북"],
    a: "중철제본은 가운데를 스테이플로 묶는 얇은 책이에요.\n쪽수는 표지 포함 8쪽부터 4의 배수(8·12·16쪽…)로 맞춰 주셔야 하고, 표지도 양면으로 인쇄해요.\n중철은 당일보다 시간이 더 걸리니 일정을 미리 여쭤봐 주세요.",
    links: [{ label: "중철제본 자세히 보기", href: "/saddle-stitch/" }, { label: "중철제본 주문서", href: "/order/?item=saddle-stitch" }],
    next: ["perfect", "spring"],
  },
  {
    id: "spring",
    chip: "스프링제본",
    keys: ["스프링", "링제본", "트윈링", "보고서", "제안서", "문제집", "pvc"],
    a: "스프링제본은 검정 트윈링으로 묶고, 앞뒤에 무광 반투명 PVC를 대서 마감해요.\n표지도 양면으로 인쇄하고, 표지와 내지는 같은 종이로 만들어요.\n한 권을 여러 권으로 나누는 분철은 하지 않아요.",
    links: [{ label: "스프링제본 자세히 보기", href: "/spring-binding/" }, { label: "스프링제본 주문서", href: "/order/?item=spring-binding" }],
    next: ["perfect", "saddle"],
  },
  {
    id: "binding",
    chip: "제본 종류",
    keys: ["제본", "책만들", "묶어", "철하"],
    a: "다인인쇄소에서 하는 제본은 세 가지예요.\n· 무선제본: 책·교재·논문·포트폴리오처럼 책등이 있는 책\n· 중철제본: 가운데를 스테이플로 묶는 얇은 소책자·카탈로그\n· 스프링제본: 쫙 펼쳐지는 보고서·문제집\n궁금한 제본을 눌러 보세요!",
    next: ["perfect", "saddle", "spring"],
  },
  {
    id: "card",
    chip: "명함",
    keys: ["명함"],
    a: "명함은 완성 크기 90×50mm예요. 파일은 사방 1mm씩 여유를 둔 92×52mm로 만들어 주세요.\n양면 인쇄가 기본이고, 100장 단위로 주문받아요. 명함은 당일보다 시간이 더 걸려요.",
    links: [{ label: "명함 자세히 보기", href: "/business-card/" }, L.tpl],
    next: ["flyer", "eta"],
  },
  {
    id: "flyer",
    chip: "전단지 · 리플렛",
    keys: ["전단", "리플렛", "리플릿", "접지", "3단", "삼단", "2단", "이단", "홍보물", "찌라시"],
    a: "전단지와 리플렛 둘 다 해요.\nA4 3단 리플렛은 세 칸 폭이 똑같지 않아요. 겉면은 97·100·100mm, 안쪽 면은 100·100·97mm로 나눠야 접을 때 걸리지 않아요. 작업 템플릿을 받아서 쓰시면 편해요!\n접지 작업은 당일보다 시간이 조금 더 걸려요.",
    links: [{ label: "전단·리플렛 자세히 보기", href: "/flyer-leaflet/" }, L.tpl],
    next: ["template", "paper"],
  },
  {
    id: "poster",
    chip: "포스터",
    keys: ["포스터", "대형", "a2", "b2", "b3", "a1", "a0", "b1", "b0"],
    a: "포스터는 B2 크기까지 만들어요. A1·A0·B1·B0처럼 B2보다 큰 크기는 하지 않아요.",
    links: [{ label: "포스터 자세히 보기", href: "/poster/" }],
    next: ["paper", "cant"],
  },
  {
    id: "form",
    chip: "양식 · 스테이플",
    keys: ["양식", "스테이플", "호치키스", "찍어", "아파트", "서식", "신청서", "설문지"],
    a: "양식 출력하고 왼쪽 위 한 곳에 스테이플을 찍어 드려요. 자동 스테이플이라 뒷면 심이 납작하게 눌려서 깔끔해요. 주로 복사용지로 작업해요.",
    links: [{ label: "양식·스테이플 자세히 보기", href: "/form-stapling/" }],
    next: ["small", "eta"],
  },
  {
    id: "postcard",
    chip: "엽서 · 초대장",
    keys: ["엽서", "초대장", "인사장", "낱장"],
    a: "엽서·초대장·카드 같은 낱장 인쇄도 해요. 자세한 내용은 아래 페이지에서 볼 수 있어요.",
    links: [{ label: "엽서·초대장 자세히 보기", href: "/postcard-invitation/" }],
    next: ["paper", "cant"],
  },
  {
    id: "cant",
    chip: "제작이 안 되는 것",
    keys: ["안되", "안돼", "불가", "못하", "못해", "스티커", "금박", "박가공", "미싱", "귀도리", "분철", "특수", "안하"],
    a: "아쉽지만 이런 건 만들지 않아요.\n· 스티커\n· B2보다 큰 포스터(A1·A0·B1·B0)\n· 스프링 분철\n· 아르떼·랑데뷰 종이의 소량 코팅\n· 아주 적은 수량의 후가공(박·미싱·귀도리 등)\n· 일부 특수 용지, 규격을 벗어난 크기\n· 저작권 침해·위조·음란·불법 인쇄물",
    next: ["binding", "kakao"],
  },
  {
    id: "color",
    chip: "화면이랑 색이 달라요",
    keys: ["색이", "색깔", "색상", "색감", "rgb", "cmyk", "탁해", "흐리", "별색", "형광", "금색", "은색", "환불", "교환", "다르게나"],
    a: faq("화면에서"),
    next: ["file", "paper"],
  },
  {
    id: "paper",
    chip: "종이 고르기",
    keys: ["종이", "용지", "견본", "샘플", "재질", "평량", "두께", "스노우", "모조", "아트지", "랑데뷰", "아르떼", "반누보", "복사용지"],
    a: `${faq("종이를")}`,
    links: [L.paper, L.mail],
    next: ["color", "price"],
  },
  {
    id: "design",
    chip: "디자인도 해주나요?",
    keys: ["디자인", "편집", "시안", "만들어주", "제작해주", "그려", "로고"],
    a: faq("디자인도"),
    links: [L.mail],
    next: ["file", "template"],
  },
  {
    id: "small",
    chip: "1부도 되나요?",
    keys: ["1부", "한부", "한권", "1권", "한장", "1장", "소량", "몇부부터", "최소", "조금만", "적은"],
    a: faq("1부"),
    next: ["price", "order"],
  },
  {
    id: "template",
    chip: "작업 템플릿",
    keys: ["템플릿", "재단선", "재단여백", "도련", "여백", "작업사이즈"],
    a: "A4 3단 리플렛, 명함, A4 전단 작업 템플릿을 PDF로 받을 수 있어요. 재단선·안전선·재단 여백이 다 표시돼 있어서 그대로 맞춰 작업하시면 돼요.",
    links: [L.tpl],
    next: ["file", "flyer"],
  },
  {
    id: "event",
    chip: "이벤트",
    keys: ["이벤트", "혜택", "쿠폰", "리뷰", "프로모션", "무료"],
    a: "지금 하고 있는 이벤트예요!\n" + EVENTS.map((e) => `· ${e.title.join(" ")} — ${e.sub}`).join("\n"),
    links: [{ label: "네이버 플레이스 리뷰 쓰기", href: CONTACT.placeReview, ext: true }],
    next: ["price", "ship"],
  },
  {
    id: "kakao",
    chip: "사장님께 직접 물어보기",
    keys: ["상담", "전화", "카톡", "카카오", "연락", "사람", "직원", "사장", "문의", "통화", "번호"],
    a: `사장님께 바로 연결해 드릴게요!\n전화 ${CONTACT.phone} · 카톡 채널 '${CONTACT.kakaoId}' · 메일 ${CONTACT.email}\n영업시간은 평일 09:30~19:00이에요.`,
    links: [L.kakao, L.tel, L.mail],
  },
  {
    id: "hello",
    keys: ["안녕", "하이", "hello", "반가", "누구", "다인이"],
    a: "안녕하세요! 저는 다인인쇄소 안내 도우미 다인이예요. 주문 방법, 받는 날짜, 파일 보내는 법처럼 궁금한 걸 물어보세요!",
    next: ["eta", "order", "price"],
  },
  {
    id: "thanks",
    keys: ["고마", "감사", "땡큐", "thank", "좋아요", "알겠"],
    a: "도움이 됐다니 다행이에요! 더 궁금한 게 있으면 언제든 물어보세요 :)",
    next: ["order", "kakao"],
  },
];

export const GREETING = "안녕하세요, 다인인쇄소 다인이예요!\n궁금한 걸 아래에서 누르거나 직접 적어 주세요.";
export const FALLBACK = "음… 그건 다인이가 정확히 몰라요. 틀린 걸 알려드리면 안 되니까, 사장님께 직접 물어봐 주세요!";
export const START_CHIPS = ["eta", "price", "order", "file", "location", "hours", "binding", "kakao"];
export const MORE_CHIPS = ["pay", "tax", "ship", "cant", "color", "paper", "design", "small", "template", "event", "card", "flyer", "poster", "form"];

// 질문에서 가장 잘 맞는 답 찾기 (긴 낱말일수록 점수 높게)
const norm = (s: string) => s.toLowerCase().replace(/[\s.,!?~·'"()\-]/g, "");
export function findIntent(text: string): { best?: Intent; also: Intent[] } {
  const t = norm(text);
  if (!t) return { also: [] };
  const scored = INTENTS.map((it) => {
    let s = 0;
    for (const k of it.keys) if (t.includes(norm(k))) s += Math.min(norm(k).length, 4) + 1;
    return { it, s };
  })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);
  return { best: scored[0]?.it, also: scored.slice(1, 3).map((x) => x.it) };
}
export const byId = (id: string) => INTENTS.find((i) => i.id === id);
