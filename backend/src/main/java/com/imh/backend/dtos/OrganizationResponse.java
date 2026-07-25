package com.imh.backend.dtos;

import java.time.LocalDateTime;

/**
 * Response DTO (record) — never expose the JPA entity directly to clients.
 * Keeping response shapes as separate records lets the entity model evolve
 * (new relations, lazy-loaded fields, etc.) without breaking the API contract.
 */
public record OrganizationResponse(
        Long id,
        String name,
        String description,
        String slug,
        String logoUrl,
        boolean active,
        Long ownerId,
        String ownerName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
