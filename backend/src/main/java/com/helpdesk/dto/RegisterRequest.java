package com.helpdesk.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank private String name;
    @Email @NotBlank private String email;
    @NotBlank @Size(min = 6) private String password;
    private String department;
    private String phone;
    private String role; // USER | IT_STAFF | ADMIN
}
