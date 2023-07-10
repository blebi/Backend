import { InventoryItem, Player } from "./models.js";
import { SSEListener } from "./sseListener.js";

export class PlayerPanel {

  private static panels: Map<String, PlayerPanel> = new Map<String, PlayerPanel>();

  private panel: JQuery<HTMLElement>;
  private playerID: string;
  private static $grid: JQuery<HTMLElement> | undefined;

  static {
    new SSEListener("players", (event: MessageEvent<any>) => {
      PlayerPanel.updatePanels(Player.fromJSON(JSON.parse(event.data)));
    });
  }

  private static updatePanels(updates: Player[]) {
    updates.forEach(function (player) {
      if (!player.onTeam() && PlayerPanel.hasPanel(player)) {
        PlayerPanel.getPanel(player).remove();
      }
    });

    var players = new Array();

    updates.forEach(player => {
      //If wasn't on team before.......
      if (Player.getPlayer(player) && !Player.getPlayer(player).onTeam()) {
        // but is now, full update
        if (player.onTeam()) {
          console.log("full update");
          players.push(Player.updatePlayer(player));
        }
      }
      //Otherwise, partial update
      else {
        players.push(player);
        Player.updatePlayer(player);
      }
    });

    //Generate panels
    var playerPanels: JQuery<HTMLElement> = $('<div>', {
      class: "panels_temp",
    });

    players.forEach(player => {
      if (!PlayerPanel.hasPanel(player)) {
          playerPanels.append(PlayerPanel.getPanel(player).panel);
      }
      PlayerPanel.getPanel(player).update(player);
    });

    playerPanels = playerPanels.children();
    if (playerPanels) {
      //Append panels to grid
      if (PlayerPanel.$grid && !playerPanels.hasClass("panels_temp")) {
        PlayerPanel.$grid.append(playerPanels)
          //.masonry("appended", playerPanels!);
      }
    }
  }

  public static setGrid($grid: JQuery<HTMLElement>) {
    PlayerPanel.$grid = $grid;
  }

  public static clear() {
    this.panels.forEach(element => {
      element.remove();
    });
    this.panels.clear();
  }

  //TODO must be a better way of doing this
  public static getAllPanels() {
    var playerPanels: JQuery<HTMLElement> = $('<div>', {
      class: "panels_temp",
    });

    this.panels.forEach(function (panel) {
      playerPanels.append(panel.panel);
    });

    return playerPanels.children();
  }

  public static hasPanel(player: Player): boolean {
    return this.panels.has(player.id);
  }
  public static getPanel(player: Player): PlayerPanel {
    var playerPanel = this.panels.get(player.id);
    if (playerPanel)
      return playerPanel;
    else
      return new PlayerPanel(player);
  }

  public remove() {
    this.panel.remove();
    PlayerPanel.panels.delete(this.playerID);
  }

  public update(update: Player) {
    this.setName(update);
    this.setOnline(update);
    this.setArmour(update);
    this.setHealth(update);
    this.setInventory(update);
    this.setTeam(update);
    this.setWool(update);
    this.setKey(update);
    this.setClass(update);
  }

  private setClass(player: Player) {
    if (player.playerClass === undefined)
      return;

    this.panel.find(".player-status-head-class").attr("src", "/assets/img/classes/" + (player.playerClass == null ? "unknown" : player.playerClass) + ".png")
  }

  private setKey(player: Player) {
    if (player.dungeon_key === undefined)
      return;

    var key = this.panel.find(".key-container");
    if (player.dungeon_key == null) {
      key.hide();
    }
    else {
      key.find(".key-mask").removeClass("iron gold diamond").addClass(player.dungeon_key);
      key.show();
    }
  }

  private setWool(player: Player) {
    if (player.wool === undefined)
      return;

    this.panel.find(".wool")
      .attr("src", !player.wool ? ""
        : "/assets/img/minecraft/textures/item/" + player.wool + ".png");
  }

