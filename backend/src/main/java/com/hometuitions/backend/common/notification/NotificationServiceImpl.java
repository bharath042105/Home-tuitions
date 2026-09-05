package com.hometuitions.backend.common.notification;

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

import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final JavaMailSender mailSender;

    @Value("${app.notification.admin-emails:vidyatutorspoint@gmail.com,sbharathreddy219@gmail.com,bharathreddypvt@gmail.com}")
    private String adminEmailsRaw;

    @Value("${app.notification.admin-phones:918074470640,916303619089,918143241349}")
    private String adminPhonesRaw;

    @Value("${spring.mail.username:bharathreddypvt@gmail.com}")
    private String mailFrom;

    public NotificationServiceImpl(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    @Async
    public void notifyTuitionInquiry(TuitionInquiry inquiry) {
        String subject = "🔔 New Tutor Request: " + inquiry.getParentName() + " - " + inquiry.getGrade();
        
        StringBuilder plainText = new StringBuilder();
        plainText.append("=== NEW TUITION INQUIRY (VIDYA HOME TUITIONS) ===\n\n");
        plainText.append("• Parent/Student Name: ").append(inquiry.getParentName()).append("\n");
        plainText.append("• Mobile Number: +91 ").append(inquiry.getMobile()).append("\n");
        plainText.append("• Email: ").append(inquiry.getEmail() != null ? inquiry.getEmail() : "N/A").append("\n");
        plainText.append("• Grade / Class: ").append(inquiry.getGrade()).append("\n");
        plainText.append("• Board / Syllabus: ").append(inquiry.getBoard()).append("\n");
        plainText.append("• Subject(s): ").append(inquiry.getSubjects()).append("\n");
        plainText.append("• Tuition Mode: ").append(inquiry.getTuitionMode()).append("\n");
        if (inquiry.getAddress() != null && !inquiry.getAddress().isBlank()) {
            plainText.append("• Address / Locality: ").append(inquiry.getAddress()).append("\n");
        }
        plainText.append("• Preferred Timings: ").append(inquiry.getTimings()).append("\n");
        plainText.append("• Frequency: ").append(inquiry.getFrequency()).append("\n");
        plainText.append("• Budget Range: ").append(inquiry.getBudget()).append("\n");
        if (inquiry.getRemarks() != null && !inquiry.getRemarks().isBlank()) {
            plainText.append("• Special Requirements / Notes: ").append(inquiry.getRemarks()).append("\n");
        }
        plainText.append("• Submitted At: ").append(inquiry.getCreatedAt() != null ? inquiry.getCreatedAt().toString() : "Just now").append("\n\n");
        plainText.append("Admin Portal: https://vidya-admin-iota.vercel.app/leads\n");

        String html = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background: #ffffff;">
                <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 20px; color: white; text-align: center;">
                    <h2 style="margin: 0; font-size: 22px;">Vidya Home Tuitions</h2>
                    <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">New Student Tuition Inquiry Received</p>
                </div>
                <div style="padding: 24px; color: #333333; line-height: 1.6;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #666; width: 40%;">Parent/Student:</td><td style="padding: 8px 0; font-weight: bold;">%s</td></tr>
                        <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #666;">Mobile:</td><td style="padding: 8px 0; font-weight: bold; color: #1e40af;">+91 %s</td></tr>
                        <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #666;">Email:</td><td style="padding: 8px 0;">%s</td></tr>
                        <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #666;">Grade & Board:</td><td style="padding: 8px 0; font-weight: bold;">%s (%s)</td></tr>
                        <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #666;">Subjects:</td><td style="padding: 8px 0; font-weight: bold; color: #d97706;">%s</td></tr>
                        <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #666;">Mode:</td><td style="padding: 8px 0;">%s</td></tr>
                        <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #666;">Address:</td><td style="padding: 8px 0;">%s</td></tr>
                        <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #666;">Timings & Frequency:</td><td style="padding: 8px 0;">%s | %s</td></tr>
                        <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #666;">Budget:</td><td style="padding: 8px 0;">%s</td></tr>
                        <tr><td style="padding: 8px 0; color: #666;">Remarks:</td><td style="padding: 8px 0;">%s</td></tr>
                    </table>
                    <div style="margin-top: 24px; text-align: center;">
                        <a href="https://vidya-admin-iota.vercel.app/leads" style="background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Open Admin Portal</a>
                    </div>
                </div>
            </div>
            """.formatted(
                escape(inquiry.getParentName()),
                escape(inquiry.getMobile()),
                escape(inquiry.getEmail() != null ? inquiry.getEmail() : "N/A"),
                escape(inquiry.getGrade()),
                escape(inquiry.getBoard()),
                escape(inquiry.getSubjects()),
                escape(inquiry.getTuitionMode()),
                escape(inquiry.getAddress() != null ? inquiry.getAddress() : "N/A"),
                escape(inquiry.getTimings()),
                escape(inquiry.getFrequency()),
                escape(inquiry.getBudget()),
                escape(inquiry.getRemarks() != null ? inquiry.getRemarks() : "None")
        );

        sendEmail(subject, plainText.toString(), html);
    }

    @Override
    @Async
    public void notifyTutorApplication(TutorApplication app) {
        String subject = "👨‍🏫 New Tutor Registration: " + app.getName() + " (" + app.getQualification() + ")";

        StringBuilder plainText = new StringBuilder();
        plainText.append("=== NEW TUTOR REGISTRATION (VIDYA HOME TUITIONS) ===\n\n");
        plainText.append("• Full Name: ").append(app.getName()).append("\n");
        plainText.append("• Father's Name: ").append(app.getFatherName() != null ? app.getFatherName() : "N/A").append("\n");
        plainText.append("• Mobile: +91 ").append(app.getMobile()).append("\n");
        plainText.append("• WhatsApp: +91 ").append(app.getWhatsapp()).append("\n");
        plainText.append("• Email: ").append(app.getEmail()).append("\n");
        plainText.append("• Highest Qualification: ").append(app.getQualification()).append(" (").append(app.getPercentage()).append("% - ").append(app.getPassYear()).append(")\n");
        plainText.append("• College/Univ: ").append(app.getCollege()).append("\n");
        plainText.append("• 12th/Inter: ").append(app.getInterCollege() != null ? app.getInterCollege() : "N/A").append(" (").append(app.getInterPercentage() != null ? app.getInterPercentage() : "").append(")\n");
        plainText.append("• 10th School: ").append(app.getSchoolName() != null ? app.getSchoolName() : "N/A").append(" (").append(app.getSchoolPercentage() != null ? app.getSchoolPercentage() : "").append(")\n");
        plainText.append("• Preferred Localities: ").append(app.getLocalities()).append(" (").append(app.getCommuteDistance()).append(")\n");
        plainText.append("• Classes/Grades: ").append(app.getGrades()).append("\n");
        plainText.append("• Subjects: ").append(app.getSubjects()).append("\n");
        plainText.append("• Target Boards: ").append(app.getBoards()).append("\n");
        plainText.append("• Mode: ").append(app.getMode()).append(" | Medium: ").append(app.getMedium()).append("\n");
        plainText.append("• Experience: ").append(app.getExperience()).append(" | Occupation: ").append(app.getOccupation()).append("\n");
        plainText.append("• Expected Rate: ").append(app.getExpectedRate()).append("\n");
        plainText.append("• Timings: ").append(app.getTimings()).append("\n");
        if (app.getBio() != null && !app.getBio().isBlank()) {
            plainText.append("• Bio / Notes: ").append(app.getBio()).append("\n");
        }
        plainText.append("\nAdmin Portal: https://vidya-admin-iota.vercel.app/leads\n");

        String html = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background: #ffffff;">
                <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 20px; color: white; text-align: center;">
                    <h2 style="margin: 0; font-size: 22px;">Vidya Home Tuitions</h2>
                    <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">New Tutor Application Received</p>
                </div>
                <div style="padding: 24px; color: #333333; line-height: 1.6;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #666; width: 40%;">Tutor Name:</td><td style="padding: 8px 0; font-weight: bold;">%s</td></tr>
                        <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #666;">Mobile & WhatsApp:</td><td style="padding: 8px 0; font-weight: bold; color: #059669;">+91 %s / +91 %s</td></tr>
                        <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #666;">Email:</td><td style="padding: 8px 0;">%s</td></tr>
                        <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #666;">Qualification:</td><td style="padding: 8px 0; font-weight: bold;">%s (%s%% - %s)</td></tr>
                        <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #666;">College:</td><td style="padding: 8px 0;">%s</td></tr>
                        <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #666;">Classes:</td><td style="padding: 8px 0; font-weight: bold;">%s</td></tr>
                        <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #666;">Subjects:</td><td style="padding: 8px 0; font-weight: bold; color: #d97706;">%s</td></tr>
                        <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #666;">Boards:</td><td style="padding: 8px 0;">%s</td></tr>
                        <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #666;">Localities:</td><td style="padding: 8px 0;">%s (%s)</td></tr>
                        <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #666;">Expected Pay & Timings:</td><td style="padding: 8px 0;">%s | %s</td></tr>
                        <tr><td style="padding: 8px 0; color: #666;">Bio:</td><td style="padding: 8px 0;">%s</td></tr>
                    </table>
                    <div style="margin-top: 24px; text-align: center;">
                        <a href="https://vidya-admin-iota.vercel.app/leads" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Review in Admin Portal</a>
                    </div>
                </div>
            </div>
            """.formatted(
                escape(app.getName()),
                escape(app.getMobile()),
                escape(app.getWhatsapp()),
                escape(app.getEmail()),
                escape(app.getQualification()),
                escape(app.getPercentage()),
                escape(app.getPassYear()),
                escape(app.getCollege()),
                escape(app.getGrades()),
                escape(app.getSubjects()),
                escape(app.getBoards()),
                escape(app.getLocalities()),
                escape(app.getCommuteDistance()),
                escape(app.getExpectedRate()),
                escape(app.getTimings()),
                escape(app.getBio() != null ? app.getBio() : "None")
        );

        sendEmail(subject, plainText.toString(), html);
    }

    @Override
    @Async
    public void notifyContactMessage(ContactMessage message) {
        String subject = "💬 New Contact Message: " + message.getName();

        StringBuilder plainText = new StringBuilder();
        plainText.append("=== NEW CONTACT MESSAGE (VIDYA HOME TUITIONS) ===\n\n");
        plainText.append("• Sender Name: ").append(message.getName()).append("\n");
        plainText.append("• Mobile: ").append(message.getPhone()).append("\n");
        plainText.append("• Email: ").append(message.getEmail() != null ? message.getEmail() : "N/A").append("\n");
        plainText.append("• Message:\n").append(message.getMessage()).append("\n\n");
        plainText.append("Admin Portal: https://vidya-admin-iota.vercel.app/leads\n");

        String html = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background: #ffffff;">
                <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 20px; color: white; text-align: center;">
                    <h2 style="margin: 0; font-size: 22px;">Vidya Home Tuitions</h2>
                    <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">New Contact Message Received</p>
                </div>
                <div style="padding: 24px; color: #333333; line-height: 1.6;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #666; width: 30%;">Name:</td><td style="padding: 8px 0; font-weight: bold;">%s</td></tr>
                        <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #666;">Phone:</td><td style="padding: 8px 0; font-weight: bold; color: #6366f1;">%s</td></tr>
                        <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; color: #666;">Email:</td><td style="padding: 8px 0;">%s</td></tr>
                        <tr><td style="padding: 8px 0; color: #666; vertical-align: top;">Message:</td><td style="padding: 8px 0; white-space: pre-wrap;">%s</td></tr>
                    </table>
                    <div style="margin-top: 24px; text-align: center;">
                        <a href="https://vidya-admin-iota.vercel.app/leads" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View in Admin Portal</a>
                    </div>
                </div>
            </div>
            """.formatted(
                escape(message.getName()),
                escape(message.getPhone()),
                escape(message.getEmail() != null ? message.getEmail() : "N/A"),
                escape(message.getMessage())
        );

        sendEmail(subject, plainText.toString(), html);
    }

    private void sendEmail(String subject, String plainText, String html) {
        List<String> recipients = Arrays.stream(adminEmailsRaw.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();

        log.info("Sending lead notification email to recipients: {}. Subject: {}", recipients, subject);

        if (mailSender == null) {
            log.info("JavaMailSender is not configured. Notification details:\n{}", plainText);
            return;
        }

        try {
            for (String recipient : recipients) {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                helper.setFrom(mailFrom, "Vidya Home Tuitions");
                helper.setTo(recipient);
                helper.setSubject(subject);
                helper.setText(plainText, html);
                mailSender.send(mimeMessage);
                log.info("Email notification successfully delivered to: {}", recipient);
            }
        } catch (Exception e) {
            log.warn("Could not dispatch email notification (check SMTP credentials in environment): {}", e.getMessage());
            log.info("Notification payload:\n{}", plainText);
        }
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
