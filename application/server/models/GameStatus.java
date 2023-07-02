package server.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GameStatus {

  enum EVENT {
    //WOOL_PICKUP,
    //WOOL_DROP,
    //WOOL_CAPTURE,
    //KEY_PICKUP,
    //KEY_DROP,
    //KEY_CAPTURE
    PICKUP,
    DROP,
    CAPTURE
  }

  enum Entity {

  }

  @Id
  private String entity;
  private EVENT status;
  private String data;

}
