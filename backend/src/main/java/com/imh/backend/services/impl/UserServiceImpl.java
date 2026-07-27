package com.imh.backend.services.impl;


import com.imh.backend.dtos.UpdateUserProfileRequest;
import com.imh.backend.dtos.UserProfileResponse;
import com.imh.backend.entities.User;
import com.imh.backend.repositories.UserRepository;
import com.imh.backend.services.UserService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {


    private final UserRepository userRepository;



    /**
     * Fetch authenticated user's profile.
     *
     * Service layer responsibilities:
     * - Business logic
     * - Entity to DTO conversion
     * - Data validation
     */
    @Override
    public UserProfileResponse getCurrentUserProfile(String email) {


        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );


        return toResponse(user);

    }

    /**
     * Update authenticated user's own profile. Only non-blank fields in
     * the request are applied - this is a partial update, same convention
     * as OrganizationServiceImpl.updateOrganization.
     */
    @Override
    public UserProfileResponse updateCurrentUserProfile(String email, UpdateUserProfileRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );

        if (request.firstName() != null && !request.firstName().isBlank()) {
            user.setFirstName(request.firstName());
        }

        if (request.lastName() != null && !request.lastName().isBlank()) {
            user.setLastName(request.lastName());
        }

        return toResponse(userRepository.save(user));
    }

    private UserProfileResponse toResponse(User user) {
        return new UserProfileResponse(

                user.getId(),

                user.getFirstName(),

                user.getLastName(),

                user.getEmail(),

                user.getRole(),

                user.isActive()

        );
    }

}