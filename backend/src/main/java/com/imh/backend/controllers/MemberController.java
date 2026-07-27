package com.imh.backend.controllers;

import com.imh.backend.dtos.AddMemberRequest;
import com.imh.backend.dtos.OrganizationMemberResponse;
import com.imh.backend.exceptions.ResourceNotFoundException;
import com.imh.backend.repositories.UserRepository;
import com.imh.backend.services.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Flattened, member-first REST API. Complements OrganizationController's
 * nested /api/organizations/{id}/members endpoints (which stay as-is) with
 * a top-level view: add, remove, get a single membership by its own id, and
 * list members with an optional organizationId filter.
 *
 * Thin controller only - no business logic, everything delegates to
 * MemberService. Errors bubble up to GlobalExceptionHandler.
 */
@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;
    private final UserRepository userRepository;

    /**
     * POST /api/members
     * Owner-only (of the organization named in the request body). Adds an
     * existing user as ADMIN or MEMBER.
     */
    @PostMapping
    public ResponseEntity<OrganizationMemberResponse> addMember(
            @Valid @RequestBody AddMemberRequest request,
            Authentication authentication
    ) {
        OrganizationMemberResponse response = memberService.addMember(request, getCurrentUserId(authentication));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * DELETE /api/members/{id}
     * Owner-only. {id} is the membership row's own id (not a user id).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeMember(@PathVariable Long id, Authentication authentication) {
        memberService.removeMember(id, getCurrentUserId(authentication));
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/members/{id}
     * Fetch a single membership by its own id.
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrganizationMemberResponse> getMember(@PathVariable Long id) {
        return ResponseEntity.ok(memberService.getMember(id));
    }

    /**
     * GET /api/members
     * GET /api/members?organizationId={organizationId}
     * organizationId is optional: provide it to filter to one organization,
     * omit it to list every member across every organization.
     */
    @GetMapping
    public ResponseEntity<List<OrganizationMemberResponse>> getMembers(
            @RequestParam(required = false) Long organizationId
    ) {
        return ResponseEntity.ok(memberService.getMembers(organizationId));
    }

    /**
     * Extracts the authenticated user's id. Mirrors OrganizationController's
     * implementation - adapt both together if your auth wiring changes.
     */
    private Long getCurrentUserId(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email " + email))
                .getId();
    }
}
