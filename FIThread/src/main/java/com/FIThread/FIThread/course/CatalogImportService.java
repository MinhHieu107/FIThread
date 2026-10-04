package com.FIThread.FIThread.course;

import com.FIThread.FIThread.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class CatalogImportService {

    private final CourseRepository courseRepository;

    /**
     * CSV co header: course_code,course_name,credits,specialization,is_required
     * is_required: "x" hoac rong
     */
    @Transactional
    public ImportResult importCsv(MultipartFile file) {
        int created = 0, updated = 0, skipped = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String line = reader.readLine(); // bo qua header
            if (line == null) {
                throw new BusinessException("File CSV rong");
            }

            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) continue;

                String[] cols = line.split(",", -1);
                if (cols.length < 5) {
                    skipped++;
                    continue;
                }

                String code = cols[0].trim();
                String name = cols[1].trim();
                int credits = parseIntSafe(cols[2].trim(), 3);
                String specialization = cols[3].trim();
                boolean required = cols[4].trim().equalsIgnoreCase("x");

                if (code.isBlank() || name.isBlank()) {
                    skipped++;
                    continue;
                }

                var existing = courseRepository.findByCode(code);
                Course course = existing.orElseGet(Course::new);
                boolean isNew = existing.isEmpty();

                course.setCode(code);
                course.setName(name);
                course.setCredits(credits);
                course.setSpecialization(specialization.isBlank() ? null : specialization);
                course.setRequired(required);
                courseRepository.save(course);

                if (isNew) created++; else updated++;
            }

        } catch (IOException e) {
            throw new BusinessException("Khong doc duoc file CSV: " + e.getMessage());
        }

        return new ImportResult(created, updated, skipped);
    }

    private int parseIntSafe(String value, int fallback) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return fallback;
        }
    }

    public record ImportResult(int created, int updated, int skipped) {}
}