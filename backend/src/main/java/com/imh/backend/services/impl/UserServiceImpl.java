package com.imh.backend.services.impl;


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