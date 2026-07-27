package com.imh.backend.dtos;

import java.time.LocalDate;

/**
 * Partial update - only non-null fields are applied. Status and progress
 * are handled separately via UpdateProjectStatusRequest.
 */
public record UpdateProjectRequest(
        String name,
        String description,
        LocalDate startDate,
        LocalDate endDate
) {
}
