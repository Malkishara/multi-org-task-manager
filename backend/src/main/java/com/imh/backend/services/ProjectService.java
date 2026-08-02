package com.imh.backend.services;

import com.imh.backend.dtos.CreateProjectRequest;
import com.imh.backend.dtos.ProjectResponse;
import com.imh.backend.dtos.UpdateProjectRequest;
import com.imh.backend.dtos.UpdateProjectStatusRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.nio.file.AccessDeniedException;
import java.util.List;

public interface ProjectService {

    ProjectResponse createProject(CreateProjectRequest request, Long currentUserId);

    ProjectResponse updateProject(Long projectId, UpdateProjectRequest request, Long currentUserId);

    ProjectResponse updateProjectStatus(Long projectId, UpdateProjectStatusRequest request, Long currentUserId);

    void deleteProject(Long projectId, Long currentUserId);

    ProjectResponse getProject(Long projectId);

    /**
     * organizationId is optional - null returns every project across every
     * organization.
     */
    Page<ProjectResponse> getProjects(Long organizationId, String search, Pageable pageable, String email) throws AccessDeniedException;}
