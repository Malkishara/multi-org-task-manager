package com.imh.backend.mappers;

import com.imh.backend.dtos.TaskResponse;
import com.imh.backend.entities.Task;
import org.springframework.stereotype.Component;

@Component
public class TaskMapper {

    public TaskResponse toResponse(Task task) {
        boolean hasAssignee = task.getAssignedTo() != null;

        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getProject().getId(),
                task.getProject().getName(),
                task.getCreatedBy().getId(),
                task.getCreatedBy().getFirstName() + " " + task.getCreatedBy().getLastName(),
                hasAssignee ? task.getAssignedTo().getId() : null,
                hasAssignee ? task.getAssignedTo().getFirstName() + " " + task.getAssignedTo().getLastName() : null,
                task.getStartDate(),
                task.getDueDate(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
