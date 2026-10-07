import { renderToString } from "react-dom/server";
import App from "./App";
import ServiceView from "./ServicePage";
import { SERVICE_PAGES } from "./service-pages";

export function render() {
  return renderToString(<App />);
}

export const servicePages = SERVICE_PAGES;
export function renderService(slug: string) {
  const p = SERVICE_PAGES.find((x) => x.slug === slug)!;
  return renderToString(<ServiceView p={p} />);
}
