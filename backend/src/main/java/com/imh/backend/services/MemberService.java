package com.imh.backend.services;

import com.imh.backend.dtos.AddMemberRequest;
import com.imh.backend.dtos.OrganizationMemberResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Business logic for the flattened /api/members endpoints. This sits
 * alongside OrganizationService rather than replacing it - the nested
 * /api/organizations/{id}/members endpoints keep working, this just adds
 * a member-first view (get by id, list with optional org filter) on top
 * of the same data.
 */
public interface MemberService {

    OrganizationMemberResponse addMember(AddMemberRequest request, Long currentUserId);

    void removeMember(Long memberId, Long currentUserId);

    OrganizationMemberResponse getMember(Long memberId);

    Page<OrganizationMemberResponse> getMembers(Long organizationId, String search, Pageable pageable);
}
