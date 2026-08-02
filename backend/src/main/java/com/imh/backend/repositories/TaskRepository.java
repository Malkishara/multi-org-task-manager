package com.imh.backend.repositories;

import com.imh.backend.entities.Task;
import com.imh.backend.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProjectId(Long projectId);

    @Query("""
    SELECT t FROM Task t
    WHERE t.project.id = :projectId
    AND (:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
    AND (:assignedToId IS NULL OR t.assignedTo.id = :assignedToId)
""")
    Page<Task> findByProjectWithFilters(
            @Param("projectId") Long projectId,
            @Param("search") String search,
            @Param("assignedToId") Long assignedToId,
            Pageable pageable
    );

    @Query("""
    SELECT DISTINCT t.assignedTo FROM Task t
    WHERE t.project.id = :projectId
    AND t.assignedTo IS NOT NULL
""")
    List<User> findDistinctAssignedUsersByProjectId(@Param("projectId") Long projectId);
}
