package com.workreserve.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private MailTemplateService templateService;

    public void sendEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        message.setFrom("noreply@workreserve.com");
        mailSender.send(message);
    }

    public void sendVerificationEmail(String to, String fullName, String verificationToken) {
        templateService.sendVerificationEmail(to, fullName, verificationToken);
    }

    public void sendPasswordResetEmail(String to, String fullName, String resetToken) {
        templateService.sendPasswordResetEmail(to, fullName, resetToken);
    }

    public void sendAccountUnlockEmail(String to, String fullName, String unlockToken) {
        templateService.sendAccountUnlockEmail(to, fullName, unlockToken);
    }

    public void sendBookingConfirmationEmail(String to, String fullName, String roomName, String bookingDate, String timeSlot) {
        templateService.sendBookingConfirmationEmail(to, fullName, roomName, bookingDate, timeSlot);
    }

    public void sendWelcomeEmail(String to, String fullName) {
        templateService.sendWelcomeEmail(to, fullName);
    }
}
