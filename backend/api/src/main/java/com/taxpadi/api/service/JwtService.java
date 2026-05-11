package com.taxpadi.api.service;

import java.util.Date;

import javax.crypto.SecretKey;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.taxpadi.api.model.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    private static final long ACCESS_TOKEN_EXPIRY_MS = 15 * 60 * 1000L; // 15 minutes

    @Value("${jwt.secret}")
    private String secret;

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    public String generateAccessToken(User user) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + ACCESS_TOKEN_EXPIRY_MS);

        String token = Jwts.builder()
                .subject(user.getUserId().toString())
                .claim("phone", user.getPhone())
                .claim("role", user.getRole().name())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey())
                .compact();

        log.debug("Access token generated for userId={}, expiresAt={}", user.getUserId(), expiry);
        return token;
    }

    public Claims validateToken(String token) {
        return Jwts.parser()
                .verifyWith(signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }


    @Value("${jwt.reset-secret}")
    private String resetSecret;

    public SecretKey resetSecretKey(){
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(resetSecret));
    }

    public String generateResetToken(User user){
        Date now = new Date();
        Date expiry = new Date(now.getTime() + ACCESS_TOKEN_EXPIRY_MS);

        String reset_token = Jwts.builder()
            .subject(user.getUserId().toString())
            .claim("type", "password_reset")
            .issuedAt(now)
            .expiration(expiry)
            .signWith(resetSecretKey())
            .compact();

        log.debug("Reset token generated for userId={}, expiresAt={}", user.getUserId(), expiry);
        return reset_token;
    }

    public Claims validateResetToken(String reset_token){
        return Jwts.parser()
            .verifyWith(resetSecretKey())
            .build()
            .parseSignedClaims(reset_token)
            .getPayload();
    }
}
