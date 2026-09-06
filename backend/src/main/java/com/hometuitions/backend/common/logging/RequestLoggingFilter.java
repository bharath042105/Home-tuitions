package com.hometuitions.backend.common.logging;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Enterprise HTTP Request/Response Logging Filter.
 * Logs incoming HTTP method (GET, POST, PUT, DELETE), URI path, query parameters,
 * remote client IP (respecting Render / reverse-proxy headers), HTTP response status code,
 * and execution latency in milliseconds.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);
    private static final String CORRELATION_ID_KEY = "correlationId";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        long startTime = System.currentTimeMillis();

        // 1. Assign or propagate Correlation ID / Request ID
        String correlationId = request.getHeader("X-Request-Id");
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = request.getHeader("X-Correlation-Id");
        }
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString().substring(0, 8);
        }
        MDC.put(CORRELATION_ID_KEY, correlationId);
        response.setHeader("X-Correlation-Id", correlationId);

        String method = request.getMethod();
        String uri = request.getRequestURI();
        String queryString = request.getQueryString();
        String fullPath = (queryString != null && !queryString.isBlank()) ? (uri + "?" + queryString) : uri;
        String clientIp = extractClientIp(request);

        // Skip logging spammy health check polling if needed, or keep at DEBUG
        boolean isHealthCheck = uri.equals("/health") || uri.startsWith("/actuator/health");

        if (!isHealthCheck) {
            log.info("📥 INCOMING  [{}] {} | IP: {}", method, fullPath, clientIp);
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            int status = response.getStatus();
            String user = extractCurrentUsername();

            if (!isHealthCheck) {
                if (status >= 500) {
                    log.error("💥 COMPLETED [{}] {} -> {} ERROR | Duration: {}ms | User: {} | IP: {}",
                            method, fullPath, status, duration, user, clientIp);
                } else if (status >= 400) {
                    log.warn("⚠️  COMPLETED [{}] {} -> {} WARN  | Duration: {}ms | User: {} | IP: {}",
                            method, fullPath, status, duration, user, clientIp);
                } else {
                    log.info("✅ COMPLETED [{}] {} -> {} OK    | Duration: {}ms | User: {} | IP: {}",
                            method, fullPath, status, duration, user, clientIp);
                }
            }

            MDC.remove(CORRELATION_ID_KEY);
        }
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }
        return request.getRemoteAddr();
    }

    private String extractCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName();
        }
        return "anonymous";
    }
}
