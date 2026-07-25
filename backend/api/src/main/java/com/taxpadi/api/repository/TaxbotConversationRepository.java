package com.taxpadi.api.repository;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.taxpadi.api.model.TaxbotConversation;
import com.taxpadi.api.model.User;

public interface TaxbotConversationRepository extends JpaRepository<TaxbotConversation, UUID> {
// find all by user (it must be paginated though), and count by user and date (this for rate limiting)
    Page<TaxbotConversation> findAllByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    int countByUserAndCreatedAtBetween(User user, LocalDateTime from, LocalDateTime to);

    long deleteByUser(User user);

}
