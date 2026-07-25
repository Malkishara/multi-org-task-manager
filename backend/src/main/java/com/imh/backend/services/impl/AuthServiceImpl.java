package com.imh.backend.services.impl;

import com.imh.backend.dtos.AuthRequest;
import com.imh.backend.dtos.AuthResponse;
import com.imh.backend.entities.User;
import com.imh.backend.exceptions.BadRequestException;
import com.imh.backend.exceptions.ResourceNotFoundException;
import com.imh.backend.exceptions.TooManyRequestsException;
import com.imh.backend.repositories.UserRepository;
import com.imh.backend.security.JwtService;
import com.imh.backend.services.AuthService;
import com.imh.backend.validations.AuthValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID;


@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {


    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AuthValidator authValidator;



    @Override
    public AuthResponse signup(AuthRequest request) {

        log.debug("Signup request received for email: {}", request.getEmail());

        authValidator.validateSignup(request);


        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.MEMBER)
                .active(true)
                .activationKey(UUID.randomUUID().toString())
                .activationKeyExpiry(LocalDateTime.now().plusHours(48))
                .lastActivationEmailSentTime(LocalDateTime.now())
                .build();


        userRepository.save(user);


        log.debug("User successfully registered: {}", user.getEmail());


        return generateAuthResponse(user);
    }



    @Override
    public AuthResponse login(AuthRequest request) {

        log.debug("Login attempt for {}", request.getEmail());

        Authentication authentication;

        try {

            authentication =
                    authenticationManager.authenticate(
                            new UsernamePasswordAuthenticationToken(
                                    request.getEmail(),
                                    request.getPassword()
                            )
                    );

        } catch (BadCredentialsException ex) {

            log.debug("Invalid credentials for {}", request.getEmail());

            throw new BadRequestException(
                    "Invalid email or password"
            );

        } catch (DisabledException ex) {

            throw new BadRequestException(
                    "Account is disabled"
            );

        } catch (LockedException ex) {

            throw new BadRequestException(
                    "Account is locked"
            );
        }


        User user =
                userRepository.findByEmail(request.getEmail())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found"
                                )
                        );


        if (!user.isActive()) {

            throw new BadRequestException(
                    "Please activate your account before logging in."
            );
        }


        String token =
                jwtService.generateToken(
                        (UserDetails) authentication.getPrincipal()
                );


        return AuthResponse.builder()
                .token(token)
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }




    @Override
    public AuthResponse activateAccount(Long userId, String key) {


        User user =
                userRepository.findByIdAndActivationKey(userId,key)
                        .orElseThrow(() ->
                                new BadRequestException(
                                        "Invalid activation link"
                                )
                        );


        if(user.isActive()) {

            throw new BadRequestException(
                    "Account already activated"
            );
        }


        if(user.getActivationKeyExpiry()
                .isBefore(LocalDateTime.now())) {

            throw new BadRequestException(
                    "Activation link has expired"
            );
        }


        user.setActive(true);
        user.setActivationKey(null);
        user.setActivationKeyExpiry(null);
        user.setActivationTime(LocalDateTime.now());


        userRepository.save(user);


        return generateAuthResponse(user);
    }





    @Override
    public void resendActivationLink(String email) {


        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found"
                                )
                        );


        if(user.isActive()) {

            throw new BadRequestException(
                    "Account is already activated"
            );
        }


        LocalDateTime now = LocalDateTime.now();


        if(user.getLastActivationEmailSentTime()!=null &&
                user.getLastActivationEmailSentTime()
                        .plusMinutes(5)
                        .isAfter(now)) {


            long remaining =
                    Duration.between(
                            now,
                            user.getLastActivationEmailSentTime()
                                    .plusMinutes(5)
                    ).toMinutes()+1;


            throw new TooManyRequestsException(
                    "Please wait "
                            + remaining
                            +" minute(s) before requesting another activation email."
            );
        }



        user.setActivationKey(
                UUID.randomUUID().toString()
        );

        user.setActivationKeyExpiry(
                now.plusHours(48)
        );

        user.setLastActivationEmailSentTime(now);


        userRepository.save(user);


        // emailService.sendActivationEmail(user);
    }





    private AuthResponse generateAuthResponse(User user){


        UserDetails userDetails =
                new org.springframework.security.core.userdetails.User(
                        user.getEmail(),
                        user.getPassword(),
                        Collections.singletonList(
                                new SimpleGrantedAuthority(
                                        "ROLE_"+user.getRole().name()
                                )
                        )
                );


        String token =
                jwtService.generateToken(userDetails);



        return AuthResponse.builder()
                .token(token)
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}