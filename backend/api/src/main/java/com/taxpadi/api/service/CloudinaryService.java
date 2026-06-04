package com.taxpadi.api.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.cloudinary.Cloudinary;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret) {
        this.cloudinary = new Cloudinary(Map.of(
            "cloud_name", cloudName,
            "api_key", apiKey,
            "api_secret", apiSecret,
            "secure", true
        ));
    }

    public String uploadPdf(byte[] pdfBytes, String publicId) {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                pdfBytes,
                Map.of(
                    "public_id", publicId,
                    "resource_type", "auto",
                    "overwrite", true
                )
            );
            return (String) result.get("secure_url");
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload PDF to Cloudinary: " + e.getMessage());
        }
    }
}
