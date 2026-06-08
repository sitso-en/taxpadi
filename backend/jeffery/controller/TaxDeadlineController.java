package com.taxpadi.controller;
import com.taxpadi.entity.TaxDeadline;
import com.taxpadi.service.TaxDeadlineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/tax-deadlines")
public class TaxDeadlineController {
    private final TaxDeadlineService service;
    public TaxDeadlineController(TaxDeadlineService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<Map<String,Object>> getAll() {
        return ok("Tax deadlines retrieved", service.getAll());
    }

    @GetMapping("/upcoming")
    public ResponseEntity<Map<String,Object>> getUpcoming(@RequestParam(defaultValue="30") int days) {
        return ok("Upcoming deadlines retrieved", service.getUpcoming(days));
    }

    @GetMapping("/overdue")
    public ResponseEntity<Map<String,Object>> getOverdue() {
        return ok("Overdue deadlines retrieved", service.getOverdue());
    }

    private ResponseEntity<Map<String,Object>> ok(String msg, Object data) {
        Map<String,Object> r = new HashMap<>();
        r.put("success",true); r.put("message",msg); r.put("data",data);
        return ResponseEntity.ok(r);
    }
}
