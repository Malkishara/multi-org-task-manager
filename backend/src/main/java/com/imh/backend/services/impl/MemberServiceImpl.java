package com.imh.backend.services.impl;

import com.imh.backend.dtos.AddMemberRequest;
import com.imh.backend.dtos.AddMemberRequest;
import com.imh.backend.dtos.OrganizationMemberResponse;
import com.imh.backend.entities.Organization;
import com.imh.backend.entities.OrganizationMember;
import com.imh.backend.entities.User;
import com.imh.backend.exceptions.ResourceNotFoundException;
import com.imh.backend.mappers.OrganizationMapper;
import com.imh.backend.repositories.OrganizationMemberRepository;
import com.imh.backend.repositories.OrganizationRepository;
import com.imh.backend.repositories.UserRepository;
import com.imh.backend.services.MemberService;
import com.imh.backend.validations.OrganizationValidator;
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
public class MemberServiceImpl implements MemberService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final UserRepository userRepository;
    private final OrganizationValidator validator;
    private final OrganizationMapper mapper;

    /**
     * API: POST /api/members
     * Owner-only (enforced by the same validator the nested endpoint uses).
     * organizationId comes from the request body since there's no path
     * variable here.
     */
    @Override
    public OrganizationMemberResponse addMember(AddMemberRequest request, Long currentUserId) {
        Organization organization = getOrganizationOrThrow(request.organizationId());
        User targetUser = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("No user found with email " + request.email()));

        // Reuse the existing validator, which expects an AddMemberRequest -
        validator.validateCanAddMember(organization, currentUserId, targetUser, request);

        OrganizationMember member = OrganizationMember.builder()
                .organization(organization)
                .user(targetUser)
                .role(request.role())
                .build();

        return mapper.toMemberResponse(organizationMemberRepository.save(member));
    }

    /**
     * API: DELETE /api/members/{id}
     * Owner-only. Unlike the nested endpoint (which takes org id + user id),
     * this takes the membership row's own id and derives the organization
     * and target user from it.
     */
    @Override
    public void removeMember(Long memberId, Long currentUserId) {
        OrganizationMember member = getMemberOrThrow(memberId);

        validator.validateCanRemoveMember(member.getOrganization(), currentUserId, member.getUser().getId());

        organizationMemberRepository.delete(member);
    }

    /**
     * API: GET /api/members/{id}
     */
    @Override
    @Transactional(readOnly = true)
    public OrganizationMemberResponse getMember(Long memberId) {
        return mapper.toMemberResponse(getMemberOrThrow(memberId));
    }

    /**
     * API: GET /api/members
     * organizationId is optional (null -> members across every organization).
     * search is optional and matches the member's first and/or last name.
     * Each result includes the member's user account status.
     */
    @Override
    @Transactional(readOnly = true)
    public Page<OrganizationMemberResponse> getMembers(Long organizationId, String search, Pageable pageable) {
        if (organizationId != null) {
            // Confirms the organization exists so a bad id 404s instead of
            // silently returning an empty page.
            getOrganizationOrThrow(organizationId);
        }

        String trimmedSearch = (search != null && !search.isBlank()) ? search.trim() : null;

        Page<OrganizationMember> members =
                organizationMemberRepository.search(organizationId, trimmedSearch, pageable);

        return members.map(mapper::toMemberResponse);
    }

    // ---- private helpers ----

    private Organization getOrganizationOrThrow(Long organizationId) {
        return organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id " + organizationId));
    }

    private OrganizationMember getMemberOrThrow(Long memberId) {
        return organizationMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id " + memberId));
    }
}
