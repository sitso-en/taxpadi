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

    /**
     * Revokes all active (revoked = false) tokens for a given user and device before
     * a new token is issued. Uses a native query so that null deviceInfo is matched
     * correctly with IS NULL rather than the broken JPQL "= null" semantics.
     */
    @Modifying
    @Query(value = """
            UPDATE refresh_tokens
            SET    revoked    = true,
                   revoked_at = :now
            WHERE  user_id    = :userId
              AND  ((:deviceInfo IS NULL AND device_info IS NULL) OR device_info = :deviceInfo)
              AND  revoked    = false
            """, nativeQuery = true)
    int revokeByUserAndDevice(@Param("userId") UUID userId,
                               @Param("deviceInfo") String deviceInfo,
                               @Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.user = :user AND r.tokenId != :tokenId")
    int revokeAllByUserExcept(@Param("user") User user, @Param("tokenId") UUID tokenId);
}