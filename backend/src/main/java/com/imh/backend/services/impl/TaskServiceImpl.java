package com.imh.backend.services.impl;

import com.imh.backend.dtos.CreateTaskRequest;
import com.imh.backend.dtos.TaskResponse;
import com.imh.backend.dtos.UpdateTaskRequest;
import com.imh.backend.dtos.UpdateTaskStatusRequest;
import com.imh.backend.dtos.UserSummaryResponse;
import com.imh.backend.entities.Project;
import com.imh.backend.entities.Task;
import com.imh.backend.entities.User;
import com.imh.backend.exceptions.ResourceNotFoundException;
import com.imh.backend.mappers.TaskMapper;
import com.imh.backend.repositories.ProjectRepository;
import com.imh.backend.repositories.TaskRepository;
import com.imh.backend.repositories.UserRepository;
import com.imh.backend.services.TaskService;
import com.imh.backend.validations.TaskValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskValidator validator;
    private final TaskMapper mapper;

    /**
     * API: POST /api/tasks
     * Owner or admin only. status defaults to TODO via the entity's
     * @PrePersist. assignedToId is optional.
     */
    @Override
    public TaskResponse createTask(CreateTaskRequest request, Long currentUserId) {
        Project project = getProjectOrThrow(request.projectId());
        validator.validateCanManageTask(project.getOrganization(), currentUserId);

        User creator = getUserOrThrow(currentUserId);
        User assignedTo = request.assignedToId() != null ? getUserOrThrow(request.assignedToId()) : null;

        Task task = Task.builder()
                .title(request.title())
                .description(request.description())
                .project(project)
                .createdBy(creator)
                .assignedTo(assignedTo)
                .startDate(request.startDate())
                .dueDate(request.dueDate())
                .build();

        return mapper.toResponse(taskRepository.save(task));
    }

    /**
     * API: PUT /api/tasks/{id}
     * Owner or admin only. Only non-null fields in the request are applied.
     */
    @Override
    public TaskResponse updateTask(Long taskId, UpdateTaskRequest request, Long currentUserId) {
        Task task = getTaskOrThrow(taskId);
        validator.validateCanManageTask(task.getProject().getOrganization(), currentUserId);

        if (request.title() != null && !request.title().isBlank()) {
            task.setTitle(request.title());
        }
        if (request.description() != null) {
            task.setDescription(request.description());
        }
        if (request.assignedToId() != null) {
            task.setAssignedTo(getUserOrThrow(request.assignedToId()));
        }
        if (request.startDate() != null) {
            task.setStartDate(request.startDate());
        }
        if (request.dueDate() != null) {
            task.setDueDate(request.dueDate());
        }

        return mapper.toResponse(taskRepository.save(task));
    }

    /**
     * API: PATCH /api/tasks/{id}/status
     * Owner/admin, or the current assignee.
     */
    @Override
    public TaskResponse updateTaskStatus(Long taskId, UpdateTaskStatusRequest request, Long currentUserId) {
        Task task = getTaskOrThrow(taskId);
        validator.validateCanUpdateStatus(task, currentUserId);

        task.setStatus(request.status());

        return mapper.toResponse(taskRepository.save(task));
    }

    /**
     * API: DELETE /api/tasks/{id}
     * Owner or admin only.
     */
    @Override
    public void deleteTask(Long taskId, Long currentUserId) {
        Task task = getTaskOrThrow(taskId);
        validator.validateCanManageTask(task.getProject().getOrganization(), currentUserId);

        taskRepository.delete(task);
    }

    /**
     * API: GET /api/tasks/{id}
     */
    @Override
    @Transactional(readOnly = true)
    public TaskResponse getTask(Long taskId) {
        return mapper.toResponse(getTaskOrThrow(taskId));
    }

    /**
     * API: GET /api/tasks/project/{projectId}
     * Paginated, optionally filtered by task title (search) and/or assignedToId.
     * search and assignedToId are both optional; pass null/blank to skip a filter.
     */
    @Override
    @Transactional(readOnly = true)
    public Page<TaskResponse> getTasksByProject(Long projectId, String search, Long assignedToId, Pageable pageable) {
        // Confirms the project exists so a bad id 404s instead of silently
        // returning an empty page.
        getProjectOrThrow(projectId);

        String normalizedSearch = (search != null && !search.isBlank()) ? search.trim() : null;

        return taskRepository
                .findByProjectWithFilters(projectId, normalizedSearch, assignedToId, pageable)
                .map(mapper::toResponse);
    }

    /**
     * API: GET /api/tasks/project/{projectId}/assignees
     * Returns the distinct set of users currently assigned to at least one
     * task in this project — used to populate the "filter by assignee"
     * dropdown on the frontend.
     */
    @Override
    @Transactional(readOnly = true)
    public List<UserSummaryResponse> getAssigneesForProject(Long projectId) {
        getProjectOrThrow(projectId);

        return taskRepository.findDistinctAssignedUsersByProjectId(projectId)
                .stream()
                .map(this::toUserSummary)
                .collect(Collectors.toList());
    }

    // ---- private helpers ----

    private Project getProjectOrThrow(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id " + projectId));
    }

    private Task getTaskOrThrow(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id " + taskId));
    }

    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + userId));
    }

    private UserSummaryResponse toUserSummary(User user) {
        String fullName = ((user.getFirstName() != null ? user.getFirstName() : "") + " "
                + (user.getLastName() != null ? user.getLastName() : "")).trim();
        return new UserSummaryResponse(user.getId(), fullName, user.getEmail());
    }
}