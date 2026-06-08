package com.taxpadi.controller;
import com.taxpadi.entity.ComplianceCertificate;
import com.taxpadi.service.ComplianceCertificateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/certificates")
public class ComplianceCertificateController {
    private final ComplianceCertificateService service;
    public ComplianceCertificateController(ComplianceCertificateService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<Map<String,Object>> getMyCertificates(@RequestParam Long userId) {
        return ok("Certificates retrieved", service.getUserCertificates(userId));
    }

    @PostMapping("/request")
    public ResponseEntity<Map<String,Object>> request(
            @RequestParam Long userId,
            @RequestBody Map<String,Object> req) {
        ComplianceCertificate c = service.request(userId, req);
        return ResponseEntity.status(201).body(build(true,"Certificate request submitted",c));
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<Map<String,Object>> getStatus(@PathVariable Long id) {
        ComplianceCertificate c = service.getById(id);
        Map<String,Object> data = new HashMap<>();
        data.put("id",c.getId()); data.put("certificateNumber",c.getCertificateNumber());
        data.put("status",c.getStatus()); data.put("requestedAt",c.getRequestedAt());
        data.put("issuedAt",c.getIssuedAt()); data.put("expiryDate",c.getExpiryDate());
        data.put("downloadUrl",c.getDownloadUrl());
        return ok("Certificate status retrieved", data);
    }

    private ResponseEntity<Map<String,Object>> ok(String msg, Object data) {
        return ResponseEntity.ok(build(true,msg,data));
    }
    private Map<String,Object> build(boolean s, String msg, Object data) {
        Map<String,Object> r = new HashMap<>();
        r.put("success",s); r.put("message",msg); r.put("data",data); return r;
    }
}
