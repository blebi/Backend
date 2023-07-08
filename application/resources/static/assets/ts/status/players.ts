import { PlayerPanel } from "./playerPanel.js";
import { SSEListener } from "./sseListener.js";

var masonryOptions = {
  itemSelector: '.grid-item',
  percentPosition: true,
  isResizable: true,
  horizontalOrder: true,
  transitionDuration: 0,
  initLayout: false
};

// initialize Masonry
export var $grid = $('.grid').masonry(masonryOptions);

setTimeout(function () {
  $grid.masonry('reloadItems')
  $grid.masonry('layout');
}, 1000);

PlayerPanel.setGrid($grid);

new SSEListener("clear", () => {
  PlayerPanel.clear();
});