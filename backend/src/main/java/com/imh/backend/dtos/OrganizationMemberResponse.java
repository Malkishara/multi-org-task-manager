package com.imh.backend.dtos;

import com.imh.backend.entities.OrganizationMember.OrgRole;

import java.time.LocalDateTime;

/**
 * Response DTO (record) representing a single membership row
 * (a user's role inside one organization).
 */
public record OrganizationMemberResponse(
        Long id,
        Long userId,
        String userFullName,
        String userEmail,
        OrgRole role,
        LocalDateTime joinedAt
) {
}
