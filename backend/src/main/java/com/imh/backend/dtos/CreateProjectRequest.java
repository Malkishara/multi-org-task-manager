package com.imh.backend.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * DTO for creating a project. status/progress are intentionally not
 * accepted here - new projects always start at NOT_STARTED / 0% via
 * Project's @PrePersist. Use the status endpoint to change them afterward.
 */
public record CreateProjectRequest(

        @NotNull(message = "Organization id is required")
        Long organizationId,

        @NotBlank(message = "Name is required")
        String name,

        String description,

        LocalDate startDate,

        LocalDate endDate
) {
}
