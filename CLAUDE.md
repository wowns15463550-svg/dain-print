# 다인인쇄소 홈페이지 — 작업 안내 (Claude용)

새 대화에서 이 저장소를 열면 이 파일이 자동으로 읽힙니다. 사장님(재준)이 프롬프트를 다시 붙여넣지 않아도 되도록, 바뀌면 여기를 같이 고쳐 주세요.

## 기본
- 사이트: https://www.dainprint.co.kr (가비아 도메인 2027.10.06 만기, GitHub Pages, HTTPS)
- main에 push → GitHub Actions "홈페이지 배포"가 1~2분 안에 자동 배포. 매일 09:00·18:00(KST)에도 다시 만듦(블로그 최신 글 반영).
- 사장님이 요청하면 직접 고치고 push까지 한다. 커밋 끝에 Co-Authored-By / Claude-Session 줄.
- 바뀐 내용은 컴퓨터(1440)·휴대폰(390) 화면 둘 다 확인하고 알려준다. 작업 환경에서 dainprint.co.kr 접속이 막히면 로컬 빌드(dist/)를 Playwright로 찍고, Chrome이 연결돼 있으면 실제 사이트도 확인.
- 사장님께는 쉬운 한국어로, 코드 대신 결과 위주로 설명.

## 구조
- React 19 + esbuild 정적 사이트. `scripts/build.mjs`가 renderToString으로 미리 그린 뒤 메인만 hydrate.
- `src/App.tsx` 메인 화면 / `src/site-data.ts` 문구·데이터(CONTACT, SERVICES, PAPER_GUIDE, EQUIPMENT, FINISHING, STEPS, CHECKS, FAQ, ORDER_NOTES, GALLERY, EVENTS) / `src/site.css`
- `content/notices.json` 공지 (모두 접힌 상태로 시작)
- 품목별 페이지: `src/service-pages.ts`(내용) + `src/ServicePage.tsx`(화면) → `/{slug}/`. 무선 perfect-binding, 중철 saddle-stitch, 스프링 spring-binding, 양식 form-stapling, 전단 flyer-leaflet, 명함 business-card, 엽서 postcard-invitation, 포스터 poster
- 작업 템플릿: `/templates/` 페이지, PDF는 `public/templates/` (`python3 scripts/make-templates.py`로 다시 만듦)
- 블로그 최신 글: 빌드 때 네이버 RSS에서 4개 + 대표 사진을 받아 `src/blog-data.json`·`public/blog-thumbs/`에 씀. 저장소의 blog-data.json은 `[]`로 둔다(로컬 샘플 데이터 커밋 금지).
- 사이트 아이콘: 노란 다인 로고(웃는 종이) — `public/favicon.ico`, `public/apple-touch-icon.png`, `public/assets/icon-192/512.png`. 사이트 이름 "다인인쇄소"는 og:site_name + WebSite 구조화 데이터 두 곳에 넣어 둠.
- 검색: 네이버 서치어드바이저 등록·소유확인 완료, 네이버 애널리틱스(125a7b92b7210d0), sitemap.xml 자동 생성. 구글 서치 콘솔은 코드 받으면 추가.
- 카카오맵: CONTACT.kakaoMapKey (JS 키, 도메인 등록 완료). 네이버 플레이스 https://naver.me/FDnCx1Wx

## 이미지
- 힉스필드 gpt_image_2_5로 만들고, `scripts/fetch-assets.mjs`에 `["파일명.webp","hf_날짜_시간_jobid",{max}]` 추가 → Actions가 받아 webp로 저장·커밋. 이미 있는 파일명은 건너뛰니 바꿀 땐 새 이름(…2.webp) 사용.
- 후보 여러 장은 이름을 a/b로 받아서 본 뒤 하나만 남긴다.
- 사장님 사진을 참고로 쓸 땐: 민감한 부분 흐리게 → tmp-refs 브랜치에 잠깐 push → raw.githubusercontent URL로 media_import_url → 다 쓰면 tmp-refs 비우기.

## 꼭 지킬 것
- 가격·온라인 견적 넣지 않기(이벤트 문구만 예외). "싸다" 금지, 빠르고 고퀄리티 강조.
- 밝고 깔끔한 고급 톤, 코발트 #1E4BD2, 강조 붉은색 #C2544A. 노란 로고는 안 써도 됨.
- 손님 작업물은 허락 없이 올리지 않기. 갤러리는 "실제 작업물을 토대로 다시 만든 사진".
- 확인 안 된 사실을 지어 쓰지 않기. 모르면 사장님께 묻기.
- 다인 소유가 아닌 장비(예: 하청 주는 중철)를 우리 장비처럼 쓰지 않기.

## 업체 정보·운영 규칙
- 다인인쇄소(상호 다인시스템), 서울 중구 마른내로4길 27 다인시스템 1층, 충무로역 7번 출구 도보 3분
- 평일(월~금) 09:30~19:00, 주말·공휴일 휴무(주말 작업은 협의 시 주말 출근 수당)
- 010-8244-4590 / dain969@naver.com / 사업자 205-03-58831 / 입금 하나은행 131-910156-81407 다인(한덕순)
- 카톡 http://pf.kakao.com/_rGKVn/chat (dain969), 블로그 https://blog.naver.com/dainsystem969, 인스타 https://www.instagram.com/dain969_/
- 납기: 오전 주문 + 파일 이상 없으면 보통 오후 5시쯤 (중철·명함·접지 제외)
- 세금계산서·현금영수증 가능, 견적은 현금가 기준이라 미리 말해야 함
- 주차장 없음, 픽업 시 매장 앞 잠깐 정차 가능 / 종이 견본 보러 오는 방문 안 받음
- 색: 화면 RGB ↔ 인쇄 CMYK라 탁해짐, 별색은 다르게 나옴, 기계마다 색감 다름 → 색 차이는 환불 불가
- 제본: 중철 8쪽부터 4의 배수·표지 양면 / 무선 표지 단면 → 내지 1쪽 오른쪽 시작, 표지는 스노우 250g 무광코팅 고정 / 스프링 표지 양면, 표지=내지 같은 용지, 검정 트윈링 + 앞뒤 무광 반투명 PVC
- 3단 리플렛(A4): 겉면 97·100·100mm, 안쪽면 100·100·97mm / 명함 완성 90×50mm(작업 92×52)
- 양식 스테이플: 왼쪽 위 1곳, 자동 스테이플이라 뒷면 납작, 복사용지 위주
- 제작 불가: 저작권·위조·음란/불법, 일부 특수 용지·규격 외, 극소량 후가공(박·미싱·귀도리), B2 초과 포스터, 스티커, 스프링 분철, 아르떼·랑데뷰 소량 코팅
- 택배 CJ대한통운, 발송 후 1~2일(하루 더 걸릴 수 있음), 급하면 퀵 권장, 택배 지연 책임 없음

## 남은 것
- 중철 페이지 문구: 하청이라 "한 작업실에서 재단까지" 같은 직접 작업 표현 정리 (사장님이 어디까지 직접 하는지 확인 후)
- 구글 서치 콘솔 확인 코드 받으면 head에 추가
- 무선 표지 템플릿(책등 두께 기준 받으면), 실제 사진 교체, 오시기 정확한 모델명, 웹하드 실제 주소
- 웹하드 비밀번호가 사이트에 공개돼 있음 → 올리기 전용 계정 여부 사장님 확인 필요
- 네이버 리뷰 버튼을 리뷰 탭으로 바로 보내려면 플레이스 숫자 ID 필요
