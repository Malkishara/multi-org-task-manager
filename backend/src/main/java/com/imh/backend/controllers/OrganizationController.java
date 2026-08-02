package com.imh.backend.controllers;

import com.imh.backend.dtos.*;
import com.imh.backend.exceptions.ResourceNotFoundException;
import com.imh.backend.repositories.UserRepository;
import com.imh.backend.services.OrganizationService;
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
 * REST Controller — thin HTTP layer only. It never contains business logic;
 * it just validates the request shape (via @Valid on the DTOs), extracts the
 * current user id from the security context, and delegates everything else
 * to OrganizationService. Errors thrown from the service/validator bubble up
 * to GlobalExceptionHandler, which is why there's no try/catch here.
 *
 * NOTE ON AUTH: getCurrentUserId() assumes the app's Spring Security
 * configuration exposes the authenticated user's id as the Authentication
 * principal name (a common JWT-filter setup). Adjust that one method to
 * match however your project's SecurityContext is populated - nothing
 * else in this controller/service depends on how auth is wired.
 */
@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;
    private final UserRepository userRepository;

    /**
     * POST /api/organizations
     * Any authenticated user can create an organization; they become its owner.
     */
    @PostMapping
    public ResponseEntity<OrganizationResponse> createOrganization(
            @Valid @RequestBody CreateOrganizationRequest request,
            Authentication authentication
    ) {
        OrganizationResponse response = organizationService.createOrganization(request, getCurrentUserId(authentication));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/organizations/{id}
     * Fetch a single organization by id.
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrganizationResponse> getOrganization(@PathVariable Long id) {
        return ResponseEntity.ok(organizationService.getOrganization(id));
    }

    /**
     * API: GET /api/organizations
     * Super admins see all organizations; everyone else sees only the
     * organizations they own. Optional name filter (case-insensitive partial
     * match), paginated, sorted by most recently created first by default.
     */
    @GetMapping
    public ResponseEntity<Page<OrganizationResponse>> getMyOrganizations(
            @RequestParam(required = false) String name,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) {

        boolean isSuperAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));

        return ResponseEntity.ok(
                organizationService.getOrganizations(getCurrentUserId(authentication), name, isSuperAdmin, pageable));
    }

    /**
     * PUT /api/organizations/{id}
     * Owner-only. Updates name/description/logo.
     */
    @PutMapping("/{id}")
    public ResponseEntity<OrganizationResponse> updateOrganization(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrganizationRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                organizationService.updateOrganization(id, request, getCurrentUserId(authentication))
        );
    }

    /**
     * DELETE /api/organizations/{id}
     * Owner-only, and only allowed if the organization has no projects yet.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrganization(@PathVariable Long id, Authentication authentication) {
        organizationService.deleteOrganization(id, getCurrentUserId(authentication));
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/organizations/{id}/status
     * Owner-only. Flips active/inactive without touching name/description/logo,
     * so the UI status toggle doesn't need to resend the whole organization.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<OrganizationResponse> updateOrganizationStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrganizationStatusRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                organizationService.updateOrganizationStatus(id, request.active(), getCurrentUserId(authentication))
        );
    }


    /**
     * Extracts the authenticated user's id.
     * ADAPT THIS to your actual Authentication/UserDetails implementation.
     */
    private Long getCurrentUserId(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email " + email))
                .getId();
    }
}
