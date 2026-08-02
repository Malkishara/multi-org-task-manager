package com.imh.backend.controllers;

import com.imh.backend.dtos.*;
import com.imh.backend.exceptions.ResourceNotFoundException;
import com.imh.backend.repositories.UserRepository;
import com.imh.backend.services.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller - thin HTTP layer only, mirrors ProjectController's
 * conventions. Delegates everything to TaskService; errors bubble up to
 * GlobalExceptionHandler.
 */
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final UserRepository userRepository;

    /**
     * POST /api/tasks
     * Owner or admin (of the project's organization) only.
     */
    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @Valid @RequestBody CreateTaskRequest request,
            Authentication authentication
    ) {
        TaskResponse response = taskService.createTask(request, getCurrentUserId(authentication));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * PUT /api/tasks/{id}
     * Owner or admin only. Updates title/description/assignee/dates.
     */
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                taskService.updateTask(id, request, getCurrentUserId(authentication))
        );
    }

    /**
     * PATCH /api/tasks/{id}/status
     * Owner/admin, or the current assignee.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskResponse> updateTaskStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskStatusRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                taskService.updateTaskStatus(id, request, getCurrentUserId(authentication))
        );
    }

    /**
     * DELETE /api/tasks/{id}
     * Owner or admin only.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id, Authentication authentication) {
        taskService.deleteTask(id, getCurrentUserId(authentication));
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/tasks/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTask(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTask(id));
    }

    /**
     * GET /api/tasks/project/{projectId}
     * Optional: ?search=<task title>&assignedToId=<userId>&page=&size=&sort=
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<Page<TaskResponse>> getTasksByProject(
            @PathVariable Long projectId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long assignedToId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(
                taskService.getTasksByProject(projectId, search, assignedToId, pageable)
        );
    }

    /**
     * GET /api/tasks/project/{projectId}/assignees
     * Distinct users assigned to at least one task in this project.
     */
    @GetMapping("/project/{projectId}/assignees")
    public ResponseEntity<List<UserSummaryResponse>> getAssigneesForProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(taskService.getAssigneesForProject(projectId));
    }

    private Long getCurrentUserId(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email " + email))
                .getId();
    }
}
