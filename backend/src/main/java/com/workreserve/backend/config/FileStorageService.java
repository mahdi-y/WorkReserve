package com.workreserve.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import java.util.Arrays;
import java.util.List;

@Service
public class FileStorageService {

    @Value("${app.upload.dir:${user.home}/workreserve/uploads}")
    private String uploadDir;

    @Value("${app.base.url:http://localhost:8082}")
    private String baseUrl;

    private final List<String> allowedImageTypes = Arrays.asList(
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );

    private final long maxFileSize = 5 * 1024 * 1024; 

    public String storeFile(MultipartFile file, String folder) {
        try {
            validateFile(file);

            Path uploadPath = Paths.get(uploadDir, folder);
            Files.createDirectories(uploadPath);

            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);
            String filename = UUID.randomUUID().toString() + fileExtension;

            Path targetLocation = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return baseUrl + "/uploads/" + folder + "/" + filename;

        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Could not store file. Please try again.");
        }
    }

    public void deleteFile(String filePath) {
        try {
            if (filePath != null && filePath.contains("/uploads/")) {
                String relativePath = filePath.substring(filePath.indexOf("/uploads/") + 9);
                Path file = Paths.get(uploadDir).resolve(relativePath);
                Files.deleteIfExists(file);
            }
        } catch (IOException ex) {
            System.err.println("Could not delete file: " + filePath);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty");
        }

        if (file.getSize() > maxFileSize) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "File size exceeds maximum allowed size of 5MB");
        }

        if (!allowedImageTypes.contains(file.getContentType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Only image files (JPEG, PNG, GIF, WebP) are allowed");
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.'));
    }
}