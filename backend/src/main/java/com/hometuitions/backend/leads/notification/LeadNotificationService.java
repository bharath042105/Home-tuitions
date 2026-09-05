package com.hometuitions.backend.leads.notification;

import com.hometuitions.backend.leads.entity.ContactMessage;
import com.hometuitions.backend.leads.entity.TuitionInquiry;
import com.hometuitions.backend.leads.entity.TutorApplication;

public interface LeadNotificationService {
    void notifyTuitionInquiry(TuitionInquiry inquiry);
    void notifyTutorApplication(TutorApplication application);
    void notifyContactMessage(ContactMessage message);
}
