package com.helpdesk.dto;

import lombok.Data;

@Data
public class CommentRequest {
    private String content;
    private boolean isInternal;
}
