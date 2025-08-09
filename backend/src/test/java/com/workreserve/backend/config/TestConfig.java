package com.workreserve.backend.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessagePreparator;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import java.io.InputStream;
import java.util.Properties;

@TestConfiguration
public class TestConfig {

    @Bean
    @Primary
    public JavaMailSender javaMailSender() {
        return new JavaMailSender() {
            @Override
            public MimeMessage createMimeMessage() {
                return new MimeMessage(Session.getDefaultInstance(new Properties()));
            }

            @Override
            public MimeMessage createMimeMessage(InputStream contentStream) {
                return createMimeMessage();
            }

            @Override
            public void send(MimeMessage mimeMessage) {
                System.out.println("Mock: Email would be sent");
            }

            @Override
            public void send(MimeMessage... mimeMessages) {
                System.out.println("Mock: Emails would be sent");
            }

            @Override
            public void send(MimeMessagePreparator mimeMessagePreparator) {
                try {
                    MimeMessage message = createMimeMessage();
                    mimeMessagePreparator.prepare(message);
                    System.out.println("Mock: Email prepared and would be sent");
                } catch (Exception e) {
                    System.out.println("Mock: Email preparation simulated");
                }
            }

            @Override
            public void send(MimeMessagePreparator... mimeMessagePreparators) {
                for (MimeMessagePreparator preparator : mimeMessagePreparators) {
                    send(preparator);
                }
            }

            @Override
            public void send(SimpleMailMessage simpleMessage) {
                System.out.println("Mock: Simple email would be sent to: " + 
                    (simpleMessage.getTo() != null && simpleMessage.getTo().length > 0 ? 
                     simpleMessage.getTo()[0] : "unknown"));
            }

            @Override
            public void send(SimpleMailMessage... simpleMessages) {
                for (SimpleMailMessage message : simpleMessages) {
                    send(message);
                }
            }
        };
    }
}