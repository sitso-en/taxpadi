package com.taxpadi.api.service;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.cloudinary.Cloudinary;

@Service
public class CloudinaryService {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryService.class);

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
                    "resource_type", "raw",
                    "overwrite", true
                )
            );
            String url = (String) result.get("secure_url");
            // Insert fl_attachment so browsers download instead of rendering inline
            String downloadUrl = url.replace("/upload/", "/upload/fl_attachment/");
            log.info("Cloudinary upload result download_url={}", downloadUrl);
            return downloadUrl;
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : "";
            if (msg.contains("429") || msg.toLowerCase().contains("rate") || msg.toLowerCase().contains("capacity")) {
                throw new RuntimeException("STORAGE_RATE_LIMITED");
            }
            throw new RuntimeException("STORAGE_ERROR");
        }
    }

    public String uploadFile(byte[] fileBytes, String folder, String publicId) {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                fileBytes,
                Map.of(
                    "public_id", folder + "/" + publicId,
                    "resource_type", "auto",
                    "overwrite", true
                )
            );
            return (String) result.get("secure_url");
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : "";
            if (msg.contains("429") || msg.toLowerCase().contains("rate") || msg.toLowerCase().contains("capacity")) {
                throw new RuntimeException("STORAGE_RATE_LIMITED");
            }
            throw new RuntimeException("STORAGE_ERROR");
        }
    }
}
