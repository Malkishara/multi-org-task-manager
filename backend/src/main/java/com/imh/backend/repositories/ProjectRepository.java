package com.imh.backend.repositories;

import com.imh.backend.entities.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByOrganizationId(Long organizationId);

    /**
     * organizationId: pass null to search across all organizations
     * (only meaningful for SUPER_ADMIN — service layer enforces that).
     * searchPattern: a pre-built "%term%" lowercase pattern, or null to skip
     * the name/description filter.
     */
    @Query("""
        SELECT p
        FROM Project p
        WHERE (:organizationId IS NULL OR p.organization.id = :organizationId)
          AND (
            :searchPattern IS NULL
            OR LOWER(p.name) LIKE :searchPattern
            OR LOWER(COALESCE(p.description, '')) LIKE :searchPattern
          )
        """)
    Page<Project> search(
            @Param("organizationId") Long organizationId,
            @Param("searchPattern") String searchPattern,
            Pageable pageable
    );
}
