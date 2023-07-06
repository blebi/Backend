package server.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import server.models.Player;
import server.repositories.PlayerRepository;

@Service
@Transactional
public class PlayerService {

  @Autowired
  PlayerRepository repository;

  @Transactional
  public Player savePlayer(Player player) {
    return repository.save(player);
  }

  @Transactional
  public List<Player> getPlayers() {
    List<Player> players = new ArrayList<>();
    repository.findAll().forEach(players::add);
    return players;
  }

  @Transactional
  public Map<Player.Location, List<Player>> getPlayersByLocation() {
    return StreamSupport
        .stream(repository.findAll().spliterator(), true)
        .collect(Collectors.groupingBy(player -> player.getLocation()));
  }

  @Transactional
  public boolean hasPlayer(Player player) {
    return repository.existsById(player.getId());
  }

  @Transactional
  public boolean hasPlayer(UUID id) {
    return repository.existsById(id);
  }

  @Transactional
  public Player getPlayer(UUID id) {
    return repository.findById(id).orElse(null);
  }
 
  @Transactional
  public void clear() {
    repository.deleteAll();
  }
}