  private setTeam(player: Player) {
    if (player.team === undefined) {
      return;
    }
    var innerPanel = this.panel.find(".player-panel").removeClass("border-info border-danger");
    switch (player.team) {
      case "BLUE":
        innerPanel.addClass("border-info");
        break;
      case "RED":
        innerPanel.addClass("border-danger");
        break;
    }
  }

  private setHealth(player: Player) {
    if (player.health == null)
      return;

    var hearts = $("#" + player.id + "_health img");

    var i = 1;
    hearts.each(function () {
      if (player.health == null)
        return;

      if (player.health >= i * 2 + 20)
        this.setAttribute("src", "/assets/img/heart_2.png");
      else if (player.health == i * 2 + 19)
        this.setAttribute("src", "/assets/img/half_heart_2.png");
      else if (player.health >= i * 2)
        this.setAttribute("src", "/assets/img/heart.png");
      else if (player.health == i * 2 - 1)
        this.setAttribute("src", "/assets/img/half_heart.png");
      else if (player.maxHealth != null && player.maxHealth < i * 2 - 1)
        this.setAttribute("src", "");
      else
        this.setAttribute("src", "/assets/img/empty_heart.png");

      i++;
    });

    if (player.dead) {
      this.panel.find(".death-overlay").fadeIn(0).delay(1500).fadeOut(1500);
    }
  }

  private setArmour(player: Player) {
    if (player.armour == null)
      return;

    var i = 1;

    $("#" + player.id + "_armour img").each(function () {
      if (player.armour == null)
        return;
      if (player.armour >= i * 2)
        this.setAttribute("src", "/assets/img/armour.png");
      else if (player.armour == i * 2 - 1)
        this.setAttribute("src", "/assets/img/half_armour.png");
      else
        this.setAttribute("src", "/assets/img/empty_armour.png");

      i++;
    });
  }


  private setInventory(player: Player) {
    if (!player.inventory)
      return;

    var i = 0;
    $("#" + player.id + "_hotbar .inventory-item").each(function () {
      setItem(this, player.inventory![i]);
      i++;
    });

    $("#" + player.id + "_inventory .inventory-item").each(function () {
      setItem(this, player.inventory![i]);
      i++;
    });

    function setItem(element: HTMLElement, item: InventoryItem) {
      if (!item || item.type === "air") {
        $(element).find("img").attr("src", "");
        $(element).find(".hoverbox").data("name", "");
        $(element).find(".item-number").text("");
      }
      else {
        $(element).find("img").attr("src", "/assets/img/minecraft/textures/item/" + item.type + ".png");
        $(element).find(".hoverbox").data("name", item.displayName);
        if (item.amount == 1) {
          $(element).find(".item-number").text("");
        }
        else {
          $(element).find(".item-number").text(item.amount);
        }
      }
    }
  }

  private setOnline(player: Player) {
    if (player.online == null)
      return;

    var offline = this.panel.find(".offline");
    if (player.online)
      offline.hide("fast");

    else {
      offline.show("fast")
      this.panel.find(".inventory-status").removeClass("expand")
      this.panel.find(".inventory").removeClass("expand")
      //$grid.masonry('reloadItems').masonry('layout');
    }
  }

  private setName(player: Player) {
    if (!player.name)
      return;

    this.panel.find(".player-name").text(player.name);
  }

