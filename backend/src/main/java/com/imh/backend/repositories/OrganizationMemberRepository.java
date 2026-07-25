package com.imh.backend.repositories;

import com.imh.backend.entities.OrganizationMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pattern — data access for OrganizationMember (the join
 * entity between User and Organization that also carries the role).
 */
public interface OrganizationMemberRepository extends JpaRepository<OrganizationMember, Long> {

    Optional<OrganizationMember> findByOrganizationIdAndUserId(Long organizationId, Long userId);

    boolean existsByOrganizationIdAndUserId(Long organizationId, Long userId);

    List<OrganizationMember> findByOrganizationId(Long organizationId);

    void deleteByOrganizationIdAndUserId(Long organizationId, Long userId);
}
