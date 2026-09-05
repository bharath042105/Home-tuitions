package com.hometuitions.backend.common.notification;

import com.hometuitions.backend.leads.entity.ContactMessage;
import com.hometuitions.backend.leads.entity.TuitionInquiry;
import com.hometuitions.backend.leads.entity.TutorApplication;

public interface NotificationService {

    void notifyTuitionInquiry(TuitionInquiry inquiry);

    void notifyTutorApplication(TutorApplication application);

    void notifyContactMessage(ContactMessage message);
}
