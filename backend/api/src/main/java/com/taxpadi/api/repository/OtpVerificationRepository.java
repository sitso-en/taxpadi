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
    Optional<OtpVerification> findFirstByPurposeAndUserAndUsedOrderByCreatedAtDesc(OtpPurpose purpose, User user, Boolean used);

    @Modifying
    @Query("UPDATE OtpVerification o SET o.used = true WHERE o.user = :user AND o.purpose = :purpose AND o.used = false")
    void invalidateActiveOtps(@Param("user") User user, @Param("purpose") OtpPurpose purpose);


    Optional<OtpVerification> findByUserAndPurposeAndResetTokenHash(User user, OtpPurpose purpose, String resetTokenHash);
}
