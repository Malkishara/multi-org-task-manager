package com.imh.backend.validations;

import com.imh.backend.entities.Organization;
import com.imh.backend.entities.OrganizationMember;
import com.imh.backend.exceptions.BadRequestException;
import com.imh.backend.repositories.OrganizationMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Authorization rules for projects: the organization's owner or an ADMIN
 * member can create/update/delete projects. Plain MEMBERs can only read.
 * Adjust here if your actual permission model differs (e.g. if MEMBERs
 * should also manage their own projects).
 */
@Component
@RequiredArgsConstructor
public class ProjectValidator {

    private final OrganizationMemberRepository organizationMemberRepository;

    public void validateCanManageProjects(Organization organization, Long currentUserId) {
        if (organization.getOwner().getId().equals(currentUserId)) {
            return;
        }

        boolean canManage = organizationMemberRepository
                .findByOrganizationIdAndUserId(organization.getId(), currentUserId)
                .map(member ->
                        member.getRole() == OrganizationMember.OrgRole.OWNER
                                || member.getRole() == OrganizationMember.OrgRole.ADMIN
                )
                .orElse(false);

        if (!canManage) {
            throw new BadRequestException("Only the organization owner or an admin can manage projects");
        }
    }
}
