package com.hometuitions.backend.common.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthCheckController {

    @RequestMapping(
        value = {"/health", "/actuator/health"},
        method = {RequestMethod.GET, RequestMethod.HEAD, RequestMethod.OPTIONS}
    )
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }
}
