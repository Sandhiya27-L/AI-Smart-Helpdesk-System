package com.helpdesk.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class NlpQueryRequest {
    @NotBlank
    private String query;
    private boolean createTicket = false;
}
