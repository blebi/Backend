package server.controllers.status;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import net.minidev.json.JSONArray;
import net.minidev.json.JSONObject;
import server.configs.WebSecurityConfig;
import server.controllers.SseEmitters;
import server.models.GameStatus;
import server.models.Player;
import server.models.Player.Location;
import server.services.GameStatusService;
import server.services.PlayerService;

@Controller
@Transactional
@RequestMapping("/ctw/status")
public class StatusController {
  private final SseEmitters playerEmitters = new SseEmitters();
  private final SseEmitters notificationEmitters = new SseEmitters();
  private final SseEmitters eventEmitters = new SseEmitters();
  private final SseEmitters clearEmitters = new SseEmitters();

  @Autowired
  private PlayerService playerService;

  @Autowired
  private GameStatusService gameStatusService;


  @GetMapping("/")
  String getStatus(Model model) {
    Location[][] locations = Player.locations;
    model.addAttribute("locations", locations);
    return "status/status";
  }

  @GetMapping("/map")
  String getMap(Model model) {
    Location[][] locations = Player.locations;
    model.addAttribute("locations", locations);
    return "status/map";
  }

  @GetMapping("/players")
  String getPlayers(Model model) {
    return "status/players";
  }

  @GetMapping("/notifications")
  String getNotifications(Model model) {
    return "status/notifications";
  }

  @Transactional
  @GetMapping("/update/clear")
  @ResponseBody
  String clearPlayers() {
    System.out.println("CLEAR");
    playerService.clear();
    gameStatusService.clear();
    clearEmitters.send("clear");
    WebSecurityConfig.updatePasscode();
    return "cleared";
  }

  @Transactional
  @GetMapping("/sse/players")
  SseEmitter getSSEPlayers() {
    SseEmitter emitter = playerEmitters.add();
    if (!playerService.getPlayers().isEmpty()) {
      playerEmitters.send(playerService.getPlayers());
    }
    return emitter;
  }

  @Transactional
  @GetMapping("/sse/event")
  SseEmitter getSSEGameEvent() {
    SseEmitter emitter = eventEmitters.add();
    if (!gameStatusService.getGameStatus().isEmpty()) {
      eventEmitters.send(gameStatusService.getGameStatus());
    }
    return emitter;
  }

  @GetMapping("/sse/notification")
  SseEmitter getSSENotifications() {
    SseEmitter emitter = notificationEmitters.add();
    return emitter;
  }

  @GetMapping("/sse/clear")
  SseEmitter getClear() {
    SseEmitter emitter = clearEmitters.add();
    return emitter;
  }

  @Transactional
  @PostMapping("/update/player")
  @ResponseBody
  Player postPlayer(@RequestBody Player player, HttpServletResponse response) {
    if (!playerService.hasPlayer(player)) {
      response.setStatus(201);
    }

    player = playerService.savePlayer(player);
    playerEmitters.send(player);
    player.setDead(false);
    return playerService.savePlayer(player);
  }

  @Transactional
  @PatchMapping("/update/player")
  @ResponseBody
  Player patchPlayer(@RequestBody JSONObject playerJSON, HttpServletResponse response)
      throws JsonMappingException, JsonProcessingException {
    ObjectMapper objectMapper = new ObjectMapper();
    Player player;
    UUID id = UUID.fromString(playerJSON.getAsString("id"));

    playerEmitters.send(playerJSON);
    if (!playerService.hasPlayer(id)) {
      response.setStatus(201);
      player = objectMapper.readValue(playerJSON.toJSONString(), Player.class);
    } else {
      player = playerService.getPlayer(id);
      ObjectReader reader = objectMapper.readerForUpdating(player);
      player = reader.readValue(playerJSON.toJSONString());
    }
    player.setDead(false);

    return playerService.savePlayer(player);
  }

  @Transactional
  @PostMapping("/update/players")
  @ResponseBody
  List<Player> postPlayers(@RequestBody List<Player> players, HttpServletResponse response) {
    List<Player> result = new ArrayList<>();

    for (Player player : players) {
      if (!playerService.hasPlayer(player)) {
        response.setStatus(201);
      }
      result.add(playerService.savePlayer(player));
    }

    playerEmitters.send(result);

    for (Player player : result) {
      player.setDead(false);
      playerService.savePlayer(player);
    }
    return result;
  }

  @Transactional
  @PatchMapping("/update/players")
  @ResponseBody
  @SuppressWarnings("unchecked")
  List<Player> patchPlayers(@RequestBody JSONArray playerArrayJSON, HttpServletResponse response)
      throws JsonMappingException, JsonProcessingException {

    playerEmitters.send(playerArrayJSON);
    List<Player> result = new ArrayList<>();

    ObjectMapper objectMapper = new ObjectMapper();

    for (int i = 0; i < playerArrayJSON.size(); i++) {
      JSONObject playerJSON = new JSONObject((Map<String, Object>) playerArrayJSON.get(i));
      Player player;
      UUID id = UUID.fromString(playerJSON.getAsString("id"));
      if (!playerService.hasPlayer(id)) {
        response.setStatus(201);
        player = objectMapper.readValue(playerJSON.toString(), Player.class);
      } else {
        player = playerService.getPlayer(id);
        ObjectReader reader = objectMapper.readerForUpdating(player);
        player = reader.readValue(playerJSON.toString());
      }
      player.setDead(false);
      result.add(playerService.savePlayer(player));
    }
    return result;
  }

  @Transactional
  @PostMapping("/update/notification")
  @ResponseBody
  String postNotification(@RequestBody String message) {
    notificationEmitters.send(message);
    return message;
  }

  @Transactional
  @PostMapping("/update/event")
  @ResponseBody
  GameStatus postGameEvent(@RequestBody GameStatus event) {
    gameStatusService.saveGameStatus(event);
    eventEmitters.send(event);
    return event;
  }

