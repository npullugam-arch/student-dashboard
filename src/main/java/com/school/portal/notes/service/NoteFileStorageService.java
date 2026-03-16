package com.school.portal.notes.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class NoteFileStorageService {

    // stores on disk, served via /uploads/**
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public String savePdf(MultipartFile file, String teacherId, Integer standard, String section) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("PDF file is required");
        }
        String original = StringUtils.cleanPath(file.getOriginalFilename() == null ? "note.pdf" : file.getOriginalFilename());
        String lower = original.toLowerCase();
        if (!lower.endsWith(".pdf")) {
            throw new RuntimeException("Only PDF allowed");
        }

        String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String safeTeacher = (teacherId == null ? "T" : teacherId).replaceAll("[^a-zA-Z0-9_-]", "");
        String safeSection = (section == null ? "A" : section).replaceAll("[^a-zA-Z0-9]", "");
        String name = safeTeacher + "_C" + standard + safeSection + "_" + ts + "_" + UUID.randomUUID() + ".pdf";

        try {
            Path base = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path notesDir = base.resolve("notes");
            Files.createDirectories(notesDir);

            Path target = notesDir.resolve(name);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            // URL the frontend will use
            return "/uploads/notes/" + name;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage());
        }
    }
}
