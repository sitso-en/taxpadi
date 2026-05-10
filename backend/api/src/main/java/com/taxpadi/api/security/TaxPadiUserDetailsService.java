package com.taxpadi.api.security;

import java.util.UUID;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.taxpadi.api.repository.UserRepository;

@Service
public class TaxPadiUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public TaxPadiUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        return userRepository.findById(UUID.fromString(userId))
                .map(TaxPadiUserDetails::new)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userId));
    }
}
