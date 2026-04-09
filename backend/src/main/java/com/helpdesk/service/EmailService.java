package com.helpdesk.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendTicketCreated(String to, String ticketNumber) {
        send(to,
             "IT HelpDesk — Ticket Created: " + ticketNumber,
             "Your support ticket " + ticketNumber + " has been created.\n" +
             "Our IT team will review it shortly.\n\nThank you,\nIT HelpDesk Team");
    }

    public void sendTicketResolved(String to, String ticketNumber) {
        send(to,
             "IT HelpDesk — Ticket Resolved: " + ticketNumber,
             "Your support ticket " + ticketNumber + " has been resolved.\n" +
             "Please log in to view the solution and close the ticket.\n\nThank you,\nIT HelpDesk Team");
    }

    public void sendTicketAssigned(String to, String ticketNumber, String staffName) {
        send(to,
             "IT HelpDesk — Ticket Assigned: " + ticketNumber,
             "Ticket " + ticketNumber + " has been assigned to " + staffName + ".\n" +
             "You will be updated when there is progress.\n\nIT HelpDesk Team");
    }

    private void send(String to, String subject, String body) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            mailSender.send(msg);
        } catch (Exception e) {
            log.warn("Email send failed to {}: {}", to, e.getMessage());
        }
    }
}
