package com.taxpadi.api.controller;

import com.taxpadi.api.common.ApiResponse;
import com.taxpadi.api.dto.deadline.CompleteDeadlineResponse;
import com.taxpadi.api.dto.deadline.DeadlineListResponse;
import com.taxpadi.api.dto.deadline.UpcomingDeadlinesResponse;
import com.taxpadi.api.service.TaxDeadlineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tax/deadlines")
public class TaxDeadlineController {

    private final TaxDeadlineService service;

    public TaxDeadlineController(TaxDeadlineService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<DeadlineListResponse>> getAll(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        DeadlineListResponse data = service.getAll(page, Math.min(limit, 100));
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Tax deadlines retrieved successfully."));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<UpcomingDeadlinesResponse>> getUpcoming(
            @RequestParam(defaultValue = "90") int days) {
        UpcomingDeadlinesResponse data = service.getUpcoming(days);
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Upcoming deadlines retrieved successfully."));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<CompleteDeadlineResponse>> complete(@PathVariable UUID id) {
        CompleteDeadlineResponse data = service.complete(id);
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Deadline marked as complete."));
    }
}
