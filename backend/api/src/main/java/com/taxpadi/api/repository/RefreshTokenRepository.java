package com.taxpadi.api.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.taxpadi.api.model.RefreshToken;
import com.taxpadi.api.model.User;




public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID>  {
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("UPDATE RefreshToken o SET o.revoked = true WHERE o.user = :user")
    void revokeAllByUser(@Param("user") User user);

    List<RefreshToken> findByUserAndRevokedFalseAndExpiresAtAfter(User user, LocalDateTime now);

    Optional<RefreshToken> findByTokenIdAndUser(UUID tokenId, User user);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.user = :user AND r.tokenId != :tokenId")
    int revokeAllByUserExcept(@Param("user") User user, @Param("tokenId") UUID tokenId);
}