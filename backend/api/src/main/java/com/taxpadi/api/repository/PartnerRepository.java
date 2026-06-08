package com.taxpadi.api.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taxpadi.api.model.Partner;

public interface PartnerRepository extends JpaRepository<Partner, UUID>{
    
}
