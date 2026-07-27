package com.imh.backend.services;

import com.imh.backend.dtos.CreateProjectRequest;
import com.imh.backend.dtos.ProjectResponse;
import com.imh.backend.dtos.UpdateProjectRequest;
import com.imh.backend.dtos.UpdateProjectStatusRequest;

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
    List<ProjectResponse> getProjects(Long organizationId);
}
