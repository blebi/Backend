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
//function setStatus(updates: Player[]) {
//  updates.forEach(function (player) {
//    if (!player.onTeam() && PlayerPanel.hasPanel(player)) {
//      PlayerPanel.getPanel(player).remove();
//    }
//  });
//  var players = new Array();
//  updates.forEach(player => {
//    //If wasn't on team before.......
//    if (Player.getPlayer(player) && Player.getPlayer(player).onTeam()) {
//      // but is now, full update
//      if (player.onTeam()) {
//        players.push(Player.updatePlayer(player));
//      }
//    }
//    //Otherwise, partial update
//    else {
//      players.push(player);
//      Player.updatePlayer(player);
//    }
//  });
//  //Generate panels
//  players.forEach(player => {
//    PlayerPanel.getPanel(player).setGrid($grid);
//  });
//  //Append panels to grid
//  if (PlayerPanel.getAllPanels()) {
//    $grid.append(PlayerPanel.getAllPanels())
//  }
//  map.updatePlayers(players);
//  players.forEach(player => {
//    PlayerPanel.getPanel(player)!.update(player);
//  })
//  $grid.masonry('reloadItems').masonry('layout');
//}
new SSEListener("clear", () => {
    PlayerPanel.clear();
    map.clear();
});
//new SSEListener("players", (event: MessageEvent<any>) => {
//  setStatus(Player.fromJSON(JSON.parse(event.data)));
//});
