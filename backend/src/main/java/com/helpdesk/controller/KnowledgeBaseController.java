package com.helpdesk.controller;

import com.helpdesk.entity.KnowledgeBase;
import com.helpdesk.service.KnowledgeBaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kb")
@RequiredArgsConstructor
public class KnowledgeBaseController {

    private final KnowledgeBaseService kbService;

    @GetMapping("/public")
    public ResponseEntity<List<KnowledgeBase>> getAll() {
        return ResponseEntity.ok(kbService.getAll());
    }

    @GetMapping("/public/search")
    public ResponseEntity<List<KnowledgeBase>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(kbService.search(keyword));
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<KnowledgeBase> getById(@PathVariable Long id) {
        return ResponseEntity.ok(kbService.getById(id));
    }

    @GetMapping("/public/category/{categoryId}")
    public ResponseEntity<List<KnowledgeBase>> byCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(kbService.getByCategory(categoryId));
    }
}
