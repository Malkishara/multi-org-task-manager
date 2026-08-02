package com.imh.backend.repositories;

import com.imh.backend.entities.Organization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    boolean existsBySlug(String candidate);

    Page<Organization> findByOwnerId(Long ownerId, Pageable pageable);

    Page<Organization> findByOwnerIdAndNameContainingIgnoreCase(Long ownerId, String name, Pageable pageable);

    Page<Organization> findByNameContainingIgnoreCase(String name, Pageable pageable);

    /**
     * Organizations a user can see: ones they own directly (Organization.owner)
     * OR ones they have any OrganizationMember row for (OWNER/ADMIN/MEMBER).
     * These aren't mutually exclusive in general, but the owner is also
     * always given an OWNER membership row on creation (see
     * OrganizationServiceImpl#createOrganization), so DISTINCT avoids
     * duplicate rows from the join for that overlap.
     *
     * :name is optional - pass null to skip the name filter. Cast to
     * string explicitly so Postgres doesn't fail on a null parameter
     * (it otherwise infers "bytea" for a null bind and LOWER() on bytea
     * errors out - see the earlier task-search bug for the same issue).
     */
    @Query("""
        SELECT DISTINCT o FROM Organization o
        LEFT JOIN OrganizationMember om ON om.organization = o AND om.user.id = :userId
        WHERE (o.owner.id = :userId OR om.user.id = :userId)
        AND (:name IS NULL OR LOWER(o.name) LIKE LOWER(CONCAT('%', CAST(:name AS string), '%')))
    """)
    Page<Organization> findAccessibleByUser(
            @Param("userId") Long userId,
            @Param("name") String name,
            Pageable pageable
    );

// findAll(Pageable) already comes free from JpaRepository/PagingAndSortingRepository
}