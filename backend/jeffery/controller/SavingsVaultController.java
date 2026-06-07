package com.taxpadi.controller;
import com.taxpadi.entity.SavingsVault;
import com.taxpadi.entity.VaultTransaction;
import com.taxpadi.service.SavingsVaultService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/v1/savings-vault")
public class SavingsVaultController {
    private final SavingsVaultService service;
    public SavingsVaultController(SavingsVaultService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<Map<String,Object>> getVault(@RequestParam Long userId) {
        return ok("Vault retrieved", service.getVault(userId));
    }

    @PostMapping
    public ResponseEntity<Map<String,Object>> create(
            @RequestParam Long userId,
            @RequestBody Map<String,Object> req) {
        SavingsVault v = service.create(userId, req);
        return ResponseEntity.status(201).body(build(true,"Vault created",v));
    }

    @PostMapping("/deposit")
    public ResponseEntity<Map<String,Object>> deposit(
            @RequestParam Long userId,
            @RequestBody Map<String,Object> req) {
        BigDecimal amount = new BigDecimal(req.get("amount").toString());
        return ok("Deposit successful", service.deposit(userId, amount, (String) req.get("description")));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<Map<String,Object>> withdraw(
            @RequestParam Long userId,
            @RequestBody Map<String,Object> req) {
        BigDecimal amount = new BigDecimal(req.get("amount").toString());
        return ok("Withdrawal successful", service.withdraw(userId, amount, (String) req.get("description")));
    }

    @GetMapping("/transactions")
    public ResponseEntity<Map<String,Object>> getHistory(
            @RequestParam Long userId,
            @RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="20") int size) {
        List<VaultTransaction> txns = service.getHistory(userId, page, size);
        return ok("Transactions retrieved", txns);
    }

    private ResponseEntity<Map<String,Object>> ok(String msg, Object data) {
        return ResponseEntity.ok(build(true,msg,data));
    }
    private Map<String,Object> build(boolean s, String msg, Object data) {
        Map<String,Object> r = new HashMap<>();
        r.put("success",s); r.put("message",msg); r.put("data",data); return r;
    }
}
