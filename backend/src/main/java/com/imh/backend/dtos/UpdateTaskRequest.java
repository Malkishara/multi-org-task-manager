package com.imh.backend.dtos;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Partial update - only non-null fields are applied. Status is handled
 * separately via UpdateTaskStatusRequest. Pass assignedToId as null to
 * leave the current assignee unchanged - there's no separate "unassign"
 * signal here, since record fields can't distinguish "omitted" from
 * "explicitly cleared". If you need an explicit unassign, add a boolean
 * flag or a dedicated endpoint.
 */
public record UpdateTaskRequest(
        String title,

        @Size(max = 1000, message = "Description cannot exceed 1000 characters")
        String description,

        Long assignedToId,

        LocalDate startDate,

        LocalDate dueDate
) {
}
