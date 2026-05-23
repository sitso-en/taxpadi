package com.app.controller;
import com.app.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Map<String,Object>> register(@Valid @RequestBody Map<String,String> req) {
        String password = req.get("password");

        if (password == null || password.length() < 8) {
            throw new RuntimeException("Password must be at least 8 characters");
        }

        String token = authService.register(req.get("email"), password, req.get("fullName"), req.get("phoneNumber"));
        return ResponseEntity.ok(Map.of("success",true,"message","Registered successfully","token",token));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String,Object>> login(@RequestBody Map<String,String> req) {
        String token = authService.login(req.get("email"), req.get("password"));
        return ResponseEntity.ok(Map.of("success",true,"message","Login successful","token",token));
    }
}
