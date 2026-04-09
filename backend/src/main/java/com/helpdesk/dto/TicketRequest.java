package com.helpdesk.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TicketRequest {
    @NotBlank private String title;
    @NotBlank private String description;
    private String categoryId;
    private String priority;
    private String attachmentUrl;
}
