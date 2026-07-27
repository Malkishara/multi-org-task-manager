package com.imh.backend.dtos;

import com.imh.backend.enums.ProjectStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ProjectResponse(
        Long id,
        String name,
        String description,
        ProjectStatus status,
        Integer progress,
        Long organizationId,
        String organizationName,
        Long createdById,
        String createdByName,
        LocalDate startDate,
        LocalDate endDate,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
