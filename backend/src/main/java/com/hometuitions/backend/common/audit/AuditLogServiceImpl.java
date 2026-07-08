package com.hometuitions.backend.common.audit;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository repository;

    public AuditLogServiceImpl(AuditLogRepository repository) {
        this.repository = repository;
    }

    @Override
    public void record(String actorUserId, String action, String targetId, Map<String, Object> metadata) {
        UUID actorId = actorUserId == null ? null : UUID.fromString(actorUserId);
        repository.save(new AuditLog(actorId, action, targetId, metadata));
    }
}
