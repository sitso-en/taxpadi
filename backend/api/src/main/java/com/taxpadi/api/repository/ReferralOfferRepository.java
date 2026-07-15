package com.taxpadi.api.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.taxpadi.api.model.OfferType;
import com.taxpadi.api.model.ReferralOffer;
import com.taxpadi.api.model.ReferralStatus;
import com.taxpadi.api.model.User;

public interface ReferralOfferRepository extends JpaRepository<ReferralOffer, UUID> {

    Page<ReferralOffer> findAllByUserAndStatusNotOrderByCreatedAtDesc(User user, ReferralStatus status, Pageable pageable);

    Page<ReferralOffer> findAllByUserAndOfferTypeAndStatusNotOrderByCreatedAtDesc(User user, OfferType offerType, ReferralStatus status, Pageable pageable);

    Optional<ReferralOffer> findByOfferIdAndUser(UUID offerId, User user);

    long countByStatus(ReferralStatus status);

    @Modifying
    @Query("UPDATE ReferralOffer r SET r.status = :expired WHERE r.partnerName = :partnerName AND r.status = :active")
    int expireAllByPartnerName(@Param("partnerName") String partnerName,
                               @Param("active") ReferralStatus active,
                               @Param("expired") ReferralStatus expired);
}
