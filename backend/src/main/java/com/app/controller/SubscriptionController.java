package com.app.controller;
import com.app.entity.Subscription;
import com.app.entity.User;
import com.app.enums.BillingCycle;
import com.app.repository.UserRepository;
import com.app.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.*;

@RestController @RequestMapping("/api/subscriptions") @RequiredArgsConstructor
public class SubscriptionController {
    private final SubscriptionService subscriptionService;
    private final UserRepository userRepository;

    @PostMapping("/initiate")
    public ResponseEntity<Map<String,Object>> initiate(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String,String> req) {
        String planName = req.get("planName");
        BigDecimal basePrice = new BigDecimal(req.get("basePrice"));
        BillingCycle cycle = BillingCycle.valueOf(req.getOrDefault("billingCycle","MONTHLY"));
        Map<String,Object> result = subscriptionService.initiate(userDetails.getUsername(), planName, basePrice, cycle);
        return ResponseEntity.ok(Map.of("success",true,"message","Payment initiated","data",result));
    }

    @GetMapping("/my")
    public ResponseEntity<Map<String,Object>> mySubscriptions(@AuthenticationPrincipal UserDetails userDetails) {
        List<Subscription> subs = subscriptionService.getUserSubscriptions(userDetails.getUsername());
        return ResponseEntity.ok(Map.of("success",true,"data",subs));
    }
}
