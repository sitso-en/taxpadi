package com.taxpadi.api.config;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;

@Configuration
// Push notifications need real Google service-account credentials, which are supplied by
// FIREBASE_SERVICE_ACCOUNT_JSON in production and by a gitignored file locally — neither
// exists in CI. Tests substitute a stand-in via TestFirebaseConfig. Inert in production,
// where the "test" profile is never active.
@Profile("!test")
public class FirebaseConfig {

    @Value("${FIREBASE_SERVICE_ACCOUNT_JSON:}")
    private String firebaseServiceAccountJson;

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        InputStream serviceAccount;
        if (firebaseServiceAccountJson != null && !firebaseServiceAccountJson.isBlank()) {
            serviceAccount = new ByteArrayInputStream(
                firebaseServiceAccountJson.getBytes(StandardCharsets.UTF_8));
        } else {
            serviceAccount = getClass().getClassLoader()
                .getResourceAsStream("firebase-service-account.json");
        }

        GoogleCredentials credentials = GoogleCredentials.fromStream(serviceAccount);

        FirebaseOptions options = FirebaseOptions.builder()
            .setCredentials(credentials)
            .build();

        return FirebaseApp.initializeApp(options);
    }

    @Bean
    public FirebaseMessaging firebaseMessaging(FirebaseApp firebaseApp) {
        return FirebaseMessaging.getInstance(firebaseApp);
    }
}
