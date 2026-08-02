package com.imh.backend.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * status is intentionally not accepted here - new tasks always start at
 * TODO via Task's @PrePersist. Use the status endpoint to move it along.
 * assignedToId is optional - omit to create an unassigned task.
 */
public record CreateTaskRequest(

        @NotNull(message = "Project id is required")
        Long projectId,

        @NotBlank(message = "Title is required")
        String title,

        @Size(max = 1000, message = "Description cannot exceed 1000 characters")
        String description,

        Long assignedToId,

        LocalDate startDate,

        LocalDate dueDate
) {
}
