package com.FIThread.FIThread.alumni;

import com.FIThread.FIThread.common.exception.BusinessException;
import com.FIThread.FIThread.config.AppProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PhotoStorageService {

    private static final long MAX_BYTES = 5L * 1024 * 1024;

    private final AppProperties appProperties;

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Vui long tai len anh the sinh vien cu");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new BusinessException("Anh toi da 5MB");
        }

        byte[] head;
        try (InputStream in = file.getInputStream()) {
            head = in.readNBytes(12);
        } catch (IOException e) {
            throw new BusinessException("Khong doc duoc anh");
        }

        String extension = detectExtension(head);
        if (extension == null) {
            throw new BusinessException("Chi chap nhan anh JPG, PNG hoac WEBP");
        }

        String filename = UUID.randomUUID() + "." + extension;
        try {
            Path dir = directory();
            Files.createDirectories(dir);
            file.transferTo(dir.resolve(filename));
        } catch (IOException e) {
            log.error("Khong luu duoc anh the", e);
            throw new BusinessException("Khong luu duoc anh, vui long thu lai", HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return filename;
    }

    public Resource load(String filename) {
        Path dir = directory();
        Path path = dir.resolve(filename).normalize();
        if (!path.startsWith(dir) || !Files.exists(path)) {
            throw new BusinessException("Khong tim thay anh", HttpStatus.NOT_FOUND);
        }
        return new FileSystemResource(path);
    }

    public MediaType mediaType(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".png")) return MediaType.IMAGE_PNG;
        if (lower.endsWith(".webp")) return MediaType.parseMediaType("image/webp");
        return MediaType.IMAGE_JPEG;
    }

    public void delete(String filename) {
        if (filename == null || filename.isBlank()) return;
        try {
            Path dir = directory();
            Path path = dir.resolve(filename).normalize();
            if (path.startsWith(dir)) Files.deleteIfExists(path);
        } catch (IOException e) {
            log.warn("Khong xoa duoc anh the {}: {}", filename, e.getMessage());
        }
    }

    private Path directory() {
        return Paths.get(appProperties.getUploadDir(), "student-cards").toAbsolutePath().normalize();
    }

    private static String detectExtension(byte[] h) {
        if (h.length >= 3 && (h[0] & 0xFF) == 0xFF && (h[1] & 0xFF) == 0xD8 && (h[2] & 0xFF) == 0xFF) return "jpg";
        if (h.length >= 4 && (h[0] & 0xFF) == 0x89 && h[1] == 'P' && h[2] == 'N' && h[3] == 'G') return "png";
        if (h.length >= 12 && h[0] == 'R' && h[1] == 'I' && h[2] == 'F' && h[3] == 'F'
                && h[8] == 'W' && h[9] == 'E' && h[10] == 'B' && h[11] == 'P') return "webp";
        return null;
    }
}