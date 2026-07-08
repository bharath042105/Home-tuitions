package com.hometuitions.backend.auth.entity;

import com.hometuitions.backend.common.util.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User extends BaseEntity {

    @Column(unique = true)
    private String email;

    @Column(unique = true)
    private String phone;

    @Column(name = "password_hash")
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserStatus status = UserStatus.UNVERIFIED_EMAIL;

    public enum Role { STUDENT, PARENT, TUTOR, ADMIN }

    public enum UserStatus { UNVERIFIED_EMAIL, ACTIVE, SUSPENDED }
}
