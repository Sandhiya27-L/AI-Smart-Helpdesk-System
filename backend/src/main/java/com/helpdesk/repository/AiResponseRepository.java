package com.helpdesk.repository;

import com.helpdesk.entity.AiResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface AiResponseRepository extends JpaRepository<AiResponse, Long> {
    List<AiResponse> findByTicket_Id(Long ticketId);

    @Query("SELECT AVG(a.confidenceScore) FROM AiResponse a")
    Double avgConfidenceScore();

    long countByEscalatedToHuman(boolean escalated);
    long countByWasHelpful(boolean wasHelpful);
}
