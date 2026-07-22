package com.foodorder.orderservice.controller;

import com.foodorder.orderservice.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST endpoints for OTP-based authentication.
 *
 * POST /api/otp/send   — generates and sends OTP to given mobile
 * POST /api/otp/verify — verifies the OTP submitted by the user
 *
 * Both endpoints are open (no JWT required) — configured in SecurityConfig.
 */
@RestController
@RequestMapping("/api/otp")
@CrossOrigin(origins = "*")
public class OtpController {

    @Autowired
    private OtpService otpService;

    /**
     * Request body: { "mobile": "9876543210", "role": "CUSTOMER" }
     */
    @PostMapping("/send")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String mobile = body.get("mobile");
        if (mobile == null || mobile.trim().length() != 10) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Invalid mobile number. Must be 10 digits."));
        }
        try {
            String otp = otpService.sendOtp(mobile.trim());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "OTP sent successfully to +91" + mobile,
                    "devOtp", otp
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "Failed to send OTP: " + e.getMessage()));
        }
    }

    /**
     * Request body: { "mobile": "9876543210", "otp": "1234" }
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String mobile = body.get("mobile");
        String otp = body.get("otp");

        if (mobile == null || otp == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Mobile and OTP are required."));
        }
        boolean valid = otpService.verifyOtp(mobile.trim(), otp.trim());
        if (valid) {
            return ResponseEntity.ok(Map.of("success", true, "message", "OTP verified successfully."));
        } else {
            return ResponseEntity.status(401)
                    .body(Map.of("success", false, "message", "Invalid or expired OTP."));
        }
    }
}
