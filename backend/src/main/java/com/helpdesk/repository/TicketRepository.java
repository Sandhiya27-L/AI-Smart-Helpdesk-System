package com.helpdesk.repository;

import com.helpdesk.entity.Ticket;
import com.helpdesk.entity.User;
import com.helpdesk.enums.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Optional<Ticket> findByTicketNumber(String ticketNumber);
    Page<Ticket> findByCreatedBy(User user, Pageable pageable);
    Page<Ticket> findByAssignedTo(User user, Pageable pageable);
    Page<Ticket> findByStatus(TicketStatus status, Pageable pageable);
    long countByStatus(TicketStatus status);

    @Query("SELECT t FROM Ticket t WHERE LOWER(t.title) LIKE LOWER(CONCAT('%',:kw,'%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%',:kw,'%'))")
    Page<Ticket> searchTickets(@Param("kw") String keyword, Pageable pageable);

    @Query("SELECT t.category.name, COUNT(t) FROM Ticket t WHERE t.category IS NOT NULL GROUP BY t.category.name")
    List<Object[]> countByCategory();
}
