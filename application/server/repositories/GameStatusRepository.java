package server.repositories;

import org.springframework.data.repository.CrudRepository;

import server.models.GameStatus;

public interface GameStatusRepository extends CrudRepository<GameStatus, String> {
  
}
