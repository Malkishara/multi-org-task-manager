package com.imh.backend.validations;

import com.imh.backend.dtos.AuthRequest;
import com.imh.backend.exceptions.BadRequestException;
import com.imh.backend.exceptions.ConflictException;
import com.imh.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;


@Slf4j
@Component
@RequiredArgsConstructor
public class AuthValidator {

    private final UserRepository userRepository;


    /**
     * Validate signup request.
     *
     * Design Pattern:
     * Validator Pattern - separates validation rules from business logic.
     *
     * SOLID Principle:
     * SRP - This class is only responsible for authentication validation.
     */
    public void validateSignup(AuthRequest request) {

        log.debug("Validating signup request for email: {}", request.getEmail());


        if (request.getFirstName() == null || request.getFirstName().isBlank()) {

            log.debug("Signup validation failed: First name is empty");

            throw new BadRequestException(
                    "First name is required"
            );
        }


        if (request.getLastName() == null || request.getLastName().isBlank()) {

            log.debug("Signup validation failed: Last name is empty");

            throw new BadRequestException(
                    "Last name is required"
            );
        }


        if (request.getEmail() == null || request.getEmail().isBlank()) {

            log.debug("Signup validation failed: Email is empty");

            throw new BadRequestException(
                    "Email is required"
            );
        }


        if (request.getPassword() == null || request.getPassword().isBlank()) {

            log.debug("Signup validation failed: Password is empty");

            throw new BadRequestException(
                    "Password is required"
            );
        }


        if (userRepository.existsByEmail(request.getEmail())) {

            log.debug(
                    "Signup validation failed: Email already exists {}",
                    request.getEmail()
            );

            throw new ConflictException(
                    "Email already exists"
            );
        }


        log.debug("Signup validation successful for email: {}", request.getEmail());
    }
}