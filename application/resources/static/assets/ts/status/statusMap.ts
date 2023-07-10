import { Player } from "./models.js";
import { SSEListener } from "./sseListener.js";

export class StatusMap {
  constructor() {
    new SSEListener("players", (event: MessageEvent<any>) => {
      var updates = Player.fromJSON(JSON.parse(event.data));
      var players = new Array();

      updates.forEach(player => {
        //If wasn't on team before.......
        if (Player.getPlayer(player) && !Player.getPlayer(player).onTeam()) {
          // but is now, full update
          if (player.onTeam()) {
            players.push(Player.updatePlayer(player));
          }
        }
        //Otherwise, partial update
        else {
          players.push(player);
          Player.updatePlayer(player);
        }
      });

      this.updatePlayers(players);
    });
  }

  public clear() {
    $(".player-head-wrapper").remove();
    $(".headPlaceholder").remove();

    $(".monument-wool").each(function () {
      (this as HTMLImageElement).removeAttribute('src');
    })

    $(".dungeon-lock").show();

    $(".dungeon-key").show();
  }

  public dropWool(location: string, wool: string) {
    $(".dungeon-wool." + location)
      .hide()
      .attr("src", "/assets/img/minecraft/textures/item/" + wool + ".png")
      .attr("id", "dungeon_" + wool)
      .show("slow");
  };

  public dropKey(key: string) {
    $(".dungeon-key." + key.replace("-key", "")).show("slow")
  };

  public lockDungeon(dungeon: string) {
    $(".dungeon-lock." + dungeon.replace("-lock", "")).show("slow")
  }

  public unlockDungeon(dungeon: string) {
    $(".dungeon-lock." + dungeon.replace("-lock", "")).hide("slow")
  }

  public pickupWool(wool: string) {
    $("#dungeon_" + wool).hide("slow");
  };

  public pickupKey(key: string) {
    $(".dungeon-key." + key.replace("-key", "")).hide("slow")
  };

  public insertKey(key: string) {
    $(".dungeon-key." + key.replace("-key", "")).hide("slow")
  };

  public captureWool(team: string, wool: string) {
    for (var i = 1; i <= 3; i++) {
      var monument = $(".monument-wool." + team + "-wool-" + i);
      if (monument.data("wool") === wool) {
        return;
      }
      else if (!monument.data("wool")) {
        monument.hide().attr("src", "/assets/img/minecraft/textures/item/" + wool + ".png").data("wool", wool).show("slow");
        return;
      }
    }
    $("#dungeon_" + wool).show("slow");
  };

  private getHead(player: Player): JQuery<HTMLElement> | null {
    var head = $(this.getHeadId(player));
    if (!head.length)
      return null;

    return head;
  }

  private getHeadId(player: Player): string {
    return "#" + player.id + "_location";
  }

  public updatePlayers(players: Array<Player>) {
    this.setLocations(players);
    players.forEach(player => {
      this.updatePlayer(player);
    })
  }

  public updatePlayer(player: Player) {
    this.setClass(player);
    this.setTeam(player);
    this.setWool(player);
    this.setKey(player);
  }

  private setClass(player: Player) {
    if (player.playerClass === undefined)
      return;

    $("#" + player.id + "_location .player-head-class").attr("src", "/assets/img/classes/" + (player.playerClass == null ? "unknown" : player.playerClass) + ".png")
  }

  private setTeam(player: Player) {
    if (player.team === undefined) {
      return;
    }

    var head = $("#" + player.id + "_location").removeClass("border-info border-danger");
    switch (player.team) {
      case "BLUE":
        head.addClass("border-info");
        break;
      case "RED":
        head.addClass("border-danger");
        break;
    }
  }

  private setWool(player: Player) {
    if (player.wool === undefined)
      return;

    $("#" + player.id + "_location .player-head-wool")
      .attr("src", !player.wool ? ""
        : "/assets/img/minecraft/textures/item/" + player.wool + ".png");
  }

  private setKey(player: Player) {
    if (player.dungeon_key === undefined)
      return;

    var headKey = $("#" + player.id + "_location .key-container");

    if (player.dungeon_key == null) {
      headKey.hide();
    }
    else {
      headKey.find(".key-mask").removeClass("iron gold diamond").addClass(player.dungeon_key);
      headKey.show();
    }

  }

