import { SSEListener } from "./sseListener.js";
import { StatusMap } from "./statusMap.js";
var map = new StatusMap();
//function setStatus(updates: Player[]) {
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
//  map.updatePlayers(players);
//}
//new SSEListener("players", (event: MessageEvent<any>) => {
//    setStatus(Player.fromJSON(JSON.parse(event.data)));
//});
new SSEListener("clear", () => {
    map.clear();
});
