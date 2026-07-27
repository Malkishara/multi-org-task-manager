package com.imh.backend.mappers;

import com.imh.backend.dtos.ProjectResponse;
import com.imh.backend.entities.Project;
import org.springframework.stereotype.Component;

@Component
public class ProjectMapper {

    public ProjectResponse toResponse(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getStatus(),
                project.getProgress(),
                project.getOrganization().getId(),
                project.getOrganization().getName(),
                project.getCreatedBy().getId(),
                project.getCreatedBy().getFirstName() + " " + project.getCreatedBy().getLastName(),
                project.getStartDate(),
                project.getEndDate(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }
}
