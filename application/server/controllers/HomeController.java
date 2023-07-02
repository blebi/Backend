package server.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

  @GetMapping({ "/", "/index" })
  public String home() {
    return "redirect:/ctw/status/";
  }
}