package com.imh.backend.services.impl;

import com.imh.backend.dtos.AddMemberRequest;
import com.imh.backend.dtos.CreateOrganizationRequest;
import com.imh.backend.dtos.OrganizationMemberResponse;
import com.imh.backend.dtos.OrganizationResponse;
import com.imh.backend.dtos.UpdateOrganizationRequest;
import com.imh.backend.entities.Organization;
import com.imh.backend.entities.OrganizationMember;
import com.imh.backend.entities.User;
import com.imh.backend.exceptions.ResourceNotFoundException;
import com.imh.backend.mappers.OrganizationMapper;
import com.imh.backend.repositories.OrganizationMemberRepository;
import com.imh.backend.repositories.OrganizationRepository;
import com.imh.backend.repositories.UserRepository;
import com.imh.backend.services.OrganizationService;
import com.imh.backend.validations.OrganizationValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service Layer pattern (impl) — all business logic for organizations lives
 * here. Controllers only translate HTTP <-> DTOs and delegate to this class;
 * this class never touches HttpServletRequest/ResponseEntity, and the
 * validator/repositories never talk to each other directly, only through
 * this orchestration layer. Each public method maps to exactly one API
 * operation described in the controller.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final UserRepository userRepository;
    private final OrganizationValidator validator;
    private final OrganizationMapper mapper;

    /**
     * API: POST /api/organizations
     * Any authenticated user can create an organization. The creator is
     * automatically stored as the owner (Organization.owner) and also gets
     * an OrganizationMember row with role OWNER, so membership listing and
     * ownership checks can both be driven off consistent data.
     */
    @Override
    public OrganizationResponse createOrganization(CreateOrganizationRequest request, Long currentUserId) {
        User owner = getUserOrThrow(currentUserId);

        String slug = generateUniqueSlug(request.name());

        Organization organization = Organization.builder()
                .name(request.name())
                .description(request.description())
                .logoUrl(request.logoUrl())
                .slug(slug)
                .owner(owner)
                .active(true)
                .build();

        organization = organizationRepository.save(organization);

        // Owner is also recorded as a member with role OWNER for consistent
        // membership queries (e.g. "list all orgs I belong to").
        OrganizationMember ownerMembership = OrganizationMember.builder()
                .organization(organization)
                .user(owner)
                .role(OrganizationMember.OrgRole.OWNER)
                .build();
        organizationMemberRepository.save(ownerMembership);

        return mapper.toResponse(organization);
    }

    /**
     * API: GET /api/organizations/{id}
     * Fetches a single organization by id. Any authenticated user can view
     * it (no ownership check) — tighten this if organizations should be private.
     */
    @Override
    @Transactional(readOnly = true)
    public OrganizationResponse getOrganization(Long organizationId) {
        return mapper.toResponse(getOrganizationOrThrow(organizationId));
    }

    /**
     * API: GET /api/organizations
     * Lists every organization owned by the current user.
     */
    @Override
    @Transactional(readOnly = true)
    public List<OrganizationResponse> getMyOrganizations(Long currentUserId) {
        return organizationRepository.findByOwnerId(currentUserId)
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * API: PUT /api/organizations/{id}
     * Only the owner can update. Only non-null fields in the request are
     * applied (partial update).
     */
    @Override
    public OrganizationResponse updateOrganization(Long organizationId, UpdateOrganizationRequest request, Long currentUserId) {
        Organization organization = getOrganizationOrThrow(organizationId);

        validator.validateCanUpdate(organization, currentUserId);

        if (request.name() != null && !request.name().isBlank()) {
            organization.setName(request.name());
        }
        if (request.description() != null) {
            organization.setDescription(request.description());
        }
        if (request.logoUrl() != null) {
            organization.setLogoUrl(request.logoUrl());
        }

        return mapper.toResponse(organizationRepository.save(organization));
    }

    /**
     * API: DELETE /api/organizations/{id}
     * Only the owner can delete, and only while no project has been
     * created under the organization yet.
     */
    @Override
    public void deleteOrganization(Long organizationId, Long currentUserId) {
        Organization organization = getOrganizationOrThrow(organizationId);

        validator.validateCanDelete(organization, currentUserId);

        organizationRepository.delete(organization);
    }

    /**
     * API: POST /api/organizations/{id}/members
     * Only the owner can add other members, and only as ADMIN or MEMBER.
     */
    @Override
    public OrganizationMemberResponse addMember(Long organizationId, AddMemberRequest request, Long currentUserId) {
        Organization organization = getOrganizationOrThrow(organizationId);
        User targetUser = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("No user found with email " + request.email()));

        validator.validateCanAddMember(organization, currentUserId, targetUser, request);

        OrganizationMember member = OrganizationMember.builder()
                .organization(organization)
                .user(targetUser)
                .role(request.role())
                .build();

        return mapper.toMemberResponse(organizationMemberRepository.save(member));
    }

    /**
     * API: DELETE /api/organizations/{id}/members/{userId}
     * Only the owner can remove a member; the owner cannot remove themself.
     */
    @Override
    public void removeMember(Long organizationId, Long targetUserId, Long currentUserId) {
        Organization organization = getOrganizationOrThrow(organizationId);

        validator.validateCanRemoveMember(organization, currentUserId, targetUserId);

        OrganizationMember member = organizationMemberRepository
                .findByOrganizationIdAndUserId(organizationId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("This user is not a member of the organization"));

        organizationMemberRepository.delete(member);
    }

    /**
     * API: GET /api/organizations/{id}/members
     * Lists every member (including the owner) of an organization.
     */
    @Override
    @Transactional(readOnly = true)
    public List<OrganizationMemberResponse> getMembers(Long organizationId) {
        // Ensures a 404 is raised for a non-existent organization instead of
        // silently returning an empty list.
        getOrganizationOrThrow(organizationId);

        return organizationMemberRepository.findByOrganizationId(organizationId)
                .stream()
                .map(mapper::toMemberResponse)
                .collect(Collectors.toList());
    }

    /**
     * API: PATCH /api/organizations/{id}/status
     * Only the owner can toggle active/inactive. Raises the standard
     * "organization not found" error for a bad id, and reuses the same
     * ownership check as the full update endpoint - flipping status is
     * still an update operation, just a narrower one.
     */
    @Override
    public OrganizationResponse updateOrganizationStatus(Long id, Boolean active, Long currentUserId) {
        Organization organization = getOrganizationOrThrow(id);

        validator.validateCanUpdate(organization, currentUserId);

        organization.setActive(active);

        return mapper.toResponse(organizationRepository.save(organization));
    }

    // ---- private helpers ----

    private Organization getOrganizationOrThrow(Long organizationId) {
        return organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id " + organizationId));
    }

    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + userId));
    }

    /**
     * Derives a URL-friendly slug from the organization name and appends a
     * short random suffix if there's a collision, guaranteeing uniqueness
     * without bothering the client with slug management.
     */
    private String generateUniqueSlug(String name) {
        String base = name.toLowerCase(Locale.ROOT)
                .trim()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-");

        String candidate = base;
        while (organizationRepository.existsBySlug(candidate)) {
            candidate = base + "-" + UUID.randomUUID().toString().substring(0, 6);
        }
        return candidate;
    }
}
