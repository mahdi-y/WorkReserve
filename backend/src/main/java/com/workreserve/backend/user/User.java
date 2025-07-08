package com.workreserve.backend.user;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;

@Entity
@Table(name = "users")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private LocalDateTime createdAt;

    private boolean enabled = true;
    private boolean locked = false;
    private boolean emailVerified = false;
    private String verificationToken;
    private LocalDateTime verificationTokenCreatedAt;
    private String resetPasswordToken;
    private LocalDateTime resetPasswordTokenCreatedAt;
    private int failedLoginAttempts = 0;
    private LocalDateTime accountLockedAt;
    private String unlockToken;
    private LocalDateTime unlockTokenCreatedAt;
    private String refreshToken;
    private LocalDateTime refreshTokenExpiry;
    private boolean banned = false;


    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public boolean isLocked() { return locked; }
    public void setLocked(boolean locked) { this.locked = locked; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }
    public String getVerificationToken() { return verificationToken; }
    public void setVerificationToken(String verificationToken) { this.verificationToken = verificationToken; }

    public LocalDateTime getVerificationTokenCreatedAt() { return verificationTokenCreatedAt; }
    public void setVerificationTokenCreatedAt(LocalDateTime verificationTokenCreatedAt) { this.verificationTokenCreatedAt = verificationTokenCreatedAt; }

    public String getResetPasswordToken() { return resetPasswordToken; }
    public void setResetPasswordToken(String resetPasswordToken) { this.resetPasswordToken = resetPasswordToken; }
    public LocalDateTime getResetPasswordTokenCreatedAt() { return resetPasswordTokenCreatedAt; }
    public void setResetPasswordTokenCreatedAt(LocalDateTime resetPasswordTokenCreatedAt) { this.resetPasswordTokenCreatedAt = resetPasswordTokenCreatedAt; }

    public int getFailedLoginAttempts() { return failedLoginAttempts; }
    public void setFailedLoginAttempts(int failedLoginAttempts) { this.failedLoginAttempts = failedLoginAttempts; }

    public LocalDateTime getAccountLockedAt() { return accountLockedAt; }
    public void setAccountLockedAt(LocalDateTime accountLockedAt) { this.accountLockedAt = accountLockedAt; }

    public String getUnlockToken() { return unlockToken; }
    public void setUnlockToken(String unlockToken) { this.unlockToken = unlockToken; }
    public LocalDateTime getUnlockTokenCreatedAt() { return unlockTokenCreatedAt; }
    public void setUnlockTokenCreatedAt(LocalDateTime unlockTokenCreatedAt) { this.unlockTokenCreatedAt = unlockTokenCreatedAt; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    public LocalDateTime getRefreshTokenExpiry() { return refreshTokenExpiry; }
    public void setRefreshTokenExpiry(LocalDateTime refreshTokenExpiry) { this.refreshTokenExpiry = refreshTokenExpiry; }

    public boolean isBanned() { return banned; }
    public void setBanned(boolean banned) { this.banned = banned; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !locked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
}