package server.configs;

import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.SecureRandom;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

  @Bean
  @Order(1)
  public SecurityFilterChain apiFilterChain(HttpSecurity http) throws Exception {
    http.csrf(csrf -> csrf.disable())
        .securityMatcher("/ctw/status/update/**")
        .authorizeHttpRequests(requests -> requests
            .anyRequest().authenticated())
        .sessionManagement((sessionManagement) -> sessionManagement
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .addFilterBefore(new AuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
    return http.build();
  }

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    HttpSessionRequestCache requestCache = new HttpSessionRequestCache();
    requestCache.setMatchingRequestParameterName(null);

    http
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests((requests) -> requests
            .requestMatchers("/error").permitAll()
            .requestMatchers("/assets/css/**").permitAll()
            .requestMatchers("/assets/fonts/**").permitAll()
            .anyRequest().authenticated())
        .formLogin((form) -> form
            .loginPage("/login")
            .defaultSuccessUrl("/ctw/status/", true)
            .permitAll())
        .logout((logout) -> logout.permitAll())
        .requestCache((cache) -> cache
            .requestCache(requestCache));

    return http.build();
  }

  @Bean
  public UserDetailsService userDetailsService() throws IOException {

    String[] words = new ClassPathResource("words.txt").getContentAsString(Charset.defaultCharset()).split("\n");
    SecureRandom secureRandom = new SecureRandom();

    String password = words[secureRandom.nextInt(words.length)] + "-" + words[secureRandom.nextInt(words.length)] + "-"
        + words[secureRandom.nextInt(words.length)];

    try {
      Path path = Paths.get("passcode.txt");
      byte[] strToBytes = password.getBytes();
      path.toFile().deleteOnExit();
      Files.write(path, strToBytes);

    } catch (IOException e) {
    }
    System.out.println("#############################################################");
    System.out.println(password);
    System.out.println("#############################################################");
    UserDetails user = User.withDefaultPasswordEncoder()
        .username("user")
        .password(password)
        .roles("USER")
        .build();

    return new InMemoryUserDetailsManager(user);
  }

}