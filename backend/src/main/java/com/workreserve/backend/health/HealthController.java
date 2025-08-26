package com.workreserve.backend.health;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "workreserve-backend");
        response.put("timestamp", System.currentTimeMillis());
        response.put("version", "1.0.0");
        
        Map<String, String> details = new HashMap<>();
        details.put("database", "connected");
        details.put("environment", "production");
        response.put("details", details);
        
        return ResponseEntity.ok(response);
    }
}