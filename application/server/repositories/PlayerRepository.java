package server.repositories;

import java.util.UUID;

import org.springframework.data.repository.CrudRepository;

import server.models.Player;

public interface PlayerRepository extends CrudRepository<Player, UUID> {

}