  private constructor(player: Player) {
    this.playerID = player.id;
    this.panel = $('<div>', {
      id: player.id + "_status",
      class: 'col-12 col-md-6 col-lg-12 col-xxl-6 grid-item player-grid-item'
    });

    PlayerPanel.panels.set(player.id, this);

    var innerPanel = $('<div>', {
      class: 'player-panel p-3 border border-5'
    }).appendTo(this.panel)
      .addClass(player.team === "BLUE" ? "border-info"
        : player.team === "RED" ? "border-danger" : "");

    //WOOL
    $('<img>', {
      class: 'wool'
    }).appendTo(innerPanel);

    //KEY
    innerPanel.append($('<div>', {
      class: 'key-container'
    }).hide().append($('<div>', {
      class: 'key'
    }).append($('<div>', {
      class: 'key-mask'
    }))));

    var mainRow = $('<div>', {
      class: 'row'
    }).appendTo(innerPanel);

    //DEATH OVERLAY
    innerPanel.append($('<div>', {
      class: "death-overlay"
    }).text("DEAD").css("display", "none"));


    //PLAYER HEAD
    var headCol = $('<div>', {
      class: 'col-3 player-status-head-column'
    }).appendTo(mainRow);

    var statusHead = $('<img>', {
      class: 'player-status-head',
      src: player.imgLink
    }).appendTo(headCol);

    var statusHeadClass = $('<img>', {
      class: 'player-status-head-class',
      src: "/assets/img/classes/unknown.png"
    }).hide().appendTo(headCol);


    $(innerPanel).on('mouseenter', () => {
      statusHeadClass.show("fast");
      $("#" + player.id + "_location").addClass("grow");
      $("#" + player.id + "_location .player-head-class").show("fast");
    }).on('mouseleave', function () {
      statusHeadClass.hide("fast");
      $("#" + player.id + "_location").removeClass("grow");
      $("#" + player.id + "_location .player-head-class").hide("fast");
    })

    var statusCol = $('<div>', {
      class: 'col-9 stat-bar align-self-center'
    }).appendTo(mainRow);

    var statusRow = $('<div>', {
      class: 'row'
    }).appendTo(statusCol);


    //OFFLINE OVERLAY
    $('<div>', {
      class: 'offline'
    }).text("OFFLINE").appendTo(statusCol);


    //PLAYER NAME
    $('<h1>', {
      class: 'col-12 status-col player-name'
    }).text(player.name ? player.name : "").appendTo(statusRow);

    //ARMOUR
    var armourCol = $('<div>', {
      id: player.id + "_armour",
      class: 'col-12 status-col align-items-end h-50'
    }).appendTo(statusRow);

    var armour = $('<img>', {
      class: 'player-health',
      src: "/assets/img/empty_armour.png"
    });

    for (var i = 0; i < 10; i++) {
      armourCol.append(armour.clone())
    };

    //HEALTH
    var healthCol = $('<div>', {
      id: player.id + "_health",
      class: 'col-12 status-col h-50'
    }).appendTo(statusRow);

    var heart = $('<img>', {
      class: 'player-health',
      src: "/assets/img/empty_heart.png"
    });

    for (var i = 0; i < 10; i++) {
      healthCol.append(heart.clone())
    };

    //INVENTORY
    var inventoryCol = $('<div>', {
      class: 'col-12 pt-2 inventory-status'
    }).appendTo(statusRow);

    var inventory = $('<div>', {
      class: 'inventory'
    }).appendTo(inventoryCol);

    var inventoryGrid = $('<div>', {
      class: 'inventory-grid',
      id: player.id + "_inventory"
    }).appendTo(inventory);

    var slot = $('<div>', {
      class: 'inventory-item'
    }).append($('<img>', {
      class: 'h-100 pixelated'
    })).append($('<div>', {
      class: 'item-number'
    })).append($('<div>', {
      class: 'hoverbox'
    }).on('mouseenter', function () {
      if ($(this).data("name")) {
        $('.item-info p').text($(this).data("name"))
        $('.item-info').show();
      }
    }).on('mouseleave', function () {
      $('.item-info').hide();
    }));

    for (let i = 0; i < 27; i++) {
      inventoryGrid.append(slot.clone(true));
    }

    var hotbarGrid = $('<div>', {
      class: 'hotbar-grid',
      id: player.id + "_hotbar"
    }).appendTo(inventory);

    for (let i = 0; i < 9; i++) {
      hotbarGrid.append(slot.clone(true));
    }

    innerPanel.on('click', () => {
      if ($("#" + player.id + "_status").find(".offline").is(":hidden")) {
        $(inventoryCol).toggleClass("expand")
        $(inventory).toggleClass("expand")
        if (PlayerPanel.$grid)
          PlayerPanel.$grid.masonry('reloadItems').masonry('layout');
      }
    });
  }
}