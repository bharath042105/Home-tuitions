package com.hometuitions.backend.auth.service;

import com.hometuitions.backend.auth.entity.User;

import java.util.List;
import java.util.UUID;

/** Admin-facing user account operations (SRS FR-11.2). Kept in the auth module since
 *  that's where the User entity/repository already live. */
public interface UserManagementService {

    List<User> listAll(User.Role roleFilter);

    User suspend(UUID userId, String adminUserId);

    User reinstate(UUID userId, String adminUserId);

    long countByRole(User.Role role);
}
