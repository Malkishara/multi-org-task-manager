package com.imh.backend.repositories;

import com.imh.backend.entities.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    boolean existsBySlug(String candidate);

    List<Organization> findByOwnerId(Long currentUserId);
}
