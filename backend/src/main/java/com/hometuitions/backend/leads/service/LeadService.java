package com.hometuitions.backend.leads.service;

import com.hometuitions.backend.leads.dto.SubmitContactMessageRequest;
import com.hometuitions.backend.leads.dto.SubmitTuitionInquiryRequest;
import com.hometuitions.backend.leads.dto.SubmitTutorApplicationRequest;
import com.hometuitions.backend.leads.entity.ContactMessage;
import com.hometuitions.backend.leads.entity.LeadStatus;
import com.hometuitions.backend.leads.entity.TuitionInquiry;
import com.hometuitions.backend.leads.entity.TutorApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

/** Three lead types share an identical submit/list/update-status shape, which doesn't
 *  justify three near-empty service classes but also isn't uniform enough (different
 *  entities, different fields) to force behind a generic Lead&lt;T&gt; abstraction -
 *  one service with a method trio per type is the pragmatic middle ground. */
public interface LeadService {

    TuitionInquiry submitTuitionInquiry(SubmitTuitionInquiryRequest request);

    Page<TuitionInquiry> listTuitionInquiries(Pageable pageable);

    TuitionInquiry updateTuitionInquiryStatus(UUID id, LeadStatus status);

    TutorApplication submitTutorApplication(SubmitTutorApplicationRequest request);

    Page<TutorApplication> listTutorApplications(Pageable pageable);

    TutorApplication updateTutorApplicationStatus(UUID id, LeadStatus status);

    ContactMessage submitContactMessage(SubmitContactMessageRequest request);

    Page<ContactMessage> listContactMessages(Pageable pageable);

    ContactMessage updateContactMessageStatus(UUID id, LeadStatus status);
}
