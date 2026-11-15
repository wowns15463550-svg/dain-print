// 주문번호: 날짜(월일) + 내용에서 계산한 4글자. 같은 글이면 늘 같은 번호가 나와서 서버 없이도 맞춰 볼 수 있음
export function orderNo(body: string, isoDate: string): string {
  let h = 5381;
  for (let i = 0; i < body.length; i++) h = ((h << 5) + h + body.charCodeAt(i)) >>> 0;
  const code = h.toString(36).toUpperCase().padStart(4, "0").slice(-4);
  return `D${isoDate.slice(5, 7)}${isoDate.slice(8, 10)}-${code}`;
}
