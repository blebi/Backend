package server.models;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class InventoryItem {
  private String type;
  private String displayName;
  private int amount;
  private List<String> enchants = new ArrayList<>();
}
