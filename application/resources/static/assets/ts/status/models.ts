export class Player {
  id!: string;
  name: string | undefined;
  armour: number | undefined;
  health: number | undefined;
  maxHealth: number | undefined;
  location: string | undefined;
  inventory: Array<InventoryItem> | undefined;
  team!: string;
  imgLink: string | undefined;
  playerClass: string | undefined;
  wool: string | undefined;
  dungeon_key: string | undefined;
  online: boolean | undefined;
  dead: boolean | undefined;

  static playersMap = new Map<String, Player>();

  public constructor(json: any) {

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

  public static fromJSON(json: any): Array<Player> {
    var players = new Array<Player>();
    if (Array.isArray(json)) {
      json.forEach(function (playerJson: any) {
        players.push(new Player(playerJson));
      })
    }
    else {
      players.push(new Player(json));
    }
    return players;
  }


  public static getPlayer(player: Player) {
    return Player.playersMap.get(player.id)!;
  }

  public onTeam() {
    return (this.team != null && (this.team === "BLUE" || this.team === "RED"));
  }


  public static updatePlayer(player: Player): Player {
    if (player.imgLink == null) {
      player.imgLink = "https://mc-heads.net/avatar/" + player.id + "/16"
    }

    if (!Player.playersMap.has(player.id)) {
      Player.playersMap.set(player.id, player);
      return player;
    }

    var existingPlayer = Player.playersMap.get(player.id)!;

    if (player.name !== undefined)
      existingPlayer.name = player.name
    if (player.health !== undefined)
      existingPlayer.health = player.health
    if (player.maxHealth !== undefined)
      existingPlayer.maxHealth = player.maxHealth
    if (player.location !== undefined)
      existingPlayer.location = player.location
    if (player.inventory !== undefined)
      existingPlayer.inventory = player.inventory
    if (player.team !== undefined)
      existingPlayer.team = player.team
    if (player.imgLink !== undefined)
      existingPlayer.imgLink = player.imgLink
    if (player.playerClass !== undefined)
      existingPlayer.playerClass = player.playerClass
    if (player.wool !== undefined)
      existingPlayer.wool = player.wool
    if (player.dungeon_key !== undefined)
      existingPlayer.dungeon_key = player.dungeon_key
    if (player.online !== undefined)
      existingPlayer.online = player.online
    if (player.dead !== undefined)
      existingPlayer.dead = player.dead

    return existingPlayer;
  }
}

export class InventoryItem {
  displayName!: string;
  type!: string;
  amount!: number;
  enchants: Array<string> | undefined;

  static {
    $(document).on('mousemove', function (e) {
      var itemInfo = $('.item-info');
      itemInfo.css({
        left: e.pageX + (itemInfo.width()! + 20) > $(document).width()! ? e.pageX - (itemInfo.width()! + 20) : e.pageX - 1,
        top: e.pageY + 1
      });
    });
    $('.item-info').hide();
  }
};
