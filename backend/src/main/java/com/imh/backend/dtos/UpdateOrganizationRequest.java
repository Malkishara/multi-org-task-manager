package com.imh.backend.dtos;

import jakarta.validation.constraints.Size;

/**
 * DTO (record) for updating an organization.
 * Every field is nullable/optional so this can be used as a partial update
 * (PATCH-style semantics behind a PUT endpoint) — the service layer only
 * overwrites fields that are non-null.
 */
public record UpdateOrganizationRequest(

        @Size(max = 150, message = "Organization name must be at most 150 characters")
        String name,

        @Size(max = 1000, message = "Description must be at most 1000 characters")
        String description,

        String logoUrl
) {
}
