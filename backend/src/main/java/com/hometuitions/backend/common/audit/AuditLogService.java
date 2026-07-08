package com.hometuitions.backend.common.audit;

import java.util.Map;

/**
 * Central write path for the audit_logs table (SRS  4, non-negotiable retention: 3 years).
 * Called directly by services performing sensitive state changes (verification decisions,
 * booking transitions, payment events) - kept as a plain service, not an AOP aspect, so the
 * call site and the "what got logged" are visually obvious in code review.
 */
public interface AuditLogService {
    void record(String actorUserId, String action, String targetId, Map<String, Object> metadata);
}
