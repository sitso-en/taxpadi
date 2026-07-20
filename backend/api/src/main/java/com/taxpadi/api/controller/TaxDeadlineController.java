package com.taxpadi.api.controller;

import com.taxpadi.api.common.ApiResponse;
import com.taxpadi.api.dto.deadline.CompleteDeadlineRequest;
import com.taxpadi.api.dto.deadline.CompleteDeadlineResponse;
import com.taxpadi.api.dto.deadline.DeadlineListResponse;
import com.taxpadi.api.dto.deadline.UpcomingDeadlinesResponse;
import com.taxpadi.api.model.User;
import com.taxpadi.api.security.TaxPadiUserDetails;
import com.taxpadi.api.service.TaxDeadlineService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        User user = userDetails.getUser();
        DeadlineListResponse data = service.getAll(user, page, Math.min(limit, 100));
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Tax deadlines retrieved successfully."));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<UpcomingDeadlinesResponse>> getUpcoming(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam(defaultValue = "90") int days) {
        User user = userDetails.getUser();
        UpcomingDeadlinesResponse data = service.getUpcoming(user, days);
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Upcoming deadlines retrieved successfully."));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<CompleteDeadlineResponse>> complete(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id,
            @RequestBody CompleteDeadlineRequest req) {
        User user = userDetails.getUser();
        CompleteDeadlineResponse data = service.complete(
                user, req.getTaxType(), req.getPeriodStart(), req.getPeriodEnd());
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Deadline marked as complete."));
    }
}
