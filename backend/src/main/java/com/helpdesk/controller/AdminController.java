package com.helpdesk.controller;

import com.helpdesk.entity.User;
import com.helpdesk.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> analytics() {
        return ResponseEntity.ok(adminService.getAnalytics());
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> users() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/staff")
    public ResponseEntity<List<User>> staff() {
        return ResponseEntity.ok(adminService.getItStaff());
    }

    @PatchMapping("/users/{id}/toggle")
    public ResponseEntity<String> toggleUser(@PathVariable Long id) {
        adminService.toggleUserStatus(id);
        return ResponseEntity.ok("User status updated.");
    }
}
