package com.imh.backend.services.impl;


import com.imh.backend.dtos.OrganizationMembershipResponse;
import com.imh.backend.dtos.UpdateUserProfileRequest;
import com.imh.backend.dtos.UserProfileResponse;
import com.imh.backend.entities.Organization;
import com.imh.backend.entities.OrganizationMember;
import com.imh.backend.entities.User;
import com.imh.backend.repositories.OrganizationRepository;
import com.imh.backend.repositories.UserRepository;
import com.imh.backend.services.UserService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {


    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;



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

        List<OrganizationMembershipResponse> organizations =
                user.getRole() == User.Role.SUPER_ADMIN
                        ? allActiveOrganizationsFor(user)
                        : membershipsOf(user);

        return new UserProfileResponse(

                user.getId(),

                user.getFirstName(),

                user.getLastName(),

                user.getEmail(),

                user.getRole(),

                user.isActive(),

                organizations

        );
    }

    // Regular users: only the ACTIVE organizations they actually belong to,
    // with their real role in each. A membership in a deactivated
    // organization is left out.
    private List<OrganizationMembershipResponse> membershipsOf(User user) {
        return user.getMemberships()
                .stream()
                .filter(membership -> membership.getOrganization().isActive())
                .map(membership -> new OrganizationMembershipResponse(
                        membership.getOrganization().getId(),
                        membership.getOrganization().getName(),
                        membership.getRole()
                ))
                .collect(Collectors.toList());
    }

    // SUPER_ADMIN: every ACTIVE organization in the system, not just ones
    // they're a member of. Role is filled in from their actual membership
    // where one exists, and left null otherwise - being SUPER_ADMIN grants
    // visibility, not an OrganizationMember row.
    private List<OrganizationMembershipResponse> allActiveOrganizationsFor(User user) {

        Map<Long, OrganizationMember.OrgRole> roleByOrgId = user.getMemberships()
                .stream()
                .collect(Collectors.toMap(
                        membership -> membership.getOrganization().getId(),
                        OrganizationMember::getRole
                ));

        return organizationRepository.findAll()
                .stream()
                .filter(Organization::isActive)
                .map(organization -> new OrganizationMembershipResponse(
                        organization.getId(),
                        organization.getName(),
                        roleByOrgId.get(organization.getId())
                ))
                .collect(Collectors.toList());
    }

}