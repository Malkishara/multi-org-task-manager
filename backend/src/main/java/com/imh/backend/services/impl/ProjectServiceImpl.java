package com.imh.backend.services.impl;

import com.imh.backend.dtos.CreateProjectRequest;
import com.imh.backend.dtos.ProjectResponse;
import com.imh.backend.dtos.UpdateProjectRequest;
import com.imh.backend.dtos.UpdateProjectStatusRequest;
import com.imh.backend.entities.Organization;
import com.imh.backend.entities.Project;
import com.imh.backend.entities.User;
import com.imh.backend.exceptions.ResourceNotFoundException;
import com.imh.backend.mappers.ProjectMapper;
import com.imh.backend.repositories.OrganizationRepository;
import com.imh.backend.repositories.ProjectRepository;
import com.imh.backend.repositories.UserRepository;
import com.imh.backend.services.ProjectService;
import com.imh.backend.validations.ProjectValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final ProjectValidator validator;
    private final ProjectMapper mapper;

    /**
     * API: POST /api/projects
     * Owner or admin only. status/progress default to NOT_STARTED / 0 via
     * the entity's @PrePersist.
     */
    @Override
    public ProjectResponse createProject(CreateProjectRequest request, Long currentUserId) {
        Organization organization = getOrganizationOrThrow(request.organizationId());
        validator.validateCanManageProjects(organization, currentUserId);

        User creator = getUserOrThrow(currentUserId);

        Project project = Project.builder()
                .name(request.name())
                .description(request.description())
                .organization(organization)
                .createdBy(creator)
                .startDate(request.startDate())
                .endDate(request.endDate())
                .build();

        return mapper.toResponse(projectRepository.save(project));
    }

    /**
     * API: PUT /api/projects/{id}
     * Owner or admin only. Only non-null fields in the request are applied.
     */
    @Override
    public ProjectResponse updateProject(Long projectId, UpdateProjectRequest request, Long currentUserId) {
        Project project = getProjectOrThrow(projectId);
        validator.validateCanManageProjects(project.getOrganization(), currentUserId);

        if (request.name() != null && !request.name().isBlank()) {
            project.setName(request.name());
        }
        if (request.description() != null) {
            project.setDescription(request.description());
        }
        if (request.startDate() != null) {
            project.setStartDate(request.startDate());
        }
        if (request.endDate() != null) {
            project.setEndDate(request.endDate());
        }

        return mapper.toResponse(projectRepository.save(project));
    }

    /**
     * API: PATCH /api/projects/{id}/status
     * Owner or admin only. progress is optional - status can change without
     * touching the percentage.
     */
    @Override
    public ProjectResponse updateProjectStatus(Long projectId, UpdateProjectStatusRequest request, Long currentUserId) {
        Project project = getProjectOrThrow(projectId);
        validator.validateCanManageProjects(project.getOrganization(), currentUserId);

        project.setStatus(request.status());
        if (request.progress() != null) {
            project.setProgress(request.progress());
        }

        return mapper.toResponse(projectRepository.save(project));
    }

    /**
     * API: DELETE /api/projects/{id}
     * Owner or admin only.
     */
    @Override
    public void deleteProject(Long projectId, Long currentUserId) {
        Project project = getProjectOrThrow(projectId);
        validator.validateCanManageProjects(project.getOrganization(), currentUserId);

        projectRepository.delete(project);
    }

    /**
     * API: GET /api/projects/{id}
     */
    @Override
    @Transactional(readOnly = true)
    public ProjectResponse getProject(Long projectId) {
        return mapper.toResponse(getProjectOrThrow(projectId));
    }

    /**
     * API: GET /api/projects?organizationId=...
     */
    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjects(Long organizationId) {
        List<Project> projects;

        if (organizationId != null) {
            getOrganizationOrThrow(organizationId);
            projects = projectRepository.findByOrganizationId(organizationId);
        } else {
            projects = projectRepository.findAll();
        }

        return projects.stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    // ---- private helpers ----

    private Organization getOrganizationOrThrow(Long organizationId) {
        return organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id " + organizationId));
    }

    private Project getProjectOrThrow(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id " + projectId));
    }

    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + userId));
    }
}
