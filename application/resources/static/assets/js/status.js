import { NotificationListener } from "./notificationListener.js";
import { PlayerPanel } from "./playerPanel.js";
import { SSEListener } from "./sseListener.js";
import { StatusMap } from "./statusMap.js";
var masonryOptions = {
    itemSelector: '.grid-item',
    percentPosition: true,
    isResizable: true,
    horizontalOrder: true,
    transitionDuration: 0,
    initLayout: false
};
// initialize Masonry
var $grid = $('.grid').masonry(masonryOptions);
setTimeout(function () {
    $grid.masonry('reloadItems');
    $grid.masonry('layout');
}, 1000);
var map = new StatusMap();
new NotificationListener();
PlayerPanel.setGrid($grid);
new SSEListener("clear", () => {
    PlayerPanel.clear();
    map.clear();
});
