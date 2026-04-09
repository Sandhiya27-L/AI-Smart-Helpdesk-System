package com.helpdesk.controller;

import com.helpdesk.dto.*;
import com.helpdesk.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<TicketResponse> create(@Valid @RequestBody TicketRequest request) {
        return ResponseEntity.ok(ticketService.createTicket(request));
    }

    @GetMapping("/my")
    public ResponseEntity<Page<TicketResponse>> myTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ticketService.getMyTickets(page, size));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','IT_STAFF')")
    public ResponseEntity<Page<TicketResponse>> all(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ticketService.getAllTickets(page, size));
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasAnyRole('ADMIN','IT_STAFF')")
    public ResponseEntity<Page<TicketResponse>> assigned(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ticketService.getAssignedTickets(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getById(id));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','IT_STAFF')")
    public ResponseEntity<TicketResponse> update(
            @PathVariable Long id,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long assigneeId) {
        return ResponseEntity.ok(ticketService.updateTicket(id, status, assigneeId));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<TicketResponse>> search(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ticketService.search(keyword, page, size));
    }
}
