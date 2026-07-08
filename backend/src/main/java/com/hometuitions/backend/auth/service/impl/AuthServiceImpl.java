package com.hometuitions.backend.auth.service.impl;

import com.hometuitions.backend.auth.dto.LoginRequest;
import com.hometuitions.backend.auth.dto.RegisterRequest;
import com.hometuitions.backend.auth.dto.TokenResponse;
import com.hometuitions.backend.auth.entity.User;
import com.hometuitions.backend.auth.repository.UserRepository;
import com.hometuitions.backend.auth.service.AuthService;
import com.hometuitions.backend.auth.service.OtpService;
import com.hometuitions.backend.auth.service.TokenService;
import com.hometuitions.backend.common.audit.AuditLogService;
import com.hometuitions.backend.common.exception.DuplicateResourceException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final OtpService otpService;
    private final AuditLogService auditLogService;

    public AuthServiceImpl(UserRepository userRepository,
                            PasswordEncoder passwordEncoder,
                            TokenService tokenService,
                            OtpService otpService,
                            AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
        this.otpService = otpService;
        this.auditLogService = auditLogService;
    }

    @Override
    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("An account with this email already exists");
        }
        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        user.setStatus(User.UserStatus.UNVERIFIED_EMAIL);
        User saved = userRepository.save(user);
        auditLogService.record(saved.getId().toString(), "USER_REGISTERED", saved.getId().toString(),
                Map.of("role", saved.getRole().name()));
        return saved;
        // TODO(Phase 5+): dispatch email-verification message via NotificationService
    }

    @Override
    public TokenResponse login(LoginRequest request, String deviceId) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            auditLogService.record(user.getId().toString(), "LOGIN_FAILED", user.getId().toString(), null);
            throw new BadCredentialsException("Invalid email or password");
        }
        if (user.getStatus() == User.UserStatus.SUSPENDED) {
            throw new BadCredentialsException("This account has been suspended");
        }

        TokenResponse tokens = issueTokens(user, deviceId);
        auditLogService.record(user.getId().toString(), "LOGIN_SUCCEEDED", user.getId().toString(),
                Map.of("deviceId", deviceId, "method", "PASSWORD"));
        return tokens;
    }

    @Override
    public void requestOtp(String phone) {
        otpService.generateAndSend(phone);
    }

    @Override
    public TokenResponse verifyOtpAndLogin(String phone, String code, String deviceId) {
        otpService.verify(phone, code); // throws InvalidTokenException on mismatch/expiry/too-many-attempts

        User user = userRepository.findByPhone(phone).orElseGet(() -> {
            User newUser = new User();
            newUser.setPhone(phone);
            newUser.setRole(User.Role.STUDENT); // default; changed via profile setup if wrong
            newUser.setStatus(User.UserStatus.ACTIVE); // OTP verification IS the identity proof, no separate email-verify gate
            return userRepository.save(newUser);
        });

        TokenResponse tokens = issueTokens(user, deviceId);
        auditLogService.record(user.getId().toString(), "LOGIN_SUCCEEDED", user.getId().toString(),
                Map.of("deviceId", deviceId, "method", "OTP"));
        return tokens;
    }

    @Override
    public TokenResponse refresh(String refreshToken, String deviceId) {
        TokenService.RotatedTokens rotated = tokenService.rotate(refreshToken, deviceId);
        return new TokenResponse(rotated.accessToken(), rotated.refreshToken(), 15 * 60);
    }

    @Override
    public void logout(String userId, String deviceId) {
        tokenService.revoke(userId, deviceId);
        auditLogService.record(userId, "LOGOUT", userId, Map.of("deviceId", deviceId));
    }

    private TokenResponse issueTokens(User user, String deviceId) {
        String accessToken = tokenService.issueAccessToken(user);
        String refreshToken = tokenService.issueRefreshToken(user, deviceId);
        return new TokenResponse(accessToken, refreshToken, 15 * 60);
    }
}
