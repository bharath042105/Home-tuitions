package com.hometuitions.backend.auth.controller;

import com.hometuitions.backend.auth.dto.UserResponse;
import com.hometuitions.backend.auth.entity.User;
import com.hometuitions.backend.auth.service.UserManagementService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/users")
@Tag(name = "Admin - Users")
public class AdminUserController {

    private final UserManagementService userManagementService;

    public AdminUserController(UserManagementService userManagementService) {
        this.userManagementService = userManagementService;
    }

    @GetMapping
    public List<UserResponse> list(@RequestParam(required = false) User.Role role) {
        return userManagementService.listAll(role).stream().map(UserResponse::from).toList();
    }

    @PostMapping("/{id}/suspend")
    public UserResponse suspend(Authentication authentication, @PathVariable UUID id) {
        return UserResponse.from(userManagementService.suspend(id, authentication.getName()));
    }

    @PostMapping("/{id}/reinstate")
    public UserResponse reinstate(Authentication authentication, @PathVariable UUID id) {
        return UserResponse.from(userManagementService.reinstate(id, authentication.getName()));
    }
}
