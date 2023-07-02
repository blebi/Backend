package server.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import server.models.GameStatus;
import server.repositories.GameStatusRepository;

@Service
public class GameStatusService {

  @Autowired
  GameStatusRepository repository;

  public GameStatus saveGameStatus(GameStatus status) {
    return repository.save(status);
  }

  @Transactional
  public List<GameStatus> getGameStatus() {
    List<GameStatus> GameStatus = new ArrayList<>();
    repository.findAll().forEach(GameStatus::add);
    return GameStatus;
  }

  public boolean hasGameStatus(GameStatus GameStatus) {
    return repository.existsById(GameStatus.getEntity());
  }

  public boolean hasGameStatus(String entity) {
    return repository.existsById(entity);
  }

  public GameStatus getGameStatus(String entity) {
    return repository.findById(entity).orElse(null);
  }
 
  public void clear() {
    repository.deleteAll();
  }
}
