package com.imh.backend.mappers;

import com.imh.backend.dtos.OrganizationMemberResponse;
import com.imh.backend.dtos.OrganizationResponse;
import com.imh.backend.entities.Organization;
import com.imh.backend.entities.OrganizationMember;
import org.springframework.stereotype.Component;

/**
 * Mapper pattern — all entity -> DTO conversion lives here so that
 * neither the service nor the controller has to know the entity's
 * internal shape. Keeping it a separate class (rather than static
 * methods on the DTO or logic inline in the service) keeps each class
 * focused on a single responsibility (SRP).
 */
@Component
public class OrganizationMapper {

    public OrganizationResponse toResponse(Organization organization) {
        return new OrganizationResponse(
                organization.getId(),
                organization.getName(),
                organization.getDescription(),
                organization.getSlug(),
                organization.getLogoUrl(),
                organization.isActive(),
                organization.getOwner().getId(),
                organization.getOwner().getFirstName() + " " + organization.getOwner().getLastName(),
                organization.getCreatedAt(),
                organization.getUpdatedAt()
        );
    }

    public OrganizationMemberResponse toMemberResponse(OrganizationMember member) {
        return new OrganizationMemberResponse(
                member.getId(),
                member.getUser().getId(),
                member.getUser().getFirstName() + " " + member.getUser().getLastName(),
                member.getUser().getEmail(),
                member.getRole(),
                member.getJoinedAt()
        );
    }
}
