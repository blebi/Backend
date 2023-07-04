package server.controllers;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

public class SseEmitters {

  private static final Logger logger = LoggerFactory.getLogger(SseEmitters.class);

  private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

  public SseEmitter add() {
    return add(new SseEmitter(60000000L));
  }

  public SseEmitter add(SseEmitter emitter) {
    this.emitters.add(emitter);

    emitter.onCompletion(() -> {
      logger.info("Emitter completed: {}", emitter);
      this.emitters.remove(emitter);
    });
    emitter.onTimeout(() -> {
      logger.info("Emitter timed out: {}", emitter);
      emitter.complete();
      this.emitters.remove(emitter);
    });

    return emitter;
  }

  public void send(Object obj) {
    send(emitter -> emitter.send(obj));
  }

  public void send(SseEmitter.SseEventBuilder builder) {
    send(emitter -> emitter.send(builder));
  }

  private void send(SseEmitterConsumer<SseEmitter> consumer) {
    List<SseEmitter> failedEmitters = new ArrayList<>();

    this.emitters.forEach(emitter -> {
      try {
        consumer.accept(emitter);
      } catch (Exception e) {
        emitter.completeWithError(e);
        failedEmitters.add(emitter);
        logger.error("Emitter failed: {}", emitter);
      }
    });

    this.emitters.removeAll(failedEmitters);
  }

  @FunctionalInterface
  private interface SseEmitterConsumer<T> {

    void accept(T t) throws IOException;
  }
}