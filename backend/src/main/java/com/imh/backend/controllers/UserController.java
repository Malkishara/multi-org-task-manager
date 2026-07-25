package com.imh.backend.controllers;


import com.imh.backend.dtos.UserProfileResponse;
import com.imh.backend.services.UserService;


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

}