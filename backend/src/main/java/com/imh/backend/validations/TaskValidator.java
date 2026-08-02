package com.imh.backend.validations;

import com.imh.backend.entities.Organization;
import com.imh.backend.entities.OrganizationMember;
import com.imh.backend.entities.Task;
import com.imh.backend.exceptions.BadRequestException;
import com.imh.backend.repositories.OrganizationMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Authorization rules for tasks:
 * - Create/update/delete (full edit): organization owner or an ADMIN member.
 * - Status-only update: owner/admin, OR the user the task is currently
 *   assigned to (so someone can move their own task along without needing
 *   admin rights).
 *
 * Adjust if your actual permission model differs (e.g. if LEADs should
 * also manage tasks - add that role check alongside the ADMIN check below).
 */
@Component
@RequiredArgsConstructor
public class TaskValidator {

    private final OrganizationMemberRepository organizationMemberRepository;

    public void validateCanManageTask(Organization organization, Long currentUserId) {
        if (isOwnerOrAdmin(organization, currentUserId)) {
            return;
        }
        throw new BadRequestException("Only the organization owner or an admin can manage tasks");
    }

    public void validateCanUpdateStatus(Task task, Long currentUserId) {
        boolean isAssignee = task.getAssignedTo() != null
                && task.getAssignedTo().getId().equals(currentUserId);

        if (isAssignee) {
            return;
        }

        if (isOwnerOrAdmin(task.getProject().getOrganization(), currentUserId)) {
            return;
        }

        throw new BadRequestException(
                "Only the organization owner, an admin, or the assignee can update this task's status"
        );
    }

    private boolean isOwnerOrAdmin(Organization organization, Long currentUserId) {
        if (organization.getOwner().getId().equals(currentUserId)) {
            return true;
        }
        return organizationMemberRepository
                .findByOrganizationIdAndUserId(organization.getId(), currentUserId)
                .map(member -> member.getRole() == OrganizationMember.OrgRole.OWNER
                        || member.getRole() == OrganizationMember.OrgRole.ADMIN)
                .orElse(false);
    }
}
