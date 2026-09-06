package com.hometuitions.backend.leads.service.impl;

import com.hometuitions.backend.leads.dto.SubmitContactMessageRequest;
import com.hometuitions.backend.leads.dto.SubmitTuitionInquiryRequest;
import com.hometuitions.backend.leads.dto.SubmitTutorApplicationRequest;
import com.hometuitions.backend.leads.entity.ContactMessage;
import com.hometuitions.backend.leads.entity.LeadStatus;
import com.hometuitions.backend.leads.entity.TuitionInquiry;
import com.hometuitions.backend.leads.entity.TutorApplication;
import com.hometuitions.backend.leads.notification.LeadNotificationService;
import com.hometuitions.backend.leads.repository.ContactMessageRepository;
import com.hometuitions.backend.leads.repository.TuitionInquiryRepository;
import com.hometuitions.backend.leads.repository.TutorApplicationRepository;
import com.hometuitions.backend.leads.service.LeadService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class LeadServiceImpl implements LeadService {

    private final TuitionInquiryRepository tuitionInquiryRepository;
    private final TutorApplicationRepository tutorApplicationRepository;
    private final ContactMessageRepository contactMessageRepository;
    private final LeadNotificationService notificationService;

    public LeadServiceImpl(TuitionInquiryRepository tuitionInquiryRepository,
                            TutorApplicationRepository tutorApplicationRepository,
                            ContactMessageRepository contactMessageRepository,
                            LeadNotificationService notificationService) {
        this.tuitionInquiryRepository = tuitionInquiryRepository;
        this.tutorApplicationRepository = tutorApplicationRepository;
        this.contactMessageRepository = contactMessageRepository;
        this.notificationService = notificationService;
    }

    @Override
    public TuitionInquiry submitTuitionInquiry(SubmitTuitionInquiryRequest request) {
        TuitionInquiry inquiry = new TuitionInquiry();
        inquiry.setGrade(request.grade());
        inquiry.setBoard(request.board());
        inquiry.setSubjects(join(request.subjects()));
        inquiry.setTuitionMode(request.tuitionMode());
        inquiry.setAddress(request.address());
        inquiry.setTimings(request.timings());
        inquiry.setFrequency(request.frequency());
        inquiry.setParentName(request.parentName());
        inquiry.setMobile(request.mobile());
        inquiry.setEmail(request.email());
        inquiry.setBudget(request.budget());
        inquiry.setRemarks(request.remarks());
        TuitionInquiry saved = tuitionInquiryRepository.save(inquiry);
        if (notificationService != null) {
            try {
                notificationService.notifyTuitionInquiry(saved);
            } catch (Exception ignored) {}
        }
        return saved;
    }

    @Override
    public Page<TuitionInquiry> listTuitionInquiries(Pageable pageable) {
        return tuitionInquiryRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Override
    public TuitionInquiry updateTuitionInquiryStatus(UUID id, LeadStatus status) {
        TuitionInquiry inquiry = tuitionInquiryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tuition inquiry not found"));
        inquiry.setStatus(status);
        return tuitionInquiryRepository.save(inquiry);
    }

    @Override
    public TutorApplication submitTutorApplication(SubmitTutorApplicationRequest request) {
        TutorApplication application = new TutorApplication();
        application.setName(request.name());
        application.setFatherName(request.fatherName());
        application.setQualification(request.qualification());
        application.setCollege(request.college());
        application.setPercentage(request.percentage());
        application.setPassYear(request.passYear());
        application.setInterCollege(request.interCollege());
        application.setInterPercentage(request.interPercentage());
        application.setSchoolName(request.schoolName());
        application.setSchoolPercentage(request.schoolPercentage());
        application.setLocalities(request.localities());
        application.setCommuteDistance(request.commuteDistance());
        application.setGrades(join(request.grades()));
        application.setSubjects(join(request.subjects()));
        application.setBoards(join(request.boards()));
        application.setMedium(request.medium());
        application.setMode(request.mode());
        application.setMobile(request.mobile());
        application.setWhatsapp(request.whatsapp());
        application.setAlternativePhone(request.alternativePhone());
        application.setEmail(request.email());
        application.setOccupation(request.occupation());
        application.setExperience(request.experience());
        application.setExpectedRate(request.expectedRate());
        application.setTimings(request.timings());
        application.setBio(request.bio());
        application.setPhotoUrl(request.photoUrl());
        application.setAadhaarUrl(request.aadhaarUrl());
        application.setDegreeUrl(request.degreeUrl());
        application.setResumeUrl(request.resumeUrl());
        TutorApplication saved = tutorApplicationRepository.save(application);
        if (notificationService != null) {
            try {
                notificationService.notifyTutorApplication(saved);
            } catch (Exception ignored) {}
        }
        return saved;
    }

    @Override
    public Page<TutorApplication> listTutorApplications(Pageable pageable) {
        return tutorApplicationRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Override
    public TutorApplication updateTutorApplicationStatus(UUID id, LeadStatus status) {
        TutorApplication application = tutorApplicationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tutor application not found"));
        application.setStatus(status);
        return tutorApplicationRepository.save(application);
    }

    @Override
    public ContactMessage submitContactMessage(SubmitContactMessageRequest request) {
        ContactMessage contactMessage = new ContactMessage();
        contactMessage.setName(request.name());
        contactMessage.setPhone(request.phone());
        contactMessage.setEmail(request.email());
        contactMessage.setMessage(request.message());
        ContactMessage saved = contactMessageRepository.save(contactMessage);
        if (notificationService != null) {
            try {
                notificationService.notifyContactMessage(saved);
            } catch (Exception ignored) {}
        }
        return saved;
    }

    @Override
    public Page<ContactMessage> listContactMessages(Pageable pageable) {
        return contactMessageRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Override
    public ContactMessage updateContactMessageStatus(UUID id, LeadStatus status) {
        ContactMessage contactMessage = contactMessageRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Contact message not found"));
        contactMessage.setStatus(status);
        return contactMessageRepository.save(contactMessage);
    }

    private static String join(List<String> values) {
        return String.join(",", values);
    }
}
