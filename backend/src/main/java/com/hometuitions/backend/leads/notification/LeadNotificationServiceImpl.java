package com.hometuitions.backend.leads.notification;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hometuitions.backend.leads.entity.ContactMessage;
import com.hometuitions.backend.leads.entity.TuitionInquiry;
import com.hometuitions.backend.leads.entity.TutorApplication;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@Service("leadNotificationService")
public class LeadNotificationServiceImpl implements LeadNotificationService {

    private static final Logger log = LoggerFactory.getLogger(LeadNotificationServiceImpl.class);

    private final JavaMailSender mailSender;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    @Value("${app.notification.admin-emails:vidyatutorspoint@gmail.com,sbharathreddy219@gmail.com,bharathreddypvt@gmail.com}")
    private String adminEmailsRaw;

    @Value("${app.notification.admin-phones:918074470640,916303619089,918143241349}")
    private String adminPhonesRaw;

    @Value("${spring.mail.username:bharathreddypvt@gmail.com}")
    private String mailFrom;

    @Value("${RESEND_API_KEY:${app.resend.api-key:}}")
    private String resendApiKey;

    @Value("${RESEND_FROM_EMAIL:${app.resend.from-email:Vidya Home Tuitions <onboarding@resend.dev>}}")
    private String resendFromEmail;

