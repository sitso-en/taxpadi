package com.taxpadi.api.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taxpadi.api.model.User;
import com.taxpadi.api.model.UserTaxProfile;

public interface UserTaxProfileRepository extends JpaRepository<UserTaxProfile, UUID> {
    Optional<UserTaxProfile> findByUser(User user);
    List<UserTaxProfile> findByUser_IsActiveTrue();
}