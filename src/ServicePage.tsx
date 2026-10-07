// 품목별 페이지 (예: /spring-binding/). 자바스크립트 없이 미리 그린 HTML 그대로 보여줍니다.
import { Arrow, Ico, Phone } from "./App";
import { CONTACT } from "./site-data";
import { SERVICE_PAGES, type ServicePage } from "./service-pages";

const tel = CONTACT.phone.replace(/-/g, "");
const a = (p: string) => "/" + p; // 하위 주소에서도 이미지가 보이도록 절대 경로로

export default function ServiceView({ p }: { p: ServicePage }) {
  const others = SERVICE_PAGES.filter((o) => o.slug !== p.slug);
  return (
    <div className="dn sp" id="top">
      <header className="hdr solid">
        <div className="wrap hdr-in">
          <a href="/" className="mark" aria-label="다인인쇄소 처음으로">
            <b>DAIN PRINT</b>
            <span>다인인쇄소</span>
          </a>
          <nav className="nav" aria-label="주요 메뉴">
            <a href="/#service">인쇄 · 제본</a>
            <a href="/#gallery">갤러리</a>
            <a href="/#equipment">장비</a>
            <a href="/#order">주문 방법</a>
            <a href="/#visit">오시는 길</a>
          </nav>
          <span className="hdr-tel">{CONTACT.phone}</span>
          <a className="btn btn-accent" href={CONTACT.kakao} target="_blank" rel="noreferrer">
            카톡 상담
          </a>
          <a className="sp-hdr-cta" href={CONTACT.kakao} target="_blank" rel="noreferrer">
            카톡 상담
          </a>
        </div>
      </header>

      <main>
        <section className="sp-hero">
          <div className="wrap sp-hero-grid">
            <div className="sp-hero-copy">
              <nav className="sp-crumb" aria-label="현재 위치">
                <a href="/">다인인쇄소</a>
                <span aria-hidden="true">/</span>
                <a href="/#service">인쇄 · 제본</a>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{p.name}</span>
              </nav>
              <h1 className="serif">
                {p.h1[0]}
                <br />
                <strong>{p.h1[1]}</strong>
              </h1>
              <p className="sp-lead">{p.lead}</p>
              <div className="sp-cta">
                <a className="btn btn-accent" href={CONTACT.kakao} target="_blank" rel="noreferrer">
                  <Ico k="talk" /> 카톡으로 문의하기
                </a>
                <a className="btn" href={CONTACT.mailWrite} target="_blank" rel="noreferrer">
                  파일 보내기 <Arrow />
                </a>
              </div>
              <p className="sp-meta">
                충무로역 7번 출구 도보 3분 · {CONTACT.hours} · {CONTACT.closed}
              </p>
            </div>
            <div className="sp-hero-img">
              <img src={a(p.img)} alt={`${p.name} 인쇄물 예시`} width={896} height={1120} />
            </div>
          </div>
        </section>

        <section className="sp-sec">
          <div className="wrap sp-two">
            <div>
              <h2 className="serif sp-h2">이런 작업에 많이 씁니다</h2>
              <ul className="sp-uses">
                {p.uses.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="serif sp-h2">기본 사양</h2>
              <dl className="dl sp-dl">
                {p.specs.map(([k, v]) => (
                  <div className="sp-dl-row" key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="sp-small">여기 없는 사양도 문의해 주세요. 파일을 보고 맞는 방법을 안내해 드립니다.</p>
            </div>
          </div>
        </section>

        <section className="sp-sec sp-tint">
          <div className="wrap">
            <h2 className="serif sp-h2">다인인쇄소의 {p.name}</h2>
            <div className="sp-points">
              {p.points.map((pt, i) => (
                <div className="sp-point" key={pt.t}>
                  <span className="sp-no">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{pt.t}</h3>
                  <p>{pt.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {p.gallery && p.gallery.length > 0 && (
          <section className="sp-sec">
            <div className="wrap">
              <h2 className="serif sp-h2">이렇게 만들어 드립니다</h2>
              <p className="sp-small">손님 디자인 보호를 위해 같은 사양으로 새로 만든 예시 이미지입니다.</p>
              <div className="sp-gal">
                {p.gallery.map((g) => (
                  <img key={g} src={a(g)} alt={`${p.name} 작업 예시`} loading="lazy" width={800} height={800} />
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="sp-sec">
          <div className="wrap sp-two">
            <div>
              <h2 className="serif sp-h2">주문 전에 확인해 주세요</h2>
              <ol className="sp-notes">
                {p.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ol>
            </div>
            <div>
              <h2 className="serif sp-h2">자주 묻는 질문</h2>
              <div className="sp-faq">
                {p.faq.map((f) => (
                  <details className="qa" key={f.q}>
                    <summary>
                      {f.q}
                      <span className="plus" aria-hidden="true" />
                    </summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="sp-sec sp-order">
          <div className="wrap">
            <h2 className="serif sp-h2">주문은 이렇게 하시면 됩니다</h2>
            <ol className="sp-steps">
              <li>
                <b>파일 보내기</b>
                <span>
                  PDF 파일과 사양을 메일({CONTACT.email})이나 카톡으로 보내주세요. 큰 파일은 웹하드에 올려 주세요.
                </span>
              </li>
              <li>
                <b>확인 · 견적</b>
                <span>파일 상태를 확인하고 견적과 작업 일정을 알려드립니다.</span>
              </li>
              <li>
                <b>입금 후 작업</b>
                <span>
                  {CONTACT.bankName} {CONTACT.bankNo} ({CONTACT.bankHolder})로 입금하시면 작업 순서에 올립니다.
                </span>
              </li>
              <li>
                <b>받아가기</b>
                <span>방문 픽업, CJ대한통운 택배, 서울 근교 퀵 중에서 고르세요.</span>
              </li>
            </ol>
            <div className="sp-cta">
              <a className="btn btn-accent" href={CONTACT.kakao} target="_blank" rel="noreferrer">
                <Ico k="talk" /> 카톡 상담
              </a>
              <a className="btn" href={`tel:${tel}`}>
                <Phone /> {CONTACT.phone}
              </a>
              <a className="btn" href="/#order">
                주문 방법 자세히 <Arrow />
              </a>
            </div>
          </div>
        </section>

        <section className="sp-sec">
          <div className="wrap">
            <h2 className="serif sp-h2">다른 품목도 함께</h2>
            <ul className="sp-more">
              {others.map((o) => (
                <li key={o.slug}>
                  <a href={`/${o.slug}/`}>
                    <img src={a(o.img)} alt="" loading="lazy" width={896} height={1120} />
                    <span>
                      {o.name} <Arrow />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="ftr">
        <div className="wrap">
          <div className="ftr-top">
            <a href="/" className="mark" aria-label="다인인쇄소 처음으로">
              <b>DAIN PRINT</b>
              <span>다인인쇄소</span>
            </a>
            <nav className="ftr-nav" aria-label="품목">
              {SERVICE_PAGES.map((o) => (
                <a key={o.slug} href={`/${o.slug}/`}>
                  {o.name}
                </a>
              ))}
            </nav>
          </div>
          <div className="ftr-info">
            <span>상호 다인시스템</span>
            <span>사업자등록번호 {CONTACT.bizNo}</span>
            <span>
              {CONTACT.address} {CONTACT.addressDetail}
            </span>
            <span>
              영업시간 {CONTACT.hours} · {CONTACT.closed}
            </span>
            <span>전화 {CONTACT.phone}</span>
            <span>메일 {CONTACT.email}</span>
          </div>
          <p className="ftr-copy">© 2026 다인인쇄소</p>
        </div>
      </footer>

      <nav className="qm" aria-label="빠른 문의">
        <a className="qm-i qm-kakao" href={CONTACT.kakao} target="_blank" rel="noreferrer">
          <Ico k="talk" />
          <span>카톡상담</span>
        </a>
        <a className="qm-i qm-tel" href={`tel:${tel}`}>
          <Phone />
          <span>전화</span>
        </a>
        <a className="qm-i qm-mail" href={CONTACT.mailWrite} target="_blank" rel="noreferrer">
          <Ico k="mail" />
          <span>메일</span>
        </a>
        <a className="qm-i qm-wh" href="/#webhard">
          <Ico k="cloud" />
          <span>웹하드</span>
        </a>
        <a className="qm-i qm-map" href="/#visit">
          <Ico k="pin" />
          <span>오시는 길</span>
        </a>
        <a className="qm-i qm-blog" href={CONTACT.blog} target="_blank" rel="noreferrer">
          <Ico k="blog" />
          <span>블로그</span>
        </a>
        <a className="qm-i qm-insta" href={CONTACT.insta} target="_blank" rel="noreferrer">
          <Ico k="insta" />
          <span>인스타</span>
        </a>
        <a className="qm-i qm-up" href="#top" aria-label="맨 위로">
          <Ico k="up" />
        </a>
      </nav>
    </div>
  );
}
