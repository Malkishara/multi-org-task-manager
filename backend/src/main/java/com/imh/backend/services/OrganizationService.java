package com.imh.backend.services;

import com.imh.backend.dtos.AddMemberRequest;
import com.imh.backend.dtos.CreateOrganizationRequest;
import com.imh.backend.dtos.OrganizationMemberResponse;
import com.imh.backend.dtos.OrganizationResponse;
import com.imh.backend.dtos.UpdateOrganizationRequest;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service Layer pattern — defines the business operations available for
 * organizations. Controllers depend on this interface (not the impl),
 * which keeps the HTTP layer swappable/testable and lets us mock the
 * service in controller tests.
 */
public interface OrganizationService {

    OrganizationResponse createOrganization(CreateOrganizationRequest request, Long currentUserId);

    OrganizationResponse getOrganization(Long organizationId);

    OrganizationResponse updateOrganization(Long organizationId, UpdateOrganizationRequest request, Long currentUserId);

    void deleteOrganization(Long organizationId, Long currentUserId);

    OrganizationResponse updateOrganizationStatus(Long id, @NotNull(message = "active is required") Boolean active, Long currentUserId);

    Page<OrganizationResponse> getOrganizations(Long currentUserId, String name, boolean isSuperAdmin, Pageable pageable);
}
