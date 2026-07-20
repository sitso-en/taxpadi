package com.taxpadi.api.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taxpadi.api.model.DeviceToken;
import com.taxpadi.api.model.User;

public interface DeviceTokenRepository extends JpaRepository<DeviceToken, UUID> {
    Optional<DeviceToken> findByTokenHashAndIsActive(String tokenHash, Boolean isActive);

    Optional<DeviceToken> findByUserAndDeviceInfoAndIsActive(User user, String deviceInfo, Boolean isActive);

    Optional<DeviceToken> findByFcmTokenAndUser(String fcmToken, User user);
}
