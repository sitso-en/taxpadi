package com.app.service;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import java.security.Key;
import java.util.*;
import java.util.function.Function;

@Service
public class JwtService {
    @Value("${jwt.secret}") private String secretKey;
    @Value("${jwt.expiration}") private long expiration;

    public String generateToken(UserDetails userDetails) {
        return Jwts.builder().setSubject(userDetails.getUsername())
                .setIssuedAt(new Date()).setExpiration(new Date(System.currentTimeMillis()+expiration))
                .signWith(getSignKey(), SignatureAlgorithm.HS256).compact();
    }
    public String extractEmail(String token) { return extractClaim(token, Claims::getSubject); }
    public boolean isTokenValid(String token, UserDetails userDetails) {
        return extractEmail(token).equals(userDetails.getUsername()) && !isTokenExpired(token);
    }
    private boolean isTokenExpired(String token) { return extractClaim(token, Claims::getExpiration).before(new Date()); }
    private <T> T extractClaim(String token, Function<Claims,T> r) {
        return r.apply(Jwts.parserBuilder().setSigningKey(getSignKey()).build().parseClaimsJws(token).getBody());
    }
    private Key getSignKey() { return Keys.hmacShaKeyFor(secretKey.getBytes()); }
}
