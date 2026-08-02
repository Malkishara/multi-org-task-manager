package com.imh.backend.dtos;

import com.imh.backend.enums.TaskStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record TaskResponse(
        Long id,
        String title,
        String description,
        TaskStatus status,
        Long projectId,
        String projectName,
        Long createdById,
        String createdByName,
        Long assignedToId,
        String assignedToName,
        LocalDate startDate,
        LocalDate dueDate,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
