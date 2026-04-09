package com.helpdesk.service;

import com.helpdesk.dto.*;
import com.helpdesk.entity.*;
import com.helpdesk.enums.*;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository   ticketRepository;
    private final UserRepository     userRepository;
    private final CategoryRepository categoryRepository;
    private final EmailService       emailService;

    @Transactional
    public TicketResponse createTicket(TicketRequest req) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        Category category = null;
        if (req.getCategoryId() != null && !req.getCategoryId().isBlank()) {
            category = categoryRepository.findById(Long.parseLong(req.getCategoryId())).orElse(null);
        }

        Priority priority = Priority.MEDIUM;
        if (req.getPriority() != null) {
            try { priority = Priority.valueOf(req.getPriority()); } catch (Exception ignored) {}
        }

        Ticket ticket = Ticket.builder()
                .ticketNumber("TKT-" + System.currentTimeMillis())
                .title(req.getTitle())
                .description(req.getDescription())
                .status(TicketStatus.OPEN)
                .priority(priority)
                .category(category)
                .createdBy(user)
                .attachmentUrl(req.getAttachmentUrl())
                .build();

        ticket = ticketRepository.save(ticket);
        emailService.sendTicketCreated(user.getEmail(), ticket.getTicketNumber());
        return toResponse(ticket);
    }

    public Page<TicketResponse> getMyTickets(int page, int size) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ticketRepository.findByCreatedBy(user, pageable).map(this::toResponse);
    }

    public Page<TicketResponse> getAllTickets(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ticketRepository.findAll(pageable).map(this::toResponse);
    }

    public Page<TicketResponse> getAssignedTickets(int page, int size) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        Pageable pageable = PageRequest.of(page, size, Sort.by("priority").descending());
        return ticketRepository.findByAssignedTo(user, pageable).map(this::toResponse);
    }

    public TicketResponse getById(Long id) {
        return toResponse(ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id)));
    }

    @Transactional
    public TicketResponse updateTicket(Long id, String status, Long assigneeId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        if (status != null) {
            TicketStatus newStatus = TicketStatus.valueOf(status);
            ticket.setStatus(newStatus);
            if (newStatus == TicketStatus.RESOLVED) {
                ticket.setResolvedAt(LocalDateTime.now());
                emailService.sendTicketResolved(ticket.getCreatedBy().getEmail(), ticket.getTicketNumber());
            }
        }

        if (assigneeId != null) {
            User assignee = userRepository.findById(assigneeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
            ticket.setAssignedTo(assignee);
        }

        return toResponse(ticketRepository.save(ticket));
    }

    public Page<TicketResponse> search(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ticketRepository.searchTickets(keyword, pageable).map(this::toResponse);
    }

    private TicketResponse toResponse(Ticket t) {
        return TicketResponse.builder()
                .id(t.getId())
                .ticketNumber(t.getTicketNumber())
                .title(t.getTitle())
                .description(t.getDescription())
                .status(t.getStatus().name())
                .priority(t.getPriority().name())
                .categoryName(t.getCategory() != null ? t.getCategory().getName() : "Uncategorized")
                .categoryColor(t.getCategory() != null ? t.getCategory().getColor() : "#B0C4DE")
                .createdByName(t.getCreatedBy().getName())
                .assignedToName(t.getAssignedTo() != null ? t.getAssignedTo().getName() : null)
                .aiSuggestedSolution(t.getAiSuggestedSolution())
                .aiConfidenceScore(t.getAiConfidenceScore())
                .attachmentUrl(t.getAttachmentUrl())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .resolvedAt(t.getResolvedAt())
                .build();
    }
}
