package com.taxpadi.api.repository;

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
}