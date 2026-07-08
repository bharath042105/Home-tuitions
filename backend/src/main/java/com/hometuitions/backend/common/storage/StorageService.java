package com.hometuitions.backend.common.storage;

import java.net.URL;
import java.time.Duration;

/**
 * The backend never proxies file bytes (docs/phase2/01-system-architecture.md  4)
 * - clients upload/download directly against S3 using short-lived presigned URLs
 * issued here, and only the resulting S3 key is ever stored in our own tables.
 */
public interface StorageService {

    /** A presigned PUT URL the client uploads directly to; expires in a few minutes. */
    URL generateUploadUrl(String key, String contentType, Duration ttl);

    /** A presigned GET URL for private objects (documents); expires quickly, not cached. */
    URL generateDownloadUrl(String key, Duration ttl);

    String buildKey(String prefix, String ownerId, String originalFilename);
}
