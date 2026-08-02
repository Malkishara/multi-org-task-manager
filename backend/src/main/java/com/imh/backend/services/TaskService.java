package com.imh.backend.services;

import com.imh.backend.dtos.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TaskService {

    TaskResponse createTask(CreateTaskRequest request, Long currentUserId);

    TaskResponse updateTask(Long taskId, UpdateTaskRequest request, Long currentUserId);

    TaskResponse updateTaskStatus(Long taskId, UpdateTaskStatusRequest request, Long currentUserId);

    void deleteTask(Long taskId, Long currentUserId);

    TaskResponse getTask(Long taskId);

    Page<TaskResponse> getTasksByProject(Long projectId, String search, Long assignedToId, Pageable pageable);

    List<UserSummaryResponse> getAssigneesForProject(Long projectId);}
