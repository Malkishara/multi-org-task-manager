package com.imh.backend.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO (record) — Data Transfer Object pattern.
 * Records are used for all request/response payloads because they are
 * immutable, only carry data (no behaviour), and give us equals/hashCode/
 * toString for free, which keeps the API layer decoupled from the JPA entities.
 *
 * Slug is intentionally NOT part of the request — it is derived from the
 * name by the service layer so that the API never has to worry about
 * uniqueness collisions itself.
 */
public record CreateOrganizationRequest(

        @NotBlank(message = "Organization name is required")
        @Size(max = 150, message = "Organization name must be at most 150 characters")
        String name,

        @Size(max = 1000, message = "Description must be at most 1000 characters")
        String description,

        String logoUrl
) {
}
