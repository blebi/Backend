export class Player {
    constructor(json) {
        this.id = json.id;
        this.name = json.name;
        this.armour = json.armour;
        this.health = json.health;
        this.maxHealth = json.maxHealth;
        this.location = json.location;
        this.inventory = json.inventory;
        this.team = json.team;
        this.imgLink = json.imgLink;
        this.playerClass = json.playerClass;
        this.wool = json.wool;
        this.dungeon_key = json.dungeon_key;
        this.online = json.online;
        this.dead = json.dead;
        if (this.imgLink == null) {
            this.imgLink = "https://mc-heads.net/avatar/" + this.id + "/16";
        }
    }
    static fromJSON(json) {
        var players = new Array();
        if (Array.isArray(json)) {
            json.forEach(function (playerJson) {
                players.push(new Player(playerJson));
            });
        }
        else {
            players.push(new Player(json));
        }
        return players;
    }
    static getPlayer(player) {
        return Player.playersMap.get(player.id);
    }
    onTeam() {
        return (this.team != null && (this.team === "BLUE" || this.team === "RED"));
    }
    static updatePlayer(player) {
        if (player.imgLink == null) {
            player.imgLink = "https://mc-heads.net/avatar/" + player.id + "/16";
        }
        if (!Player.playersMap.has(player.id)) {
            Player.playersMap.set(player.id, player);
            return player;
        }
        var existingPlayer = Player.playersMap.get(player.id);
        if (player.name !== undefined)
            existingPlayer.name = player.name;
        if (player.health !== undefined)
            existingPlayer.health = player.health;
        if (player.maxHealth !== undefined)
            existingPlayer.maxHealth = player.maxHealth;
        if (player.location !== undefined)
            existingPlayer.location = player.location;
        if (player.inventory !== undefined)
            existingPlayer.inventory = player.inventory;
        if (player.team !== undefined)
            existingPlayer.team = player.team;
        if (player.imgLink !== undefined)
            existingPlayer.imgLink = player.imgLink;
        if (player.playerClass !== undefined)
            existingPlayer.playerClass = player.playerClass;
        if (player.wool !== undefined)
            existingPlayer.wool = player.wool;
        if (player.dungeon_key !== undefined)
            existingPlayer.dungeon_key = player.dungeon_key;
        if (player.online !== undefined)
            existingPlayer.online = player.online;
        if (player.dead !== undefined)
            existingPlayer.dead = player.dead;
        return existingPlayer;
    }
}
Player.playersMap = new Map();
export class InventoryItem {
}
(() => {
    $(document).on('mousemove', function (e) {
        var itemInfo = $('.item-info');
        itemInfo.css({
            left: e.pageX + (itemInfo.width() + 20) > $(document).width() ? e.pageX - (itemInfo.width() + 20) : e.pageX - 1,
            top: e.pageY + 1
        });
    });
    $('.item-info').hide();
})();
;
