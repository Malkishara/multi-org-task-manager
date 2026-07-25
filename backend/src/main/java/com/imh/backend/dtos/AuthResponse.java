package com.imh.backend.dtos;

import com.imh.backend.entities.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private String firstName;
    private String lastName;
    private String email;
    private User.Role role;
}
