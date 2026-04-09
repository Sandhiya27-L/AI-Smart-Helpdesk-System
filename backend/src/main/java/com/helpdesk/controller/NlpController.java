package com.helpdesk.controller;

import com.helpdesk.dto.*;
import com.helpdesk.service.NlpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/nlp")
@RequiredArgsConstructor
public class NlpController {

    private final NlpService nlpService;

    /**
     * POST /api/nlp/query
     * Accepts a natural-language IT query, runs the built-in NLP engine,
     * returns intent + category + priority + solution + confidence score.
     */
    @PostMapping("/query")
    public ResponseEntity<NlpQueryResponse> query(@Valid @RequestBody NlpQueryRequest request) {
        return ResponseEntity.ok(nlpService.processQuery(request));
    }
}
