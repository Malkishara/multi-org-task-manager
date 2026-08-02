package com.imh.backend.dtos;

import com.imh.backend.entities.User;

import java.util.List;

/**
 * Response DTO for returning authenticated user's profile information.
 *
 * Record is used because:
 * - DTO is immutable
 * - No setters required
 * - Less boilerplate code
 * - Thread-safe data transfer object
 */
public record UserProfileResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        User.Role role,
        boolean active,
        List<OrganizationMembershipResponse> organizations
) {
}
