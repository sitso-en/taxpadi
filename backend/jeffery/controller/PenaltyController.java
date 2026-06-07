package com.taxpadi.controller;
import com.taxpadi.entity.Penalty;
import com.taxpadi.service.PenaltyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/penalties")
public class PenaltyController {
    private final PenaltyService service;
    public PenaltyController(PenaltyService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<Map<String,Object>> getMyPenalties(
            @RequestParam Long userId,
            @RequestParam(required=false) String status) {
        List<Penalty> penalties = status != null
                ? service.getUserPenaltiesByStatus(userId, status)
                : service.getUserPenalties(userId);
        return ok("Penalties retrieved", penalties);
    }

    @PostMapping("/calculate")
    public ResponseEntity<Map<String,Object>> calculate(@RequestBody Map<String,Object> req) {
        return ok("Penalty calculated", service.calculate(req));
    }

    @PostMapping
    public ResponseEntity<Map<String,Object>> record(
            @RequestParam Long userId,
            @RequestBody Map<String,Object> req) {
        Penalty p = service.record(userId, req);
        return ResponseEntity.status(201).body(build(true,"Penalty recorded",p));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String,Object>> getSummary(@RequestParam Long userId) {
        return ok("Penalty summary retrieved", service.getSummary(userId));
    }

    private ResponseEntity<Map<String,Object>> ok(String msg, Object data) {
        return ResponseEntity.ok(build(true,msg,data));
    }
    private Map<String,Object> build(boolean success, String msg, Object data) {
        Map<String,Object> r = new HashMap<>();
        r.put("success",success); r.put("message",msg); r.put("data",data); return r;
    }
}
