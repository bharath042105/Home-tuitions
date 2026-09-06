package com.hometuitions.backend.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

@Configuration
public class StorageConfig {

    @Value("${app.s3.region:auto}")
    private String region;

    @Value("${app.s3.endpoint:}")
    private String endpoint;

    @Value("${AWS_ACCESS_KEY_ID:${R2_ACCESS_KEY_ID:}}")
    private String accessKey;

    @Value("${AWS_SECRET_ACCESS_KEY:${R2_SECRET_ACCESS_KEY:}}")
    private String secretKey;

    @Bean
    public S3Presigner s3Presigner() {
        String effectiveRegion = (region == null || region.isBlank() || "auto".equalsIgnoreCase(region)) ? "us-east-1" : region;
        var builder = S3Presigner.builder().region(Region.of(effectiveRegion));

        if (accessKey != null && !accessKey.isBlank() && secretKey != null && !secretKey.isBlank()) {
            builder.credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKey.trim(), secretKey.trim())
            ));
        }

        if (endpoint != null && !endpoint.isBlank()) {
            builder.endpointOverride(URI.create(endpoint.trim()))
                    .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build());
        }

        return builder.build();
    }

    @Bean
    public S3Client s3Client() {
        String effectiveRegion = (region == null || region.isBlank() || "auto".equalsIgnoreCase(region)) ? "us-east-1" : region;
        S3ClientBuilder builder = S3Client.builder().region(Region.of(effectiveRegion));

        if (accessKey != null && !accessKey.isBlank() && secretKey != null && !secretKey.isBlank()) {
            builder.credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKey.trim(), secretKey.trim())
            ));
        }

        if (endpoint != null && !endpoint.isBlank()) {
            builder.endpointOverride(URI.create(endpoint.trim()))
                    .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build());
        }

        return builder.build();
    }
}
