import { SSEListener } from "./sseListener.js";
import { StatusMap } from "./statusMap.js";

var map = new StatusMap();

new SSEListener("clear", () => {
  map.clear();
});