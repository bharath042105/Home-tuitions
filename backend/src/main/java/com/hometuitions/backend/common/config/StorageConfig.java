package com.hometuitions.backend.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

@Configuration
public class StorageConfig {

    @Bean
    public S3Presigner s3Presigner(@Value("${app.s3.region}") String region,
                                    @Value("${app.s3.endpoint:}") String endpoint) {
        var builder = S3Presigner.builder().region(Region.of(region));

        // Set only for local dev against MinIO (see docker-compose.yml) - unset in every
        // real environment, where the SDK talks to actual regional AWS S3 as before.
        // forcePathStyle is required for MinIO (it doesn't support the
        // <bucket>.endpoint virtual-hosted addressing real S3 uses by default).
        if (!endpoint.isBlank()) {
            builder.endpointOverride(URI.create(endpoint))
                    .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build());
        }

        return builder.build();
    }
}
