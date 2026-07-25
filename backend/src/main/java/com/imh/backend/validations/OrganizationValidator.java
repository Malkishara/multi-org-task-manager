package com.imh.backend.validations;

import com.imh.backend.dtos.AddMemberRequest;
import com.imh.backend.entities.Organization;
import com.imh.backend.entities.OrganizationMember.OrgRole;
import com.imh.backend.entities.User;
import com.imh.backend.exceptions.BadRequestException;
import com.imh.backend.exceptions.ConflictException;
import com.imh.backend.exceptions.UnauthorizedException;
import com.imh.backend.repositories.OrganizationMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Validator pattern — separates "is this request/state allowed?" checks
 * from "how do we perform it?" logic in the service. Every method either
 * returns silently (valid) or throws one of the custom exceptions handled
 * by GlobalExceptionHandler. Bean-level field validation (e.g. @NotBlank)
 * stays on the DTOs; this class is for cross-entity / authorization /
 * state-dependent business rules that annotations can't express.
 */
@Component
@RequiredArgsConstructor
public class OrganizationValidator {

    private final OrganizationMemberRepository organizationMemberRepository;

    /**
     * Only the OWNER of the organization may update its details.
     */
    public void validateCanUpdate(Organization organization, Long currentUserId) {
        requireOwner(organization, currentUserId, "update");
    }

    /**
     * Only the OWNER may delete the organization, and only if it has
     * no projects created yet.
     */
    public void validateCanDelete(Organization organization, Long currentUserId) {
        requireOwner(organization, currentUserId, "delete");

//        if (projectRepository.existsByOrganizationId(organization.getId())) {
//            throw new ConflictException(
//                    "Cannot delete an organization that already has projects. Delete or transfer the projects first."
//            );
//        }
    }

    /**
     * Only the OWNER may add new members, the target user must not
     * already be a member, and members can only be added as ADMIN or MEMBER
     * (OWNER is fixed at organization-creation time).
     */
    public void validateCanAddMember(Organization organization, Long currentUserId, User targetUser, AddMemberRequest request) {
        requireOwner(organization, currentUserId, "add members to");

        if (request.role() == OrgRole.OWNER) {
            throw new BadRequestException("Cannot assign the OWNER role through this endpoint");
        }

        if (targetUser.getId().equals(organization.getOwner().getId())) {
            throw new ConflictException("This user is already the owner of the organization");
        }

        if (organizationMemberRepository.existsByOrganizationIdAndUserId(organization.getId(), targetUser.getId())) {
            throw new ConflictException("This user is already a member of the organization");
        }
    }

    /**
     * Only the OWNER may remove a member, and the owner cannot remove themself
     * this way (they would need to delete/transfer the organization instead).
     */
    public void validateCanRemoveMember(Organization organization, Long currentUserId, Long targetUserId) {
        requireOwner(organization, currentUserId, "remove members from");

        if (targetUserId.equals(organization.getOwner().getId())) {
            throw new BadRequestException("The owner cannot be removed from the organization");
        }
    }

    /**
     * Shared authorization check: current user must be the organization's owner.
     */
    private void requireOwner(Organization organization, Long currentUserId, String action) {
        if (!organization.getOwner().getId().equals(currentUserId)) {
            throw new UnauthorizedException("Only the owner can " + action + " this organization");
        }
    }
}
