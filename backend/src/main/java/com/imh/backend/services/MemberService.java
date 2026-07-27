package com.imh.backend.services;

import com.imh.backend.dtos.AddMemberRequest;
import com.imh.backend.dtos.OrganizationMemberResponse;

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

    /**
     * Lists members. If organizationId is null, returns every member across
     * every organization; otherwise filters to that organization (404s if
     * the organization doesn't exist).
     */
    List<OrganizationMemberResponse> getMembers(Long organizationId);
}
