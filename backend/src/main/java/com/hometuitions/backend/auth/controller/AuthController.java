package com.hometuitions.backend.auth.controller;

import com.hometuitions.backend.auth.dto.LoginRequest;
import com.hometuitions.backend.auth.dto.OtpRequestRequest;
import com.hometuitions.backend.auth.dto.OtpVerifyRequest;
import com.hometuitions.backend.auth.dto.RegisterRequest;
import com.hometuitions.backend.auth.dto.TokenResponse;
import com.hometuitions.backend.auth.service.AuthService;
import com.hometuitions.backend.common.ratelimit.RateLimited;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @RateLimited(bucket = "register", capacity = 5, refillMinutes = 15)
    public ResponseEntity<Void> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/login")
    @RateLimited(bucket = "login", capacity = 5, refillMinutes = 15)
    public TokenResponse login(@Valid @RequestBody LoginRequest request,
                                @RequestHeader("X-Device-Id") String deviceId) {
        return authService.login(request, deviceId);
    }

    @PostMapping("/otp/request")
    @RateLimited(bucket = "otp-request", capacity = 5, refillMinutes = 15)
    public ResponseEntity<Void> requestOtp(@Valid @RequestBody OtpRequestRequest request) {
        authService.requestOtp(request.phone());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/otp/verify")
    @RateLimited(bucket = "otp-verify", capacity = 5, refillMinutes = 15)
    public TokenResponse verifyOtp(@Valid @RequestBody OtpVerifyRequest request,
                                    @RequestHeader("X-Device-Id") String deviceId) {
        return authService.verifyOtpAndLogin(request.phone(), request.code(), deviceId);
    }

    @PostMapping("/refresh")
    public TokenResponse refresh(@RequestParam String refreshToken,
                                  @RequestHeader("X-Device-Id") String deviceId) {
        return authService.refresh(refreshToken, deviceId);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(Authentication authentication,
                                        @RequestHeader("X-Device-Id") String deviceId) {
        // userId is taken from the validated JWT principal, never a client-supplied
        // param - otherwise any caller could log out an arbitrary other user by guessing
        // their id (JwtAuthFilter sets the principal to the token's subject/userId).
        authService.logout(authentication.getName(), deviceId);
        return ResponseEntity.noContent().build();
    }
}
