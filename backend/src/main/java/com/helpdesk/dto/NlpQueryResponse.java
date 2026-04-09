package com.helpdesk.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class NlpQueryResponse {
    private String intent;
    private String category;
    private String priority;
    private String solution;
    private double confidenceScore;
    private boolean escalatedToHuman;
    private String ticketNumber;
    private String message;
}
