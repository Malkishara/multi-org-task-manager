package com.imh.backend.dtos;

import com.imh.backend.enums.ProjectStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Dedicated status-only update, so flipping a project's status/progress
 * doesn't need to resend name/description/dates. progress is optional -
 * omit it to change status without touching the percentage.
 */
public record UpdateProjectStatusRequest(

        @NotNull(message = "Status is required")
        ProjectStatus status,

        @Min(value = 0, message = "Progress cannot be negative")
        @Max(value = 100, message = "Progress cannot exceed 100")
        Integer progress
) {
}
