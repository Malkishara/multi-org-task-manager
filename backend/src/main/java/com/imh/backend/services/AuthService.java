package com.imh.backend.services;

import com.imh.backend.dtos.AuthRequest;
import com.imh.backend.dtos.AuthResponse;

public interface AuthService {
    /**
     * Register a new user.
     *
     * @param request signup request
     * @return authentication response with JWT
     */
    AuthResponse signup(AuthRequest request);

    /**
     * Authenticate user.
     *
     * @param request login request
     * @return authentication response with JWT
     */
    AuthResponse login(AuthRequest request);

    AuthResponse activateAccount(Long userId, String key);

    void resendActivationLink(String email);
}
