package com.workreserve.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;

@Service
public class MailTemplateService {

    @Autowired
    private JavaMailSender mailSender;

    private static final String BASE_TEMPLATE = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>WorkReserve</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
                .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
                .header p { font-size: 16px; opacity: 0.9; }
                .content { padding: 40px 30px; }
                .content h2 { color: #1f2937; font-size: 24px; margin-bottom: 20px; }
                .content p { color: #4b5563; font-size: 16px; margin-bottom: 20px; }
                .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; transition: transform 0.2s; }
                .button:hover { transform: translateY(-2px); }
                .info-box { background-color: #f3f4f6; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
                .footer { background-color: #1f2937; color: #9ca3af; padding: 30px; text-align: center; font-size: 14px; }
                .footer a { color: #667eea; text-decoration: none; }
                .divider { height: 1px; background-color: #e5e7eb; margin: 30px 0; }
                @media (max-width: 600px) {
                    .container { margin: 0; box-shadow: none; }
                    .header, .content, .footer { padding: 20px; }
                    .header h1 { font-size: 24px; }
                    .content h2 { font-size: 20px; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>WorkReserve</h1>
                    <p>Workspace Management Platform</p>
                </div>
                <div class="content">
                    {{CONTENT}}
                </div>
                <div class="footer">
                    <p>&copy; 2025 WorkReserve. All rights reserved.</p>
                    <p>Need help? <a href="mailto:support@workreserve.com">Contact Support</a></p>
                </div>
            </div>
        </body>
        </html>
        """;

    public void sendVerificationEmail(String to, String fullName, String verificationToken) {
        String content = String.format("""
            <h2>Welcome to WorkReserve, %s! 🎉</h2>
            <p>Thank you for signing up! We're excited to have you join our workspace community.</p>
            <p>To complete your registration and start booking workspaces, please verify your email address by clicking the button below:</p>
            <a href="http://localhost:3000/verify-email?token=%s" class="button">Verify Email Address</a>
            <div class="info-box">
                <p><strong>Security Note:</strong> This verification link will expire in 24 hours for your security.</p>
            </div>
            <p>If you didn't create this account, you can safely ignore this email.</p>
            """, fullName, verificationToken);
        
        sendEmail(to, "Welcome to WorkReserve - Verify Your Email", content);
    }

    public void sendPasswordResetEmail(String to, String fullName, String resetToken) {
        String content = String.format("""
            <h2>Password Reset Request</h2>
            <p>Hi %s,</p>
            <p>We received a request to reset your password for your WorkReserve account.</p>
            <p>Click the button below to create a new password:</p>
            <a href="http://localhost:3000/reset-password?token=%s" class="button">Reset Password</a>
            <div class="info-box">
                <p><strong>Security Information:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>This link will expire in 1 hour</li>
                    <li>You can only use this link once</li>
                    <li>If you didn't request this, please ignore this email</li>
                </ul>
            </div>
            <p>For security reasons, we recommend choosing a strong password that you haven't used before.</p>
            """, fullName, resetToken);
        
        sendEmail(to, "Reset Your WorkReserve Password", content);
    }

    public void sendAccountUnlockEmail(String to, String fullName, String unlockToken) {
        String content = String.format("""
            <h2>Account Security Alert</h2>
            <p>Hi %s,</p>
            <p>Your WorkReserve account has been temporarily locked due to multiple failed login attempts.</p>
            <p>For your security, please click the button below to unlock your account:</p>
            <a href="http://localhost:3000/unlock-account?token=%s" class="button">Unlock Account</a>
            <div class="info-box">
                <p><strong>Why was my account locked?</strong></p>
                <p>We lock accounts after several unsuccessful login attempts to protect your account from unauthorized access.</p>
            </div>
            <p>If you believe this was a mistake or you're concerned about unauthorized access, please contact our support team.</p>
            """, fullName, unlockToken);
        
        sendEmail(to, "WorkReserve Account Locked - Action Required", content);
    }

    public void sendBookingConfirmationEmail(String to, String fullName, String roomName, String bookingDate, String timeSlot) {
        String content = String.format("""
            <h2>Booking Confirmed! ✅</h2>
            <p>Hi %s,</p>
            <p>Great news! Your workspace booking has been confirmed.</p>
            <div class="info-box">
                <h3 style="margin-bottom: 15px; color: #1f2937;">Booking Details</h3>
                <p><strong>Workspace:</strong> %s</p>
                <p><strong>Date:</strong> %s</p>
                <p><strong>Time:</strong> %s</p>
            </div>
            <p>Please arrive on time and bring a valid ID. You can view or modify your booking in your dashboard.</p>
            <a href="http://localhost:3000/dashboard/bookings" class="button">View My Bookings</a>
            <p>We look forward to seeing you at WorkReserve!</p>
            """, fullName, roomName, bookingDate, timeSlot);
        
        sendEmail(to, "Booking Confirmed - " + roomName, content);
    }

    public void sendBookingCancellationEmail(String to, String fullName, String roomName, String bookingDate) {
        String content = String.format("""
            <h2>Booking Cancelled</h2>
            <p>Hi %s,</p>
            <p>Your booking has been successfully cancelled.</p>
            <div class="info-box">
                <h3 style="margin-bottom: 15px; color: #1f2937;">Cancelled Booking</h3>
                <p><strong>Workspace:</strong> %s</p>
                <p><strong>Date:</strong> %s</p>
            </div>
            <p>If you need to make a new booking, you can browse available workspaces in your dashboard.</p>
            <a href="http://localhost:3000/rooms" class="button">Browse Workspaces</a>
            """, fullName, roomName, bookingDate);
        
        sendEmail(to, "Booking Cancelled - " + roomName, content);
    }

    public void sendWelcomeEmail(String to, String fullName) {
        String content = String.format("""
            <h2>Welcome to WorkReserve! 🏢</h2>
            <p>Hi %s,</p>
            <p>Congratulations! Your email has been verified and your account is now active.</p>
            <p>You're all set to start booking workspaces. Here's what you can do:</p>
            <div class="info-box">
                <h3 style="margin-bottom: 15px; color: #1f2937;">Getting Started</h3>
                <ul style="margin: 0; padding-left: 20px;">
                    <li>Browse available workspaces</li>
                    <li>Book desks, meeting rooms, and private offices</li>
                    <li>Manage your bookings</li>
                    <li>Update your profile settings</li>
                </ul>
            </div>
            <a href="http://localhost:3000/rooms" class="button">Start Booking</a>
            <div class="divider"></div>
            <p>If you have any questions, our support team is here to help!</p>
            """, fullName);
        
        sendEmail(to, "Welcome to WorkReserve - Let's Get Started!", content);
    }

    private void sendEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setFrom("noreply@workreserve.com", "WorkReserve");
            
            String finalHtml = BASE_TEMPLATE.replace("{{CONTENT}}", htmlContent);
            helper.setText(finalHtml, true);
            
            mailSender.send(message);
        } catch (MessagingException | UnsupportedEncodingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }
}