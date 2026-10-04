package com.FIThread.FIThread.course;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/catalog")
@RequiredArgsConstructor
public class AdminCatalogController {

    private final CatalogImportService catalogImportService;

    @PostMapping(value = "/import", consumes = "multipart/form-data")
    public CatalogImportService.ImportResult importCourses(@RequestParam("file") MultipartFile file) {
        return catalogImportService.importCsv(file);
    }
}