    public LeadNotificationServiceImpl(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    @Async("taskExecutor")
    public void notifyTuitionInquiry(TuitionInquiry inquiry) {
        try {
            String parent = val(inquiry.getParentName());
            String grade = val(inquiry.getGrade());
            String mobile = val(inquiry.getMobile());
            String email = val(inquiry.getEmail());
            String board = val(inquiry.getBoard());
            String subjects = val(inquiry.getSubjects());
            String mode = val(inquiry.getTuitionMode());
            String address = val(inquiry.getAddress());
            String timings = val(inquiry.getTimings());
            String frequency = val(inquiry.getFrequency());
            String budget = val(inquiry.getBudget());
            String remarks = val(inquiry.getRemarks());

            String subject = "🔔 New Tutor Request: " + parent + " (" + grade + " - " + subjects + ")";

            StringBuilder plainText = new StringBuilder();
            plainText.append("=== NEW TUITION INQUIRY (VIDYA HOME TUITIONS) ===\n\n");
            plainText.append("• Parent/Student: ").append(parent).append("\n");
            plainText.append("• Mobile: +91 ").append(mobile).append("\n");
            plainText.append("• Email: ").append(email).append("\n");
            plainText.append("• Grade: ").append(grade).append("\n");
            plainText.append("• Board: ").append(board).append("\n");
            plainText.append("• Subjects: ").append(subjects).append("\n");
            plainText.append("• Mode: ").append(mode).append("\n");
            plainText.append("• Address: ").append(address).append("\n");
            plainText.append("• Timings & Frequency: ").append(timings).append(" | ").append(frequency).append("\n");
            plainText.append("• Budget: ").append(budget).append("\n");
            plainText.append("• Notes: ").append(remarks).append("\n\n");
            plainText.append("Admin Portal: https://vidya-admin-iota.vercel.app/leads\n");

            String html = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background: #ffffff;\">"
                    + "<div style=\"background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 20px; color: white; text-align: center;\">"
                    + "<h2 style=\"margin: 0; font-size: 22px;\">Vidya Home Tuitions</h2>"
                    + "<p style=\"margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;\">New Student Tuition Inquiry Received</p>"
                    + "</div>"
                    + "<div style=\"padding: 24px; color: #333333; line-height: 1.6;\">"
                    + "<table style=\"width: 100%; border-collapse: collapse; font-size: 14px;\">"
                    + "<tr style=\"border-bottom: 1px solid #f0f0f0;\"><td style=\"padding: 8px 0; color: #666; width: 35%;\">Parent/Student:</td><td style=\"padding: 8px 0; font-weight: bold;\">" + escape(parent) + "</td></tr>"
                    + "<tr style=\"border-bottom: 1px solid #f0f0f0;\"><td style=\"padding: 8px 0; color: #666;\">Mobile:</td><td style=\"padding: 8px 0; font-weight: bold; color: #1e40af;\">+91 " + escape(mobile) + "</td></tr>"
                    + "<tr style=\"border-bottom: 1px solid #f0f0f0;\"><td style=\"padding: 8px 0; color: #666;\">Email:</td><td style=\"padding: 8px 0;\">" + escape(email) + "</td></tr>"
                    + "<tr style=\"border-bottom: 1px solid #f0f0f0;\"><td style=\"padding: 8px 0; color: #666;\">Grade & Board:</td><td style=\"padding: 8px 0; font-weight: bold;\">" + escape(grade) + " (" + escape(board) + ")</td></tr>"
                    + "<tr style=\"border-bottom: 1px solid #f0f0f0;\"><td style=\"padding: 8px 0; color: #666;\">Subjects:</td><td style=\"padding: 8px 0; font-weight: bold; color: #d97706;\">" + escape(subjects) + "</td></tr>"
                    + "<tr style=\"border-bottom: 1px solid #f0f0f0;\"><td style=\"padding: 8px 0; color: #666;\">Mode:</td><td style=\"padding: 8px 0;\">" + escape(mode) + "</td></tr>"
                    + "<tr style=\"border-bottom: 1px solid #f0f0f0;\"><td style=\"padding: 8px 0; color: #666;\">Address:</td><td style=\"padding: 8px 0;\">" + escape(address) + "</td></tr>"
                    + "<tr style=\"border-bottom: 1px solid #f0f0f0;\"><td style=\"padding: 8px 0; color: #666;\">Timings:</td><td style=\"padding: 8px 0;\">" + escape(timings) + " (" + escape(frequency) + ")</td></tr>"
                    + "<tr style=\"border-bottom: 1px solid #f0f0f0;\"><td style=\"padding: 8px 0; color: #666;\">Budget:</td><td style=\"padding: 8px 0;\">" + escape(budget) + "</td></tr>"
                    + "<tr><td style=\"padding: 8px 0; color: #666;\">Requirements / Notes:</td><td style=\"padding: 8px 0;\">" + escape(remarks) + "</td></tr>"
                    + "</table>"
                    + "<div style=\"margin-top: 24px; text-align: center;\">"
                    + "<a href=\"https://vidya-admin-iota.vercel.app/leads\" style=\"background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;\">Open Admin Portal</a>"
                    + "</div>"
                    + "</div>"
                    + "</div>";

            sendEmail(subject, plainText.toString(), html);
        } catch (Exception e) {
            log.error("Failed to process tuition inquiry notification: {}", e.getMessage(), e);
        }
    }

    @Override
    @Async("taskExecutor")
    public void notifyTutorApplication(TutorApplication app) {
        try {
            String name = val(app.getName());
            String qualification = val(app.getQualification());
            String mobile = val(app.getMobile());
            String whatsapp = val(app.getWhatsapp());
            String email = val(app.getEmail());
            String college = val(app.getCollege());
            String percentage = val(app.getPercentage());
            String passYear = val(app.getPassYear());
            String grades = val(app.getGrades());
            String subjects = val(app.getSubjects());
            String boards = val(app.getBoards());
            String localities = val(app.getLocalities());
            String distance = val(app.getCommuteDistance());
            String rate = val(app.getExpectedRate());
            String timings = val(app.getTimings());
            String bio = val(app.getBio());

            String subject = "👨‍🏫 New Tutor Application: " + name + " (" + qualification + " - " + subjects + ")";

            StringBuilder plainText = new StringBuilder();
            plainText.append("=== NEW TUTOR REGISTRATION (VIDYA HOME TUITIONS) ===\n\n");
            plainText.append("• Name: ").append(name).append("\n");
            plainText.append("• Mobile: +91 ").append(mobile).append(" | WhatsApp: +91 ").append(whatsapp).append("\n");
            plainText.append("• Email: ").append(email).append("\n");
            plainText.append("• Qualification: ").append(qualification).append(" (").append(percentage).append("% - ").append(passYear).append(")\n");
            plainText.append("• College: ").append(college).append("\n");
            plainText.append("• Classes: ").append(grades).append("\n");
            plainText.append("• Subjects: ").append(subjects).append("\n");
            plainText.append("• Boards: ").append(boards).append("\n");
            plainText.append("• Localities: ").append(localities).append(" (").append(distance).append(")\n");
            plainText.append("• Expected Rate: ").append(rate).append(" | Timings: ").append(timings).append("\n");
            plainText.append("• Bio: ").append(bio).append("\n\n");
            plainText.append("Admin Portal: https://vidya-admin-iota.vercel.app/leads\n");

            String html = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background: #ffffff;\">"
                    + "<div style=\"background: linear-gradient(135deg, #059669, #10b981); padding: 20px; color: white; text-align: center;\">"
                    + "<h2 style=\"margin: 0; font-size: 22px;\">Vidya Home Tuitions</h2>"
                    + "<p style=\"margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;\">New Tutor Application Received</p>"
                    + "</div>"
                    + "<div style=\"padding: 24px; color: #333333; line-height: 1.6;\">"
                    + "<table style=\"width: 100%; border-collapse: collapse; font-size: 14px;\">"
                    + "<tr style=\"border-bottom: 1px solid #f0f0f0;\"><td style=\"padding: 8px 0; color: #666; width: 35%;\">Tutor Name:</td><td style=\"padding: 8px 0; font-weight: bold;\">" + escape(name) + "</td></tr>"
                    + "<tr style=\"border-bottom: 1px solid #f0f0f0;\"><td style=\"padding: 8px 0; color: #666;\">Contact Numbers:</td><td style=\"padding: 8px 0; font-weight: bold; color: #059669;\">+91 " + escape(mobile) + " / +91 " + escape(whatsapp) + "</td></tr>"
                    + "<tr style=\"border-bottom: 1px solid #f0f0f0;\"><td style=\"padding: 8px 0; color: #666;\">Email:</td><td style=\"padding: 8px 0;\">" + escape(email) + "</td></tr>"
                    + "<tr style=\"border-bottom: 1px solid #f0f0f0;\"><td style=\"padding: 8px 0; color: #666;\">Qualification:</td><td style=\"padding: 8px 0; font-weight: bold;\">" + escape(qualification) + " (" + escape(percentage) + "% - " + escape(passYear) + ")</td></tr>"
                    + "<tr style=\"border-bottom: 1px solid #f0f0f0;\"><td style=\"padding: 8px 0; color: #666;\">College:</td><td style=\"padding: 8px 0;\">" + escape(college) + "</td></tr>"
                    + "<tr style=\"border-bottom: 1px solid #f0f0f0;\"><td style=\"padding: 8px 0; color: #666;\">Classes:</td><td style=\"padding: 8px 0; font-weight: bold;\">" + escape(grades) + "</td></tr>"
                    + "<tr style=\"border-bottom: 1px solid #f0f0f0;\"><td style=\"padding: 8px 0; color: #666;\">Subjects:</td><td style=\"padding: 8px 0; font-weight: bold; color: #d97706;\">" + escape(subjects) + "</td></tr>"
                    + "<tr style=\"border-bottom: 1px solid #f0f0f0;\"><td style=\"padding: 8px 0; color: #666;\">Boards:</td><td style=\"padding: 8px 0;\">" + escape(boards) + "</td></tr>"
                    + "<tr style=\"border-bottom: 1px solid #f0f0f0;\"><td style=\"padding: 8px 0; color: #666;\">Localities:</td><td style=\"padding: 8px 0;\">" + escape(localities) + " (" + escape(distance) + ")</td></tr>"
                    + "<tr style=\"border-bottom: 1px solid #f0f0f0;\"><td style=\"padding: 8px 0; color: #666;\">Pay & Timings:</td><td style=\"padding: 8px 0;\">" + escape(rate) + " | " + escape(timings) + "</td></tr>"
                    + "<tr><td style=\"padding: 8px 0; color: #666;\">Bio:</td><td style=\"padding: 8px 0;\">" + escape(bio) + "</td></tr>"
                    + "</table>"
                    + "<div style=\"margin-top: 24px; text-align: center;\">"
                    + "<a href=\"https://vidya-admin-iota.vercel.app/leads\" style=\"background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;\">Review in Admin Portal</a>"
                    + "</div>"
                    + "</div>"
                    + "</div>";

            sendEmail(subject, plainText.toString(), html);
        } catch (Exception e) {
            log.error("Failed to process tutor application notification: {}", e.getMessage(), e);
        }
    }

    @Override
    @Async("taskExecutor")
    public void notifyContactMessage(ContactMessage message) {
        try {
            String name = val(message.getName());
            String phone = val(message.getPhone());
            String email = val(message.getEmail());
            String msg = val(message.getMessage());

            String subject = "💬 New Contact Message from " + name;

            StringBuilder plainText = new StringBuilder();
            plainText.append("=== NEW CONTACT MESSAGE (VIDYA HOME TUITIONS) ===\n\n");
            plainText.append("• Sender Name: ").append(name).append("\n");
            plainText.append("• Mobile: +91 ").append(phone).append("\n");
            plainText.append("• Email: ").append(email).append("\n");
            plainText.append("• Message:\n").append(msg).append("\n\n");
            plainText.append("Admin Portal: https://vidya-admin-iota.vercel.app/leads\n");

            String html = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background: #ffffff;\">"
                    + "<div style=\"background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 20px; color: white; text-align: center;\">"
                    + "<h2 style=\"margin: 0; font-size: 22px;\">Vidya Home Tuitions</h2>"
                    + "<p style=\"margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;\">New Contact Message Received</p>"
                    + "</div>"
                    + "<div style=\"padding: 24px; color: #333333; line-height: 1.6;\">"
                    + "<table style=\"width: 100%; border-collapse: collapse; font-size: 14px;\">"
                    + "<tr style=\"border-bottom: 1px solid #f0f0f0;\"><td style=\"padding: 8px 0; color: #666; width: 30%;\">Name:</td><td style=\"padding: 8px 0; font-weight: bold;\">" + escape(name) + "</td></tr>"
                    + "<tr style=\"border-bottom: 1px solid #f0f0f0;\"><td style=\"padding: 8px 0; color: #666;\">Phone:</td><td style=\"padding: 8px 0; font-weight: bold; color: #6366f1;\">+91 " + escape(phone) + "</td></tr>"
                    + "<tr style=\"border-bottom: 1px solid #f0f0f0;\"><td style=\"padding: 8px 0; color: #666;\">Email:</td><td style=\"padding: 8px 0;\">" + escape(email) + "</td></tr>"
                    + "<tr><td style=\"padding: 8px 0; color: #666; vertical-align: top;\">Message:</td><td style=\"padding: 8px 0; white-space: pre-wrap;\">" + escape(msg) + "</td></tr>"
                    + "</table>"
                    + "<div style=\"margin-top: 24px; text-align: center;\">"
                    + "<a href=\"https://vidya-admin-iota.vercel.app/leads\" style=\"background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;\">View in Admin Portal</a>"
                    + "</div>"
                    + "</div>"
                    + "</div>";

            sendEmail(subject, plainText.toString(), html);
        } catch (Exception e) {
            log.error("Failed to process contact message notification: {}", e.getMessage(), e);
        }
    }

    @Value("${BREVO_API_KEY:${app.brevo.api-key:}}")
    private String brevoApiKey;

    @Value("${BREVO_FROM_EMAIL:${app.brevo.from-email:vidyatutorspoint@gmail.com}}")
    private String brevoFromEmail;

    private void sendEmail(String subject, String plainText, String html) {
        List<String> recipients = Arrays.stream(adminEmailsRaw.split(","))
                .map(String::trim)
                .map(s -> s.replaceAll("[\"']", ""))
                .filter(s -> !s.isBlank() && s.contains("@"))
                .toList();

        String cleanResendKey = resendApiKey != null ? resendApiKey.trim().replaceAll("[\"']", "") : "";
        String cleanBrevoKey = brevoApiKey != null ? brevoApiKey.trim().replaceAll("[\"']", "") : "";

        // 🚀 OPTION 1: Brevo HTTPS API (Sends to ANY email without domain verification)
        if (!cleanBrevoKey.isBlank()) {
            log.info("🚀 Sending email via Brevo HTTPS API to: {}", recipients);
            sendViaBrevoApi(cleanBrevoKey, recipients, subject, html);
            return;
        }

        // 🚀 OPTION 2: Resend HTTPS API (Sends individually to avoid batch rejection in sandbox)
        if (!cleanResendKey.isBlank()) {
            log.info("🚀 Sending email via Resend HTTPS API to: {}", recipients);
            for (String recipient : recipients) {
                sendViaResendApi(cleanResendKey, recipient, subject, plainText, html);
            }
            return;
        }

        // FALLBACK: Standard JavaMailSender (SMTP)
        String fromEmail = (mailFrom != null ? mailFrom.trim().replaceAll("[\"']", "") : "bharathreddypvt@gmail.com");
        log.info("📧 Dispatching lead notification email via SMTP from [{}] to recipients: {}. Subject: {}", fromEmail, recipients, subject);

        if (mailSender == null) {
            log.warn("JavaMailSender bean is not present! Notification details:\n{}", plainText);
            return;
        }

        for (String recipient : recipients) {
            try {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                helper.setFrom(fromEmail, "Vidya Home Tuitions");
                helper.setTo(recipient);
                helper.setSubject(subject);
                helper.setText(plainText, html);
                mailSender.send(mimeMessage);
                log.info("✅ Lead notification email successfully delivered to: {}", recipient);
            } catch (Exception e) {
                log.error("❌ Failed to deliver email notification to {}: {}", recipient, e.getMessage(), e);
            }
        }
    }

    private void sendViaResendApi(String apiKey, String recipient, String subject, String plainText, String html) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("from", resendFromEmail != null && !resendFromEmail.isBlank() ? resendFromEmail : "Vidya Home Tuitions <onboarding@resend.dev>");
            payload.put("to", List.of(recipient));
            payload.put("subject", subject);
            payload.put("html", html);
            payload.put("text", plainText);

            String requestBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(15))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("✅ Resend API email successfully delivered to: {}", recipient);
            } else {
                log.warn("⚠️ Resend API returned status {} for {}: {}", response.statusCode(), recipient, response.body());
            }
        } catch (Exception e) {
            log.error("❌ Failed to send email via Resend to {}: {}", recipient, e.getMessage(), e);
        }
    }

    private void sendViaBrevoApi(String apiKey, List<String> recipients, String subject, String html) {
        try {
            Map<String, Object> payload = new HashMap<>();
            Map<String, String> sender = new HashMap<>();
            sender.put("name", "Vidya Home Tuitions");
            sender.put("email", brevoFromEmail != null ? brevoFromEmail : "vidyatutorspoint@gmail.com");
            payload.put("sender", sender);

            List<Map<String, String>> toList = recipients.stream().map(email -> {
                Map<String, String> m = new HashMap<>();
                m.put("email", email);
                return m;
            }).toList();

            payload.put("to", toList);
            payload.put("subject", subject);
            payload.put("htmlContent", html);

            String requestBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("api-key", apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(15))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("✅ Brevo API email successfully delivered to all recipients: {}", recipients);
            } else {
                log.error("❌ Brevo API returned error status {}: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("❌ Failed to send email via Brevo API: {}", e.getMessage(), e);
        }
    }

    private static String val(String s) {
        return (s == null || s.isBlank()) ? "N/A" : s.trim();
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#x27;");
    }
}
