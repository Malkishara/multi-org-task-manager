package com.imh.backend.dtos;

import com.imh.backend.entities.OrganizationMember.OrgRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO (record) used by the OWNER to add another existing user to the
 * organization. Note: role is restricted to ADMIN or MEMBER by the
 * validator — OWNER can never be assigned through this endpoint since
 * ownership is fixed at creation time.
 */
public record AddMemberRequest(

        @NotNull(message = "Organization id is required")
        Long organizationId,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email,

        @NotNull(message = "Role is required")
        OrgRole role
) {
}
