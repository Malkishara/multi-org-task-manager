package com.imh.backend.services;

import com.imh.backend.dtos.UserProfileResponse;

public interface UserService {
    /**
     * Get currently authenticated user's profile.
     *
     * @param email logged user's email extracted from JWT
     * @return user profile information
     */
    UserProfileResponse getCurrentUserProfile(String email);
}
