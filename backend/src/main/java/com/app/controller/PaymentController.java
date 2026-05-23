package com.app.controller;
import com.app.entity.Transaction;
import com.app.entity.User;
import com.app.repository.TransactionRepository;
import com.app.repository.UserRepository;
import com.app.service.SubscriptionService;
import com.app.service.TaxService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController @RequestMapping("/api/payments") @RequiredArgsConstructor
public class PaymentController {
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final SubscriptionService subscriptionService;
    private final TaxService taxService;

    @GetMapping("/callback")
    public ResponseEntity<Map<String,Object>> callback(@RequestParam String reference) {
        Transaction txn = subscriptionService.verifyAndActivate(reference);
        return ResponseEntity.ok(Map.of("success",true,"message","Payment verified","status",txn.getStatus()));
    }

    @GetMapping("/transactions")
    public ResponseEntity<Map<String,Object>> getTransactions(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="20") int size) {
        Long userId = getUserId(userDetails);
        Page<Transaction> txns = transactionRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page,size));
        Map<String,Object> data = new HashMap<>();
        data.put("content", txns.getContent());
        data.put("totalElements", txns.getTotalElements());
        data.put("totalPages", txns.getTotalPages());
        return ResponseEntity.ok(Map.of("success",true,"data",data));
    }

    @GetMapping("/tax/quote")
    public ResponseEntity<Map<String,Object>> taxQuote(@RequestParam BigDecimal basePrice) {
        BigDecimal tax = taxService.calculateTax(basePrice);
        BigDecimal total = taxService.calculateTotal(basePrice);
        Map<String,Object> data = new HashMap<>();
        data.put("basePrice", basePrice);
        data.put("taxRate", taxService.getTaxRate());
        data.put("taxAmount", tax);
        data.put("totalAmount", total);
        data.put("currency","NGN");
        return ResponseEntity.ok(Map.of("success",true,"data",data));
    }

    @GetMapping("/tax/summary")
    public ResponseEntity<Map<String,Object>> taxSummary(
            @RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        BigDecimal totalTax = transactionRepository.sumTaxCollected(from, to);
        BigDecimal totalRevenue = transactionRepository.sumRevenueCollected(from, to);
        Map<String,Object> data = new HashMap<>();
        data.put("from",from); data.put("to",to);
        data.put("totalTaxCollected",totalTax);
        data.put("totalRevenue",totalRevenue);
        data.put("taxRate",taxService.getTaxRate());
        return ResponseEntity.ok(Map.of("success",true,"data",data));
    }

    private Long getUserId(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername()).orElseThrow().getId();
    }
}
