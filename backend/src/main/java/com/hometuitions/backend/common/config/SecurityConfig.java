package com.hometuitions.backend.common.config;

import com.hometuitions.backend.common.security.JwtAuthFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Value("${app.cors.allowed-origins:*}")
    private List<String> corsAllowedOrigins;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        if (corsAllowedOrigins != null && !corsAllowedOrigins.isEmpty() && !corsAllowedOrigins.contains("*")) {
            configuration.setAllowedOriginPatterns(corsAllowedOrigins);
        } else {
            configuration.setAllowedOriginPatterns(List.of("*"));
        }
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization", "Link", "X-Total-Count"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public CorsFilter corsFilter() {
        return new CorsFilter(corsConfigurationSource());
    }

    @Bean
    public AuthenticationEntryPoint unauthorizedEntryPoint() {
        return (request, response, authException) ->
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // cost factor 12, per SRS FR-1.4
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // stateless JWT API, no cookies involved
            .cors(Customizer.withDefaults()) // picks up the corsConfigurationSource bean above
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .anonymous(Customizer.withDefaults())
            .exceptionHandling(ex -> ex.authenticationEntryPoint(unauthorizedEntryPoint()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(
                    "/api/v1/auth/register",
                    "/api/v1/auth/login",
                    "/api/v1/auth/otp/**",
                    "/api/v1/auth/refresh",
                    "/api/v1/tutors/search/**",
                    "/api/v1/tutors/*/profile",
                    "/api/v1/leads/**",
                    "/api/v1/webhooks/razorpay",
                    "/ws/**",
                    "/swagger-ui/**", "/v3/api-docs/**",
                    "/actuator/health",
                    "/health"
                ).permitAll()
                // /api/v1/auth/logout is intentionally NOT in the list above - it reads
                // the caller's identity from the validated JWT (see AuthController), so it
                // must go through authentication like any other protected endpoint.
                // /api/v1/leads/** (LeadController) is public by design - anonymous website
                // visitors submit tuition inquiries/tutor applications/contact messages
                // before any account exists; each is @RateLimited per client IP to guard
                // against spam. /api/v1/admin/leads/** (the read/triage side) is NOT in this
                // list - it falls under the existing "/api/v1/admin/**" hasRole(ADMIN) rule.
                // /api/v1/webhooks/razorpay is public by necessity (Razorpay can't hold a
                // JWT) - it authenticates itself via the X-Razorpay-Signature HMAC header,
                // verified inside PaymentServiceImpl.handleWebhookEvent before anything else runs.
                // /ws/** (the SockJS handshake) is public at the HTTP layer on purpose - the
                // JWT travels inside the STOMP CONNECT frame over the established socket, not
                // as an HTTP header on the handshake request, and is verified by
                // StompAuthChannelInterceptor before any @MessageMapping can be reached.
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/v1/tutors/me/**").hasRole("TUTOR")
                .requestMatchers("/api/v1/students/me/**").hasRole("STUDENT")
                .requestMatchers("/api/v1/parents/me/**").hasRole("PARENT")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
