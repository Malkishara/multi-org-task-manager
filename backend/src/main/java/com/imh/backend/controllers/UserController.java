package com.imh.backend.controllers;


import com.imh.backend.dtos.UpdateUserProfileRequest;
import com.imh.backend.dtos.UserProfileResponse;
import com.imh.backend.services.UserService;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;


import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {



    private final UserService userService;



    /**
     * Get currently authenticated user profile.
     *
     * Endpoint:
     * GET /api/users/profile
     *
     *
     * Request:
     * Authorization: Bearer <JWT_TOKEN>
     *
     *
     * Response:
     *
     * {
     *   "id":1,
     *   "firstName":"Isuru",
     *   "lastName":"Hansamali",
     *   "email":"isuru@gmail.com",
     *   "role":"ADMIN",
     *   "active":true
     * }
     *
     */
    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getCurrentUser(
            Authentication authentication
    ){


        String email =
                authentication.getName();



        return ResponseEntity.ok(
                userService.getCurrentUserProfile(email)
        );

    }


    /**
     * Update currently authenticated user's profile.
     *
     * Endpoint:
     * PUT /api/users/profile
     *
     *
     * Request:
     * Authorization: Bearer <JWT_TOKEN>
     *
     * {
     *   "firstName":"Isuru",
     *   "lastName":"Perera"
     * }
     *
     *
     * Response: same shape as GET /api/users/profile, reflecting the change.
     *
     * Only firstName/lastName can change here - email and password are
     * handled by separate endpoints since they need extra checks
     * (uniqueness, current-password verification).
     */
    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateCurrentUser(
            @Valid @RequestBody UpdateUserProfileRequest request,
            Authentication authentication
    ){

        String email =
                authentication.getName();

        return ResponseEntity.ok(
                userService.updateCurrentUserProfile(email, request)
        );

    }

}