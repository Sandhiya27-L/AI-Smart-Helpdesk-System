package com.helpdesk.service;

import com.helpdesk.entity.KnowledgeBase;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.repository.KnowledgeBaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class KnowledgeBaseService {

    private final KnowledgeBaseRepository kbRepository;

    public List<KnowledgeBase> getAll() {
        return kbRepository.findByIsPublishedTrue();
    }

    public List<KnowledgeBase> search(String keyword) {
        return kbRepository.search(keyword);
    }

    public List<KnowledgeBase> getByCategory(Long categoryId) {
        return kbRepository.findByCategory_Id(categoryId);
    }

    public KnowledgeBase getById(Long id) {
        KnowledgeBase kb = kbRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found: " + id));
        kb.setViewCount(kb.getViewCount() + 1);
        return kbRepository.save(kb);
    }
}
