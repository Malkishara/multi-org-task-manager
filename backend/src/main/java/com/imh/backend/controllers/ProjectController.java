package com.imh.backend.controllers;

import com.imh.backend.dtos.*;
import com.imh.backend.exceptions.ResourceNotFoundException;
import com.imh.backend.repositories.UserRepository;
import com.imh.backend.services.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller - thin HTTP layer only, mirrors OrganizationController's
 * conventions. Delegates everything to ProjectService; errors bubble up to
 * GlobalExceptionHandler.
 */
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final UserRepository userRepository;

    /**
     * POST /api/projects
     * Owner or admin (of the organization named in the request body) only.
     */
    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            Authentication authentication
    ) {
        ProjectResponse response = projectService.createProject(request, getCurrentUserId(authentication));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * PUT /api/projects/{id}
     * Owner or admin only. Updates name/description/dates.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProjectRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                projectService.updateProject(id, request, getCurrentUserId(authentication))
        );
    }

    /**
     * PATCH /api/projects/{id}/status
     * Owner or admin only. Dedicated status/progress endpoint so the UI
     * doesn't need to resend name/description/dates just to move a project
     * along.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ProjectResponse> updateProjectStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProjectStatusRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                projectService.updateProjectStatus(id, request, getCurrentUserId(authentication))
        );
    }

    /**
     * DELETE /api/projects/{id}
     * Owner or admin only.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id, Authentication authentication) {
        projectService.deleteProject(id, getCurrentUserId(authentication));
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/projects/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProject(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProject(id));
    }

    /**
     * GET /api/projects
     * GET /api/projects?organizationId={organizationId}
     * organizationId is optional: provide it to filter to one organization,
     * omit it to list every project across every organization.
     */
    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getProjects(
            @RequestParam(required = false) Long organizationId
    ) {
        return ResponseEntity.ok(projectService.getProjects(organizationId));
    }

    private Long getCurrentUserId(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email " + email))
                .getId();
    }
}
