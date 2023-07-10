package server.models;

import static server.models.Player.Location.*;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Player {
  public static enum Location {
    BLUE_DIAMOND_BOSS, RED_DIAMOND_BOSS, BLUE_GOLD_BOSS, RED_GOLD_BOSS, BLUE_IRON_BOSS, RED_IRON_BOSS, VOID,
    BLUE_DIAMOND, BLUE_GOLD_DIAMOND, BLUE_GOLD, BLUE_SPAWN_GOLD, BLUE_SPAWN,
    RED_IRON_DIAMOND, BLUE_GOLD_MONUMENT, BLUE_SPAWN_IRON,
    RED_IRON, RED_IRON_MONUMENT, MONUMENT, BLUE_IRON_MONUMENT, BLUE_IRON,
    RED_SPAWN_IRON, RED_GOLD_MONUMENT, BLUE_IRON_DIAMOND,
    RED_SPAWN, RED_SPAWN_GOLD, RED_GOLD, RED_GOLD_DIAMOND, RED_DIAMOND
  }

  public static Location[][] locations = {
      { RED_DIAMOND_BOSS, null, null, RED_GOLD_BOSS, null, null, null },
      { null, RED_DIAMOND, RED_GOLD_DIAMOND, RED_GOLD, RED_SPAWN_GOLD, RED_SPAWN, null },
      { null, BLUE_IRON_DIAMOND, null, RED_GOLD_MONUMENT, null, RED_SPAWN_IRON, null },
      { BLUE_IRON_BOSS, BLUE_IRON, BLUE_IRON_MONUMENT, MONUMENT, RED_IRON_MONUMENT, RED_IRON, RED_IRON_BOSS },
      { null, BLUE_SPAWN_IRON, null, BLUE_GOLD_MONUMENT, null, RED_IRON_DIAMOND, null },
      { null, BLUE_SPAWN, BLUE_SPAWN_GOLD, BLUE_GOLD, BLUE_GOLD_DIAMOND, BLUE_DIAMOND, null },
      { null, null, null, BLUE_GOLD_BOSS, null, null, BLUE_DIAMOND_BOSS }
  };

  public static enum Team {
    BLUE, RED
  }

  @Id
  private UUID id;
  private String name;
  private String playerClass;
  private Location location;
  private int health;
  private int maxHealth = 20;
  private int armour;
  @Column(length = 100000)
  private InventoryItem[] inventory;
  private Team team;
  private String wool;
  private String dungeon_key;
  private boolean online;
  private boolean initiated = false;
  private boolean dead = false;

  public String getImgLink() {
    return "https://mc-heads.net/avatar/" + this.getId() + "/16";
  }

}