  private setLocations(players: Player[]) {
    var moves = new Map<string, string | null>();
    var affectedHeadIds = new Set<string>();

    //REMOVE EXISTING PLACEHOLDERS (INCASE IT'S BUGGED)
    $(".headPlaceholder").remove();

    function getPlaceholder(id: string): JQuery<HTMLElement> {
      return $('<div>', {
        id: id,
        class: 'player-head-wrapper headPlaceholder'
      });
    };

    function setPlaceholderWidths(location: JQuery<HTMLElement>) {
      const SMALL = "29%"
      const MEDIUM = "35%"
      const LARGE = "50%"
      var children = location.find(".headPlaceholder");
      var width = SMALL;
      if (children.length <= 1)
        width = LARGE;
      else if (children.length <= 4)
        width = MEDIUM;

      children.width(width);
    }


    for (var player of players) {
      var newLocation = $("#" + player.location);
      var head = this.getHead(player);

      if (head != null) {
        //NOT REMOVING OR MOVING HEAD
        if (player.location === undefined) {
          continue;
        }
        //HEAD EXISTS, REMOVE HEAD
        if ((player.location === null || player.team === null)) {
          head.parent().children().each(function () {
            affectedHeadIds.add(this.id);
          })
          moves.set(head.attr("id")!, null);

          continue;
        }


        //HEAD ALREADY IN CORRECT LOCATION
        if (head.parent().attr('id') === player.location) {
          continue;
        }
        /**********************************/


        //HEAD EXISTS, MOVE TO NEW LOCATION
        var currentLocation = head.parent();
        currentLocation.children().each(function () {
          affectedHeadIds.add(this.id);
        })

        moves.set(head.attr("id")!, newLocation.attr("id")!);

        newLocation.children().each(function () {
          affectedHeadIds.add(this.id);
        })
        continue;
      }

      //INSERT NEW HEAD
      var key = $('<div>', {
        class: 'key-container'
      }).hide().append($('<div>', {
        class: 'key'
      }).append($('<div>', {
        class: 'key-mask'
      }).addClass(player.dungeon_key ? player.dungeon_key : "")));

      head = $('<div>', {
        id: player.id + "_location",
        class: 'player-head-wrapper border border-3',
        css: {
          opacity: 0,
          position: "absolute"
        }
      }).append($('<img>', {
        class: 'player-head h-100',
        src: player.imgLink
      })).append($('<img>', {
        class: 'player-head-class',
        src: Player.getPlayer(player).playerClass ? ("/assets/img/classes/" + Player.getPlayer(player).playerClass + ".png") : "/assets/img/classes/unknown.png"
      }).hide()).append($('<img>', {
        class: 'player-head-wool',
        src: !player.wool ? ""
          : "/assets/img/minecraft/textures/item/" + player.wool + ".png"
      })).append(key.addClass("player-head-key"));

      head.appendTo(newLocation);

      newLocation.children().each(function () {
        affectedHeadIds.add(this.id);
      })

    }


    affectedHeadIds.forEach(function (headId) {
      var head = $("#" + headId);
      if (!moves.has(headId)) {
        moves.set(headId, head.parent().attr("id")!);
      }
    });
    moveTo(moves);

    function moveTo(moves: Map<string, string | null>) {
      var tops = new Map<string, string>();
      var lefts = new Map<string, string>();

      moves.forEach(function (location, headId) {
        var headElement = $("#" + headId);
        var currentLocation = headElement.parent();
        var border = parseFloat(headElement.css("borderTop"));
        var parentWidth = currentLocation[0].getBoundingClientRect().width
        var top = (((headElement.offset()!.top - currentLocation.offset()!.top) - border) / parentWidth) * 100 + "%";
        var left = (((headElement.offset()!.left - currentLocation.offset()!.left) - border) / parentWidth) * 100 + "%";

        tops.set(headId, top);
        lefts.set(headId, left);
      });

      moves.forEach(function (locationId, headId) {
        var head = $("#" + headId);

        var location = locationId ? $("#" + locationId) : null;

        //Stamp in place
        head.css({
          position: "absolute",
          top: tops.get(headId)!,
          left: lefts.get(headId)!,
        });


        if (!location) {
          head.delay(10).hide(300, function () {
            this.remove();
          })
        }

        else {
          //Insert a placeholder
          var placeholder = getPlaceholder(head.attr("id")!);
          location.append(placeholder);
          setPlaceholderWidths(location);

          //Move head to placeholder
          head.delay(10).queue(function () {
            setPlaceholderWidths(location!);
            var left = placeholder.offset()!.left - head.offset()!.left;
            var top = placeholder.offset()!.top - head.offset()!.top

            head.animate({
              top: "+=" + top,
              left: "+=" + left,
              width: (placeholder[0].getBoundingClientRect().width / location![0].getBoundingClientRect().width) * 100 + "%",
              opacity: "100%"
            }, 300, function () {
              head.css({
                position: "",
                top: "",
                left: "",
                margin: "",
                opacity: ""
              })
              placeholder.replaceWith(head);
            })
            head.dequeue();
          });
        }
      });
    }
  }

  listener = new SSEListener("event", (event: MessageEvent<any>) => {
    var events = JSON.parse(event.data);

    if (Array.isArray(events))
      events.forEach(gameEvent => this.handleGameEvent(gameEvent));
    else
      this.handleGameEvent(events);
  });

  private handleGameEvent(event: GameEvent) {
    var entity = event.entity;
    switch (event.status) {
      case "DROP":
        if (entity.endsWith("wool"))
          this.dropWool(event.data, entity);
        else if (entity.endsWith("key"))
          this.dropKey(entity);
        else if (entity.endsWith("lock"))
          this.lockDungeon(entity);
        break;

      case "PICKUP":
        if (entity.endsWith("wool"))
          this.pickupWool(event.data);
        else if (entity.endsWith("key"))
          this.pickupKey(entity);
        break;

      case "CAPTURE":
        var team = event.data;
        if (entity.endsWith("wool"))
          this.captureWool(team, entity);
        if (entity.endsWith("lock"))
          this.unlockDungeon(entity);
        else if (entity.endsWith("key"))
          this.insertKey(entity);
        break;

      default:
        console.log("invalid event type: " + event.status);
    }
  }
}

class GameEvent {
  entity!: string;
  status!: string;
  data!: string;
}