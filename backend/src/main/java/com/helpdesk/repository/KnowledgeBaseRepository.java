package com.helpdesk.repository;

import com.helpdesk.entity.KnowledgeBase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface KnowledgeBaseRepository extends JpaRepository<KnowledgeBase, Long> {
    List<KnowledgeBase> findByIsPublishedTrue();
    List<KnowledgeBase> findByCategory_Id(Long categoryId);

    @Query("SELECT k FROM KnowledgeBase k WHERE k.isPublished = true AND (" +
           "LOWER(k.title) LIKE LOWER(CONCAT('%',:kw,'%')) OR " +
           "LOWER(k.content) LIKE LOWER(CONCAT('%',:kw,'%')) OR " +
           "LOWER(k.tags) LIKE LOWER(CONCAT('%',:kw,'%')))")
    List<KnowledgeBase> search(@Param("kw") String keyword);
}
