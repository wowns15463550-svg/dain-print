import { hydrateRoot } from "react-dom/client";
import { OrderRoot } from "./OrderPage";

hydrateRoot(document.getElementById("root")!, <OrderRoot />);
