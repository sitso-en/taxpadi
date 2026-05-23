package com.app.service;
import com.app.entity.User;
import com.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;

    public String register(String email, String password, String fullName, String phone) {
        if (userRepository.existsByEmail(email)) throw new RuntimeException("Email already registered");
        User user = User.builder().email(email).password(passwordEncoder.encode(password))
                .fullName(fullName).phoneNumber(phone).build();
        userRepository.save(user);
        UserDetails ud = userDetailsService.loadUserByUsername(email);
        return jwtService.generateToken(ud);
    }

    public String login(String email, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
        UserDetails ud = userDetailsService.loadUserByUsername(email);
        return jwtService.generateToken(ud);
    }
}
