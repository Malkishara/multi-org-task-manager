package com.imh.backend.dtos;

import jakarta.validation.constraints.NotNull;

/**
 * Request body for PATCH /api/organizations/{id}/status.
 * Kept separate from UpdateOrganizationRequest so status toggles don't need
 * to resend name/description/logoUrl just to flip one boolean.
 */
public record UpdateOrganizationStatusRequest(
        @NotNull(message = "active is required")
        Boolean active
) {
}
