package com.helpdesk.service;

import com.helpdesk.dto.CommentRequest;
import com.helpdesk.entity.*;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository  ticketRepository;
    private final UserRepository    userRepository;

    public Comment addComment(Long ticketId, CommentRequest req) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user    = userRepository.findByEmail(email).orElseThrow();
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        Comment comment = Comment.builder()
                .ticket(ticket)
                .user(user)
                .content(req.getContent())
                .isInternal(req.isInternal())
                .build();

        return commentRepository.save(comment);
    }

    public List<Comment> getComments(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));
        return commentRepository.findByTicketOrderByCreatedAtAsc(ticket);
    }
}
