package com.hometuitions.backend.common.config;

import com.hometuitions.backend.common.security.JwtAuthFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Value("${app.cors.allowed-origins}")
    private List<String> corsAllowedOrigins;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    // app.cors.allowed-origins was defined in application.yml but never actually wired
    // into Spring Security - without this, the website/admin (a different origin than
    // the API) get every request silently blocked by the browser's CORS check, which
    // surfaces to the user as the request just failing.
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(corsAllowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationEntryPoint unauthorizedEntryPoint() {
        // Spring Security's own default entry point (Http403ForbiddenEntryPoint) sends
        // 403 for missing/invalid auth too, which is indistinguishable from an
        // authenticated-but-wrong-role 403 on the client. Sending 401 here restores
        // that distinction so onUnauthorized() (which only fires on 401) can do its job.
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
            // Without this, a missing/expired token still gets Spring Security's default
            // AnonymousAuthenticationFilter's principal, which counts as "authenticated"
            // for authorization purposes - so a role-gated endpoint (hasRole("TUTOR") etc.)
            // rejects it with 403 Access Denied instead of 401 Unauthorized. The frontend's
            // token-refresh-and-retry logic only triggers on 401, so that 403 silently
            // broke the refresh flow for anyone whose access token expired mid-session.
            .anonymous(AbstractHttpConfigurer::disable)
            .exceptionHandling(ex -> ex.authenticationEntryPoint(unauthorizedEntryPoint()))
            .authorizeHttpRequests(auth -> auth
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
                    "/actuator/health"
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
