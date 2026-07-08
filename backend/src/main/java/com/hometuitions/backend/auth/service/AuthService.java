package com.hometuitions.backend.auth.service;

import com.hometuitions.backend.auth.dto.LoginRequest;
import com.hometuitions.backend.auth.dto.RegisterRequest;
import com.hometuitions.backend.auth.dto.TokenResponse;
import com.hometuitions.backend.auth.entity.User;

public interface AuthService {

    User register(RegisterRequest request);

    TokenResponse login(LoginRequest request, String deviceId);

    void requestOtp(String phone);

    TokenResponse verifyOtpAndLogin(String phone, String code, String deviceId);

    TokenResponse refresh(String refreshToken, String deviceId);

    void logout(String userId, String deviceId);
}
