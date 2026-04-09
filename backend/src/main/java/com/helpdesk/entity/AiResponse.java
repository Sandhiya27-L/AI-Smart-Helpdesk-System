package com.helpdesk.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "ai_responses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AiResponse {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id")
    private Ticket ticket;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String userQuery;

    private String detectedIntent;
    private String detectedCategory;
    private String detectedPriority;

    @Column(columnDefinition = "TEXT")
    private String suggestedSolution;

    private BigDecimal confidenceScore;
    private Boolean wasHelpful;
    private boolean escalatedToHuman = false;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); }
}
