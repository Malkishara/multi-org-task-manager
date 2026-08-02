package com.imh.backend.dtos;

import com.imh.backend.entities.OrganizationMember;

/**
 * One organization the user belongs to, plus their role in it. Nested
 * inside UserProfileResponse - not the same as OrganizationMemberResponse
 * (which is used from the organization's side, listing all its members).
 */
public record OrganizationMembershipResponse(
        Long organizationId,
        String organizationName,
        OrganizationMember.OrgRole role
) {
}