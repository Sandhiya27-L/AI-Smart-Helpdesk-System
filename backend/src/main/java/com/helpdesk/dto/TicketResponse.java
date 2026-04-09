package com.helpdesk.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TicketResponse {
    private Long id;
    private String ticketNumber;
    private String title;
    private String description;
    private String status;
    private String priority;
    private String categoryName;
    private String categoryColor;
    private String createdByName;
    private String assignedToName;
    private String aiSuggestedSolution;
    private BigDecimal aiConfidenceScore;
    private String attachmentUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
}
