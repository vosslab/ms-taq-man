import { render } from "solid-js/web";
import { App } from "./ui/app";

const root = document.getElementById("app");
if (!root) throw new Error("Application host is missing");
render(() => <App />, root);
