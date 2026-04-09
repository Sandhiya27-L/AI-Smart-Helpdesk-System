package com.helpdesk.service;

import com.helpdesk.entity.User;
import com.helpdesk.enums.RoleName;
import com.helpdesk.enums.TicketStatus;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final TicketRepository     ticketRepository;
    private final UserRepository       userRepository;
    private final AiResponseRepository aiResponseRepository;

    public Map<String, Object> getAnalytics() {
        Map<String, Object> data = new LinkedHashMap<>();

        long total      = ticketRepository.count();
        long open       = ticketRepository.countByStatus(TicketStatus.OPEN);
        long inProgress = ticketRepository.countByStatus(TicketStatus.IN_PROGRESS);
        long resolved   = ticketRepository.countByStatus(TicketStatus.RESOLVED);
        long closed     = ticketRepository.countByStatus(TicketStatus.CLOSED);
        long escalated  = ticketRepository.countByStatus(TicketStatus.ESCALATED);
        long totalUsers = userRepository.count();
        double avgConf  = Optional.ofNullable(aiResponseRepository.avgConfidenceScore()).orElse(0.0);
        long nlpEscalated = aiResponseRepository.countByEscalatedToHuman(true);

        double resolutionRate = total > 0 ? Math.round((double) resolved / total * 10000.0) / 100.0 : 0;

        data.put("totalTickets",    total);
        data.put("openTickets",     open);
        data.put("inProgressTickets", inProgress);
        data.put("resolvedTickets", resolved);
        data.put("closedTickets",   closed);
        data.put("escalatedTickets",escalated);
        data.put("totalUsers",      totalUsers);
        data.put("resolutionRate",  resolutionRate);
        data.put("nlpAvgConfidence", Math.round(avgConf * 100));
        data.put("nlpEscalatedCount", nlpEscalated);

        // Category breakdown
        List<Map<String, Object>> categories = new ArrayList<>();
        for (Object[] row : ticketRepository.countByCategory()) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("name",  row[0]);
            entry.put("count", row[1]);
            categories.add(entry);
        }
        data.put("ticketsByCategory", categories);

        return data;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getItStaff() {
        return userRepository.findByRole_Name(RoleName.IT_STAFF);
    }

    public void toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        user.setActive(!user.isActive());
        userRepository.save(user);
    }
}
