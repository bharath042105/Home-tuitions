package com.hometuitions.backend.auth.service.impl;

import com.hometuitions.backend.auth.entity.User;
import com.hometuitions.backend.auth.repository.UserRepository;
import com.hometuitions.backend.auth.service.TokenService;
import com.hometuitions.backend.auth.service.UserManagementService;
import com.hometuitions.backend.common.audit.AuditLogService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class UserManagementServiceImpl implements UserManagementService {

    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final AuditLogService auditLogService;

    public UserManagementServiceImpl(UserRepository userRepository,
                                      TokenService tokenService,
                                      AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
        this.auditLogService = auditLogService;
    }

    @Override
    public List<User> listAll(User.Role roleFilter) {
        return roleFilter != null ? userRepository.findByRole(roleFilter) : userRepository.findAll();
    }

    @Override
    public User suspend(UUID userId, String adminUserId) {
        User user = getOrThrow(userId);
        user.setStatus(User.UserStatus.SUSPENDED);
        User saved = userRepository.save(user);
        // A suspended user must not keep using sessions issued before the suspension -
        // revoking here is what actually makes SUSPENDED take effect immediately rather
        // than only on their next login attempt.
        tokenService.revokeAll(userId.toString());
        auditLogService.record(adminUserId, "USER_SUSPENDED", userId.toString(), null);
        return saved;
    }

    @Override
    public User reinstate(UUID userId, String adminUserId) {
        User user = getOrThrow(userId);
        user.setStatus(User.UserStatus.ACTIVE);
        User saved = userRepository.save(user);
        auditLogService.record(adminUserId, "USER_REINSTATED", userId.toString(), null);
        return saved;
    }

    @Override
    public long countByRole(User.Role role) {
        return userRepository.countByRole(role);
    }

    private User getOrThrow(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }
}
