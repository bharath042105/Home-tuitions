package com.hometuitions.backend.common.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class MailConfig {

    private static final Logger log = LoggerFactory.getLogger(MailConfig.class);

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String host;

    @Value("${spring.mail.port:587}")
    private int port;

    @Value("${spring.mail.username:bharathreddypvt@gmail.com}")
    private String username;

    @Value("${spring.mail.password:}")
    private String rawPassword;

    @Bean
    @Primary
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(host != null ? host.trim() : "smtp.gmail.com");

        // Force port 587 (STARTTLS) — Render blocks port 465 (SMTPS)
        int effectivePort = 587;
        if (port > 0 && port != 465) {
            effectivePort = port;
        }
        mailSender.setPort(effectivePort);
        
        String cleanUsername = username != null ? username.trim().replaceAll("[\"']", "") : "";
        String cleanPassword = rawPassword != null ? rawPassword.trim().replaceAll("[\"']", "").replaceAll("\\s+", "") : "";
        
        mailSender.setUsername(cleanUsername);
        mailSender.setPassword(cleanPassword);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.ssl.trust", "smtp.gmail.com");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");

        // Generous timeouts for cloud environments like Render
        props.put("mail.smtp.connectiontimeout", "15000");
        props.put("mail.smtp.timeout", "15000");
        props.put("mail.smtp.writetimeout", "15000");

        log.info("✅ MailConfig: host={}, port={} (original={}), username={}, passwordConfigured={}", 
                mailSender.getHost(), effectivePort, port, cleanUsername, !cleanPassword.isBlank());

        if (port == 465) {
            log.warn("⚠️ Port 465 was requested but is blocked on Render. Overriding to port 587 (STARTTLS).");
        }

        return mailSender;
    }

    @Bean(name = "taskExecutor")
    public org.springframework.core.task.TaskExecutor taskExecutor() {
        org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor executor = new org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("LeadNotification-");
        executor.initialize();
        return executor;
    }
}