  @Transactional
  @PostMapping("/update/events")
  @ResponseBody
  List<GameStatus> postGameEvents(@RequestBody List<GameStatus> events) {
    List<GameStatus> resultEvents = new ArrayList<>();
    for (GameStatus event : events) {
      resultEvents.add(gameStatusService.saveGameStatus(event));
    }
    eventEmitters.send(resultEvents);
    return resultEvents;
  }

  /*
  private void initTest() {
    Random rand = new Random();
  
    Location[] locations = Player.Location.values();
    locations = Arrays.copyOfRange(locations, 1, 3);
  
    String[] classes = { "Barbarian", "Messenger", "ShieldMaiden", "Explorer", "Ranger", "LuteBoi",
        "Looter",
        "Spider" };
  
    playerService.savePlayer(new Player(
        UUID.fromString("6a3f244a-955b-4859-a9a8-db6d2c585646"),
        "Texelo",
        classes[rand.nextInt(classes.length - 1)],
        locations[rand.nextInt(locations.length - 1)], rand.nextInt(0, 20), rand.nextInt(0, 20),
        new String[] { "stick", "oak_door", "wooden_sword", "diamond_axe", null, null, null,
            "dirt", "air",
            "grass",
            "air", "bucket", "candle" },
        Team.BLUE, null, null, rand.nextDouble() < 0.5 ? true : false, true));
  
    playerService.savePlayer(new Player(
        UUID.fromString("1c5a7191-c0af-474d-bd3d-4f18efc79c02"),
        "Silentspy668",
        classes[rand.nextInt(classes.length - 1)],
        locations[rand.nextInt(locations.length - 1)], rand.nextInt(0, 20), rand.nextInt(0, 20),
        new String[] { "stick", "oak_door", "wooden_sword", "diamond_axe", null, null, null,
            "dirt", "air",
            "grass",
            "air", "bucket", "candle" },
        Team.BLUE, null, null, rand.nextDouble() < 0.5 ? true : false, true));
  
    playerService.savePlayer(new Player(
        UUID.fromString("a37f4e3e-03ad-4e51-9c6f-e9980879baf1"),
        "Phylaxis_",
        classes[rand.nextInt(classes.length - 1)],
        locations[rand.nextInt(locations.length - 1)], rand.nextInt(0, 20), rand.nextInt(0, 20),
        new String[] { "stick", "oak_door", "wooden_sword", "diamond_axe", null, null, null,
            "dirt", "air",
            "grass",
            "air", "bucket", "candle" },
        Team.BLUE, null, null, rand.nextDouble() < 0.5 ? true : false, true));
  
    playerService.savePlayer(new Player(
        UUID.fromString("7c59062e-2dab-44f0-9148-dfc5de21ca9a"),
        "Quantum_Disciple",
        classes[rand.nextInt(classes.length - 1)],
        locations[rand.nextInt(locations.length - 1)], rand.nextInt(0, 20), rand.nextInt(0, 20),
        new String[] { "stick", "oak_door", "wooden_sword", "diamond_axe", null, null, null,
            "dirt", "air",
            "grass",
            "air", "bucket", "candle" },
        Team.BLUE, null, null, rand.nextDouble() < 0.5 ? true : false, true));
  
    playerService.savePlayer(new Player(
        UUID.fromString("7001a316-0b5d-4141-b94a-cbfd7aef358a"),
        "Chickachow",
        classes[rand.nextInt(classes.length - 1)],
        locations[rand.nextInt(locations.length - 1)], rand.nextInt(0, 20), rand.nextInt(0, 20),
        new String[] { "stick", "oak_door", "wooden_sword", "diamond_axe", null, null, null,
            "dirt", "air",
            "grass",
            "air", "bucket", "candle" },
        Team.RED, null, null, rand.nextDouble() < 0.5 ? true : false, true));
  
    playerService.savePlayer(new Player(
        UUID.fromString("665ec92d-ec52-4453-80c3-c7fe073d7b44"),
        "gongly",
        classes[rand.nextInt(classes.length - 1)],
        locations[rand.nextInt(locations.length - 1)], rand.nextInt(0, 20), rand.nextInt(0, 20),
        new String[] { "stick", "oak_door", "wooden_sword", "diamond_axe", null, null, null,
            "dirt", "air",
            "grass",
            "air", "bucket", "candle" },
        Team.RED, null, null, rand.nextDouble() < 0.5 ? true : false, true));
  
    playerService.savePlayer(new Player(
        UUID.fromString("7b6fe0c4-9af3-41bd-9356-06ae8b09a851"),
        "ompact",
        classes[rand.nextInt(classes.length - 1)],
        locations[rand.nextInt(locations.length - 1)], rand.nextInt(0, 20), rand.nextInt(0, 20),
        new String[] { "stick", "oak_door", "wooden_sword", "diamond_axe", null, null, null,
            "dirt", "air",
            "grass",
            "air", "bucket", "candle" },
        Team.RED, null, null, rand.nextDouble() < 0.5 ? true : false, true));
  
    playerService.savePlayer(new Player(
        UUID.fromString("93d3f6d1-4223-414b-9a14-07f8d5e47f35"),
        "Portzerico",
        classes[rand.nextInt(classes.length - 1)],
        locations[rand.nextInt(locations.length - 1)], rand.nextInt(0, 20), rand.nextInt(0, 20),
        new String[] { "stick", "oak_door", "wooden_sword", "diamond_axe", null, null, null,
            "dirt", "air",
            "grass",
            "air", "bucket", "candle" },
        Team.RED, null, null, rand.nextDouble() < 0.5 ? true : false, true));
  
  }
  */
}
