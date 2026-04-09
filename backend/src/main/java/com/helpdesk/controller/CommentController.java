package com.helpdesk.controller;

import com.helpdesk.dto.CommentRequest;
import com.helpdesk.entity.Comment;
import com.helpdesk.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<Comment> add(@PathVariable Long ticketId,
                                       @RequestBody CommentRequest request) {
        return ResponseEntity.ok(commentService.addComment(ticketId, request));
    }

    @GetMapping
    public ResponseEntity<List<Comment>> get(@PathVariable Long ticketId) {
        return ResponseEntity.ok(commentService.getComments(ticketId));
    }
}
