package com.imh.backend.dtos;

/**
 * Partial update for the current user's own profile. Only non-blank
 * fields are applied - omit a field (or send null) to leave it unchanged.
 * Email and password are intentionally not here: email needs a uniqueness
 * check and password needs current-password verification, both better as
 * their own endpoints.
 */
public record UpdateUserProfileRequest(
        String firstName,
        String lastName
) {
}