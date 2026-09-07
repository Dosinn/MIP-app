package com.projekty.projekty.FileAttachment;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload-dir}")
    private String uploadDir;

    public String storeFile(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);

            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            String uniqueName = UUID.randomUUID() + "_" + originalName;

            Path targetPath = uploadPath.resolve(uniqueName);
            Files.copy(file.getInputStream(), targetPath);

            return uniqueName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }

    public Resource loadFileAsResource(String storedFileName) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(storedFileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException("File not found on disk: " + storedFileName);
            }

            return resource;
        } catch (MalformedURLException e) {
            throw new RuntimeException("Failed to load file: " + e.getMessage(), e);
        }
    }

    public void deleteFile(String storedFileName) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(storedFileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file: " + e.getMessage(), e);
        }
    }
}
