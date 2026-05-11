package com.taxpadi.api.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taxpadi.api.model.User;
import com.taxpadi.api.model.UserTaxProfile;



public interface UserTaxProfileRepository extends JpaRepository<UserTaxProfile,UUID>  {
    Optional<UserTaxProfile> findByUser(User user);
}