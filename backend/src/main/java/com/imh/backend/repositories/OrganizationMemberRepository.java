package com.imh.backend.repositories;

import com.imh.backend.entities.OrganizationMember;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    /**
     * organizationId: pass null to search across all organizations.
     * search: matches first name, last name, or "first last" together,
     * case-insensitive partial match; pass null to skip the name filter.
     */
    @Query("""
SELECT m
FROM OrganizationMember m
JOIN FETCH m.user u
WHERE (:organizationId IS NULL
        OR m.organization.id = :organizationId)
 AND (
    :search IS NULL 
     OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
     OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
     OR LOWER(
         CONCAT(
             COALESCE(u.firstName, ''),
             ' ',
             COALESCE(u.lastName, '')
         )
     )
     LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
     OR LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
)
""")
    Page<OrganizationMember> search(
            @Param("organizationId") Long organizationId,
            @Param("search") String search,
            Pageable pageable
    );
}
