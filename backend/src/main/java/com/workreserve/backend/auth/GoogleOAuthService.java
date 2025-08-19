package com.workreserve.backend.auth;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.workreserve.backend.user.User;
import com.workreserve.backend.user.Role;
import com.workreserve.backend.user.UserRepository;
import com.workreserve.backend.user.DTO.AuthResponseToken;
import com.workreserve.backend.user.DTO.UserResponse;
import com.workreserve.backend.config.JwtService;
import com.workreserve.backend.activity.ActivityService;
import com.workreserve.backend.exception.UserException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class GoogleOAuthService {

    @Autowired
    private GoogleIdTokenVerifier googleIdTokenVerifier;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ActivityService activityService;

    public AuthResponseToken authenticateWithGoogle(String idTokenString) {
        try {

            GoogleIdToken idToken = googleIdTokenVerifier.verify(idTokenString);

            if (idToken == null) {
                throw new UserException("Invalid Google ID token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();

            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String givenName = (String) payload.get("given_name");
            String familyName = (String) payload.get("family_name");
            Boolean emailVerified = payload.getEmailVerified();

            String fullName = name;
            if (fullName == null || fullName.trim().isEmpty()) {
                fullName = (givenName != null ? givenName : "") + " " + (familyName != null ? familyName : "");
                fullName = fullName.trim();
                if (fullName.isEmpty()) {
                    fullName = email.split("@")[0];
                }
            }

            Optional<User> existingUser = userRepository.findByEmail(email);
            User user;
            boolean isNewUser = false;

            if (existingUser.isPresent()) {
                user = existingUser.get();

                if (user.isBanned()) {
                    throw new UserException("Your account has been banned! Please contact support.");
                }

                if (user.isLocked()) {
                    throw new UserException("Account is locked. Please contact support.");
                }

                boolean needsUpdate = false;
                if (!user.getFullName().equals(fullName)) {
                    user.setFullName(fullName);
                    needsUpdate = true;
                }

                if (!user.isEmailVerified() && emailVerified) {
                    user.setEmailVerified(true);
                    user.setVerificationToken(null);
                    user.setVerificationTokenCreatedAt(null);
                    needsUpdate = true;
                }

                if (needsUpdate) {
                    userRepository.save(user);
                }

                activityService.logActivity(
                        user.getId(),
                        "Logged in via Google OAuth",
                        "USER",
                        user.getId(),
                        user.getFullName());

            } else {

                user = new User();
                user.setFullName(fullName);
                user.setEmail(email);
                user.setRole(Role.USER);
                user.setEmailVerified(emailVerified != null ? emailVerified : true);
                user.setEnabled(true);
                user.setLocked(false);
                user.setBanned(false);

                user.setPassword(UUID.randomUUID().toString());

                user = userRepository.save(user);
                isNewUser = true;

                activityService.logActivity(
                        user.getId(),
                        "New user registered via Google OAuth: " + user.getEmail(),
                        "USER",
                        user.getId(),
                        user.getFullName());
            }

            String accessToken = jwtService.generateToken(user.getEmail());
            String refreshToken = UUID.randomUUID().toString();

            user.setRefreshToken(refreshToken);
            user.setRefreshTokenExpiry(LocalDateTime.now().plusDays(7));
            user.setFailedLoginAttempts(0);
            userRepository.save(user);

            UserResponse userResponse = toUserResponse(user);
            AuthResponseToken response = new AuthResponseToken(accessToken, refreshToken, userResponse);

            return response;

        } catch (Exception e) {
            throw new UserException("Failed to authenticate with Google: " + e.getMessage());
        }
    }

    private UserResponse toUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setCreatedAt(user.getCreatedAt());
        response.setEnabled(user.isEnabled());
        response.setLocked(user.isLocked());
        response.setBanned(user.isBanned());
        response.setEmailVerified(user.isEmailVerified());
        return response;
    }
}