package com.taxpadi.api.config;

import org.mockito.Mockito;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import com.google.firebase.messaging.FirebaseMessaging;

/**
 * Stands in for {@link FirebaseConfig}, which is disabled under the "test" profile because
 * push notifications need real Google credentials that CI has no way to obtain.
 *
 * <p>NotificationService requires a FirebaseMessaging bean to be constructed, so without
 * this the whole application context fails to start and every @SpringBootTest fails —
 * regardless of whether the test has anything to do with notifications. Nothing sends a
 * message during tests, so a stand-in is enough.
 */
@Configuration
@Profile("test")
public class TestFirebaseConfig {

    @Bean
    public FirebaseMessaging firebaseMessaging() {
        return Mockito.mock(FirebaseMessaging.class);
    }
}
