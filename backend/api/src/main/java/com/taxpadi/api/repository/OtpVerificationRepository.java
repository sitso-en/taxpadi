package com.taxpadi.api.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.taxpadi.api.model.OtpPurpose;
import com.taxpadi.api.model.OtpVerification;
import com.taxpadi.api.model.User;

public interface OtpVerificationRepository extends JpaRepository<OtpVerification, UUID> {
    @Query("SELECT o FROM OtpVerification o WHERE o.purpose = :purpose AND o.user = :user AND o.used = :used ORDER BY o.createdAt DESC LIMIT 1")
    Optional<OtpVerification> findByPurposeAndUserAndUsed(@Param("purpose") OtpPurpose purpose, @Param("user") User user, @Param("used") Boolean used);

    @Modifying
    @Query("UPDATE OtpVerification o SET o.used = true WHERE o.user = :user AND o.purpose = :purpose AND o.used = false")
    void invalidateActiveOtps(@Param("user") User user, @Param("purpose") OtpPurpose purpose);


    @Query("SELECT o FROM OtpVerification o WHERE o.user = :user AND o.purpose = :purpose AND o.used = true AND o.resetTokenHash IS NOT NULL")
    Optional<OtpVerification> findByUserAndPurposeAndRestTokenHash(@Param("user") User user, @Param("purpose") OtpPurpose purpose);
}
