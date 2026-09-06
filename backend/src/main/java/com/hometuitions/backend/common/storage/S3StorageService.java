package com.hometuitions.backend.common.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URI;
import java.net.URL;
import java.time.Duration;
import java.util.UUID;

@Service
public class S3StorageService implements StorageService {

    private final S3Presigner presigner;
    private final S3Client s3Client;
    private final String bucket;
    private final String publicUrlBase;

    public S3StorageService(S3Presigner presigner,
                            S3Client s3Client,
                            @Value("${app.s3.bucket:${R2_BUCKET:hometuitions-dev-documents}}") String bucket,
                            @Value("${app.s3.public-url-base:${R2_PUBLIC_URL_BASE:}}") String publicUrlBase) {
        this.presigner = presigner;
        this.s3Client = s3Client;
        this.bucket = bucket;
        this.publicUrlBase = (publicUrlBase != null) ? publicUrlBase.trim().replaceAll("/+$", "") : "";
    }

    public void uploadBytes(String key, String contentType, byte[] data) {
        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(contentType)
                .build();
        s3Client.putObject(objectRequest, RequestBody.fromBytes(data));
    }

    @Override
    public URL generateUploadUrl(String key, String contentType, Duration ttl) {
        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(contentType)
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(ttl)
                .putObjectRequest(objectRequest)
                .build();

        PresignedPutObjectRequest presigned = presigner.presignPutObject(presignRequest);
        return presigned.url();
    }

    @Override
    public URL generateDownloadUrl(String key, Duration ttl) {
        if (!publicUrlBase.isBlank()) {
            try {
                return URI.create(publicUrlBase + "/" + key).toURL();
            } catch (Exception ignored) {
            }
        }

        GetObjectRequest objectRequest = GetObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(ttl)
                .getObjectRequest(objectRequest)
                .build();

        PresignedGetObjectRequest presigned = presigner.presignGetObject(presignRequest);
        return presigned.url();
    }

    @Override
    public String buildKey(String prefix, String ownerId, String originalFilename) {
        String safeName = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        return "%s/%s/%s-%s".formatted(prefix, ownerId, UUID.randomUUID(), safeName);
    }
}
