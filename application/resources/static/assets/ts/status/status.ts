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
  $grid.masonry('reloadItems')
  $grid.masonry('layout');
}, 1000);

$(document).on('mousemove', function (e) {
  var itemInfo = $('.item-info');
  itemInfo.css({
    left: e.pageX + (itemInfo.width()! + 20) > $(document).width()! ? e.pageX - (itemInfo.width()! + 20) : e.pageX - 1,
    top: e.pageY + 1
  });
});

$('.item-info').hide();

var playersMap = new Map<String, Player>();

class Player {
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
}

class InventoryItem {
  displayName!: string;
  type!: string;
  amount!: number;
  enchants: Array<string> | undefined;
}
function sendNotification(message: string) {

  var notification = $('<div>', {
    class: 'col-12 notification'
  }).text(message).hide().appendTo($(".notifications")).show("fast");

  setTimeout(function () {
    $(notification).hide("slow", function () {
      $(notification).remove();
    });
  }, 5000);
}

function updatePlayer(player: Player): Player {
  if (player.imgLink == null) {
    player.imgLink = "https://mc-heads.net/avatar/" + player.id + "/16"
  }

  if (!playersMap.has(player.id)) {
    playersMap.set(player.id, player);
    return player;
  }

  var existingPlayer = playersMap.get(player.id)!;

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

function getPlayer(player: Player): Player {
  return playersMap.get(player.id)!;
}

function onTeam(player: Player): boolean {
  if (!player) {
    return false;
  }

  return (player.team != null && (player.team === "BLUE" || player.team === "RED"));
}

function setStatus(updates: Player[]) {
  

  updates.forEach(function (player) {
    if (!onTeam(player)) {
      $("#" + player.id + "_status").remove();
    }
  });

  var players = new Array();
  
  updates.forEach(player => {
    if (player.imgLink == null) {
      player.imgLink = "https://mc-heads.net/avatar/" + player.id + "/16";
    }
    //If wasn't on team before.......
    if (!onTeam(getPlayer(player))) {
      // but is now, update
      if (onTeam(player)) {
        players.push(updatePlayer(player));
      }
    }
    else {
      players.push(player);
      updatePlayer(player);
    }
  });

  createPlayerPanels(players);
  setLocations(players);

  players.forEach(player => {
    setTeam(player);
    setClass(player);
    setName(player);
    setHealth(player);
    setArmour(player);
    setInventory(player);
    setWool(player);
    setKey(player);
    setOnline(player);
  })

  $grid.masonry('reloadItems').masonry('layout');
}

function setName(player: Player) {
  if (!player.name)
    return;

  $("#" + player.id + "_status .player-name").text(player.name);
}

function setClass(player: Player) {
  if (player.playerClass === undefined)
    return;
  $("#" + player.id + "_status .player-status-head-class").attr("src", "/assets/img/classes/" + (player.playerClass == null ? "unknown" : player.playerClass) + ".png")
  $("#" + player.id + "_location .player-head-class").attr("src", "/assets/img/classes/" + (player.playerClass == null ? "unknown" : player.playerClass) + ".png")
}

function setTeam(player: Player) {
  if (player.team === undefined) {
    return;
  }
  var panel = $("#" + player.id + "_status").find(".player-panel").removeClass("border-info border-danger");
  var head = $("#" + player.id + "_location").removeClass("border-info border-danger");
  switch (player.team) {
    case "BLUE":
      panel.addClass("border-info");
      head.addClass("border-info");
      break;
    case "RED":
      panel.addClass("border-danger");
      head.addClass("border-danger");
      break;
  }
}

function setOnline(player: Player) {
  if (player.online == null)
    return;

  var offline = $("#" + player.id + "_status").find(".offline");
  if (player.online)
    offline.hide("fast");

  else {
    offline.show("fast")
    $("#" + player.id + "_status").find(".inventory-status").removeClass("expand")
    $("#" + player.id + "_status").find(".inventory").removeClass("expand")
    $grid.masonry('reloadItems').masonry('layout');
  }
}

function setWool(player: Player) {
  if (player.wool === undefined)
    return;

  $("#" + player.id + "_location .player-head-wool")
    .attr("src", !player.wool ? ""
      : "/assets/img/minecraft/textures/item/" + player.wool + ".png");

  $("#" + player.id + "_status .wool")
    .attr("src", !player.wool ? ""
      : "/assets/img/minecraft/textures/item/" + player.wool + ".png");
}

function setKey(player: Player) {
  if (player.dungeon_key === undefined)
    return;

  var headKey = $("#" + player.id + "_location .key-container");

  var key = $("#" + player.id + "_status .key-container");
  if (player.dungeon_key == null) {
    key.hide();
    headKey.hide();
  }
  else {
    key.show();
    headKey.show();
    key.find(".key-mask").removeClass("iron gold diamond").addClass(player.dungeon_key);
    headKey.find(".key-mask").removeClass("iron gold diamond").addClass(player.dungeon_key);
  }
}

function setLocations(players: Player[]) {
  var moves = new Map<string, string | null>();
  var affectedHeadIds = new Set<string>();

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

  players.forEach(function (player) {

    var head = $("#" + player.id + "_location");

    //HEAD EXISTS, REMOVE HEAD
    if (head.length && (player.location === null || player.team === null)) {
      head.parent().children().each(function () {
        affectedHeadIds.add(this.id);
      })
      moves.set(head.attr("id")!, null);

      return;
    }

    //NOT REMOVING OR MOVING HEAD
    if (player.location === undefined) {
      return;
    }

    //HEAD ALREADY IN CORRECT LOCATION
    if (head.parent().attr('id') === player.location) {
      return;
    }
    /**********************************/

    var newLocation = $("#" + player.location);

    //HEAD EXISTS, MOVE TO NEW LOCATION
    if (head.length) {
      var currentLocation = head.parent();
      currentLocation.children().each(function () {
        affectedHeadIds.add(this.id);
      })

      moves.set(head.attr("id")!, newLocation.attr("id")!);

      newLocation.children().each(function () {
        affectedHeadIds.add(this.id);
      })
      return;
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
      src: getPlayer(player).playerClass ? ("/assets/img/classes/" + getPlayer(player).playerClass + ".png") :  "/assets/img/classes/unknown.png"
    }).hide()).append($('<img>', {
      class: 'player-head-wool',
      src: !player.wool ? ""
        : "/assets/img/minecraft/textures/item/" + player.wool + ".png"
    })).append(key.addClass("player-head-key"));
    head.appendTo(newLocation);


    newLocation.children().each(function () {
      affectedHeadIds.add(this.id);
    })

    $("#" + player.id + "_status").on('mouseenter', function () {
      head.addClass("grow");
    }).on('mouseleave', function () {
      head.removeClass("grow");
    })

    $("#" + player.id + "_status").on('mouseenter', function () {
      $("#" + player.id + "_location .player-head-class").show("fast");
    }).on('mouseleave', function () {
      $("#" + player.id + "_location .player-head-class").hide("fast");
    })
  });


  affectedHeadIds.forEach(function (headId) {
    var head = $("#" + headId);
    if (!moves.has(headId)) {
      moves.set(headId, head.parent().attr("id")!);
    }
  });
  moveTo(moves);

  function moveTo(heads: Map<string, string | null>) {
    var tops = new Map<string, string>();
    var lefts = new Map<string, string>();

    heads.forEach(function (location, head) {
      var headElement = $("#" + head)
      var map = headElement.parent();
      var border = parseFloat(headElement.css("borderTop"));
      var parentWidth = headElement.parent()[0].getBoundingClientRect().width
      var top = (((headElement.offset()!.top - map.offset()!.top) - border) / parentWidth) * 100 + "%";
      var left = (((headElement.offset()!.left - map.offset()!.left) - border) / parentWidth) * 100 + "%";

      tops.set(head, top);
      lefts.set(head, left);
    });

    heads.forEach(function (locationId, headId) {
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

function setHealth(player: Player) {
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
    $("#" + player.id + "_status .death-overlay").fadeIn(0).delay(1500).fadeOut(1500);
  }
}

function setArmour(player: Player) {
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

function setInventory(player: Player) {
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

function createPlayerPanels(players: Array<Player>) {
  var playerPanels: JQuery<HTMLElement> = $('<div>', {
    class: "panels_temp",
  });

  players.forEach(function (player) {
    //IF PANEL ALREADY EXISTS, RETURN
    if ($("#" + player.id + "_status").length)
      return;

    //IF PLAYER ISN'T ON RED/BLUE TEAM, RETURN
    if (getPlayer(player).team !== "BLUE" && getPlayer(player).team !== "RED")
      return;

    var gridItem = $('<div>', {
      id: player.id + "_status",
      class: 'col-12 col-md-6 col-lg-12 col-xxl-6 grid-item player-grid-item'
    });

    var panel = $('<div>', {
      class: 'player-panel p-3 border border-5'
    }).appendTo(gridItem)
      .addClass(player.team === "BLUE" ? "border-info"
        : player.team === "RED" ? "border-danger" : "");

    //WOOL
    $('<img>', {
      class: 'wool'
    }).appendTo(panel);

    //KEY
    panel.append($('<div>', {
      class: 'key-container'
    }).hide().append($('<div>', {
      class: 'key'
    }).append($('<div>', {
      class: 'key-mask'
    }))));

    var mainRow = $('<div>', {
      class: 'row'
    }).appendTo(panel);

    //DEATH OVERLAY
    panel.append($('<div>', {
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


    $(panel).on('mouseenter', function () {
      statusHeadClass.show("fast");
    }).on('mouseleave', function () {
      statusHeadClass.hide("fast");
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

    panel.on('click', function () {
      if ($("#" + player.id + "_status").find(".offline").is(":hidden")) {
        $(inventoryCol).toggleClass("expand")
        $(inventory).toggleClass("expand")
        $grid.masonry('reloadItems').masonry('layout');
      }
    });

    playerPanels.append(gridItem);
  });


  $grid.append(playerPanels.children()).masonry('appended', playerPanels.children()).masonry('layout');
}

enum EVENT {
  PICKUP,
  DROP,
  CAPTURE
}
class GameEvent {
  entity!: string;
  status!: string;
  data!: string;
}

function handleGameEvent(event: GameEvent) {
  switch (event.status) {
    case "DROP":
      if (event.entity.endsWith("wool")) {
        $(".dungeon-wool." + event.data)
          .hide()
          .attr("src", "/assets/img/minecraft/textures/item/" + event.entity + ".png")
          .attr("id", "dungeon_" + event.entity)
          .show("slow");
      }
      else if (event.entity.endsWith("key")) {
        $(".dungeon-key." + event.entity.replace("-key", "")).show("slow")
      }
      else if (event.entity.endsWith("lock")) {
        $(".dungeon-lock." + event.entity.replace("-lock", "")).show("slow")
      }


      break;

    case "PICKUP":
      if (event.entity.endsWith("wool")) {
        $("#dungeon_" + event.entity).hide("slow");
      }
      else if (event.entity.endsWith("key")) {
        $(".dungeon-key." + event.entity.replace("-key", "")).hide("slow")
      }
      break;

    case "CAPTURE":
      var team = event.data;
      if (event.entity.endsWith("wool")) {
        for (var i = 1; i <= 3; i++) {
          var monument = $(".monument-wool." + team + "-wool-" + i);
          if (monument.data("wool") === event.entity) {
            return;
          }
          else if (!monument.data("wool")){
            monument.hide().attr("src", "/assets/img/minecraft/textures/item/" + event.entity + ".png").data("wool", event.entity).show("slow");
            return;
          }
        }
        $("#dungeon_" + event.entity).show("slow");
      }

      if (event.entity.endsWith("lock")) {
        $(".dungeon-lock." + event.entity.replace("-lock", "")).hide("slow")
      }
      else if (event.entity.endsWith("key")) {
        $(".dungeon-key." + event.entity.replace("-key", "")).hide("slow")
      }
      break;

    default:
      console.log("invalid event type: " + event.status);
  }
}

function clear() {
  $(".grid-item").each(function () {
    this.remove();
  })
  $(".player-head-wrapper").each(function () {
    this.remove();
  })

  $(".monument-wool").each(function () {
    (this as HTMLImageElement).removeAttribute('src');
  })

  $(".dungeon-lock").each(function () {
    $(this).show();
  })

  $(".dungeon-key").each(function () {
    $(this).show();
  })

}

var playerSource: EventSource;
var notificationSource: EventSource;
var eventSource: EventSource;

if (window.EventSource != null) {
  setListeners();
}
else {
  alert("The browser does not support Server-Sent Events");
}

function setListeners() {
  //PLAYERS
  playerSource = new EventSource("/ctw/status/sse");
  playerSource.onopen = function () {
    console.log("connection is established");
  };
  playerSource.onerror = function (error) {
    console.log("connection state: " + playerSource.readyState + ", error: " + event);
  };

  playerSource.onmessage = function (event) {
    if (event.data == "clear")
      clear();
    else
      setStatus(([] as Player[]).concat(JSON.parse(event.data)));
  };


  //NOTIFICATIONS
  notificationSource = new EventSource("/ctw/status/sse/notification");
  notificationSource.onopen = function () {
    console.log("notification connection is established");
  };
  notificationSource.onerror = function (error) {
    console.log("notification connection state: " + notificationSource.readyState + ", error: " + event);
  };

  notificationSource.onmessage = function (event) {
    sendNotification(event.data);
  };

  //EVENTS
  eventSource = new EventSource("/ctw/status/sse/event");
  eventSource.onopen = function () {
    console.log("game event connection is established");
  };
  eventSource.onerror = function (error) {
    console.log("game event connection state: " + eventSource.readyState + ", error: " + event);
  };

  eventSource.onmessage = function (event) {
    var events = JSON.parse(event.data);

    if (Array.isArray(events))
      events.forEach(gameEvent => handleGameEvent(gameEvent));
    else
      handleGameEvent(events);
  };
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    playerSource.close();
    eventSource.close();
    notificationSource.close();
  } else {
    //location.reload();
    setListeners();
  }
});