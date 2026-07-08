package com.hometuitions.backend.common.security;

import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Validates the JWT on the STOMP CONNECT frame (docs/phase2/02-high-level-design.md
 *  2.7) and sets the resulting Authentication as the session's Principal, so every
 * subsequent @MessageMapping call on this connection can use it - there's no per-message
 * JWT validation, only once at CONNECT, since a STOMP session is a long-lived connection
 * rather than discrete HTTP requests.
 */
@Component
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;

    public StompAuthChannelInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            List<String> authHeaders = accessor.getNativeHeader("Authorization");
            String bearer = (authHeaders == null || authHeaders.isEmpty()) ? null : authHeaders.get(0);

            if (bearer == null || !bearer.startsWith("Bearer ")) {
                throw new IllegalArgumentException("Missing Authorization header on STOMP CONNECT");
            }

            Authentication authentication = jwtService.authenticate(bearer.substring(7));
            if (authentication == null) {
                throw new IllegalArgumentException("Invalid or expired token on STOMP CONNECT");
            }
            accessor.setUser(authentication);
        }

        return message;
    }
}
