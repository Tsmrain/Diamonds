package com.diamonds.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ImageService {
    private final String uploadDir = "uploads/rooms";

    public ImageService() {
        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    public String saveImage(MultipartFile file) throws IOException {
        System.out.println("Intentando guardar imagen: " + file.getOriginalFilename());
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path path = Paths.get(uploadDir, fileName);
        try {
            Files.copy(file.getInputStream(), path);
            System.out.println("Imagen guardada en: " + path.toAbsolutePath());
        } catch (Exception e) {
            System.err.println("Error al guardar imagen: " + e.getMessage());
            throw e;
        }
        return "/api/images/" + fileName;
    }
}
