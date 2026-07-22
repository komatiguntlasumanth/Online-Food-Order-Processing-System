package com.foodorder.orderservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

/**
 * OtpService — generates a 4-digit OTP, sends it via Fast2SMS (free Indian SMS gateway),
 * and provides verification. OTPs expire after 5 minutes.
 *
 * Sign up at https://www.fast2sms.com and paste your API key in application.yml:
 *   fast2sms:
 *     api:
 *       key: YOUR_API_KEY_HERE
 */
@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private static final long OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

    @Value("${fast2sms.api.key:DEMO_KEY}")
    private String fast2smsApiKey;

    // Thread-safe in-memory store: mobile → { otp, expiry }
    private final Map<String, OtpRecord> otpStore = new ConcurrentHashMap<>();

    @Value("${twilio.account.sid:}")
    private String twilioAccountSid;

    @Value("${twilio.auth.token:}")
    private String twilioAuthToken;

    @Value("${twilio.phone.number:}")
    private String twilioPhoneNumber;

    // ──────────────── Send OTP ────────────────────────────────────────────────

    /**
     * Generates an OTP for the given mobile number, stores it, and dispatches it.
     *
     * @param mobile 10-digit Indian mobile number (without +91)
     * @return the generated OTP
     */
    public String sendOtp(String mobile) {
        String otp = generateOtp();
        otpStore.put(mobile, new OtpRecord(otp, System.currentTimeMillis() + OTP_TTL_MS));
        log.info("[OTP] Generated OTP {} for mobile {}", otp, mobile);

        if (twilioAccountSid != null && !twilioAccountSid.isEmpty() && !"DEMO".equalsIgnoreCase(twilioAccountSid)) {
            dispatchViaTwilio(mobile, otp);
        } else if (fast2smsApiKey != null && !fast2smsApiKey.isEmpty() && !"DEMO_KEY".equals(fast2smsApiKey)) {
            dispatchViaFast2Sms(mobile, otp);
        } else {
            log.warn("[OTP] No SMS service configured. OTP for {} is: {} (console only)", mobile, otp);
        }
        return otp;
    }

    // ──────────────── Verify OTP ──────────────────────────────────────────────

    /**
     * Verifies the OTP for the given mobile number.
     *
     * @return true if OTP is valid and not expired, false otherwise
     */
    public boolean verifyOtp(String mobile, String otp) {
        OtpRecord record = otpStore.get(mobile);
        if (record == null) {
            log.warn("[OTP] No OTP found for mobile {}", mobile);
            return false;
        }
        if (System.currentTimeMillis() > record.expiry()) {
            otpStore.remove(mobile);
            log.warn("[OTP] OTP expired for mobile {}", mobile);
            return false;
        }
        boolean valid = record.otp().equals(otp.trim());
        if (valid) {
            otpStore.remove(mobile); // one-time use
            log.info("[OTP] OTP verified successfully for mobile {}", mobile);
        } else {
            log.warn("[OTP] Invalid OTP attempt for mobile {}", mobile);
        }
        return valid;
    }

    // ──────────────── Helpers ─────────────────────────────────────────────────

    private String generateOtp() {
        return String.format("%04d", new Random().nextInt(10000));
    }

    /**
     * Calls the Fast2SMS Quick SMS API.
     */
    private void dispatchViaFast2Sms(String mobile, String otp) {
        try {
            String message = "Your SwiggyExpress OTP is " + otp + ". Valid for 5 minutes. Do not share it with anyone.";
            String url = "https://www.fast2sms.com/dev/bulkV2"
                    + "?authorization=" + fast2smsApiKey
                    + "&route=q"
                    + "&message=" + java.net.URLEncoder.encode(message, "UTF-8")
                    + "&flash=0"
                    + "&numbers=" + mobile;

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("cache-control", "no-cache")
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            log.info("[Fast2SMS] Response for {}: status={} body={}", mobile, response.statusCode(), response.body());

            if (response.statusCode() != 200) {
                log.error("[Fast2SMS] Failed to send SMS. Status: {}", response.statusCode());
            }
        } catch (Exception e) {
            log.error("[Fast2SMS] Exception while sending SMS to {}: {}", mobile, e.getMessage());
        }
    }

    /**
     * Dispatches OTP SMS using Twilio's standard REST API.
     * Works completely free for verified recipient numbers in Twilio accounts.
     */
    private void dispatchViaTwilio(String mobile, String otp) {
        try {
            // Normalize phone number to E.164 format (Indian prefix +91)
            String formattedMobile = mobile.startsWith("+") ? mobile : "+91" + mobile;
            String url = "https://api.twilio.com/2010-04-01/Accounts/" + twilioAccountSid + "/Messages.json";

            String requestBody = "To=" + java.net.URLEncoder.encode(formattedMobile, "UTF-8")
                    + "&From=" + java.net.URLEncoder.encode(twilioPhoneNumber, "UTF-8")
                    + "&Body=" + java.net.URLEncoder.encode("Your SwiggyExpress OTP is " + otp + ". Valid for 5 mins.", "UTF-8");

            // Build Basic Auth credentials
            String auth = twilioAccountSid + ":" + twilioAuthToken;
            String encodedAuth = java.util.Base64.getEncoder().encodeToString(auth.getBytes("UTF-8"));

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Authorization", "Basic " + encodedAuth)
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            log.info("[Twilio] Response for {}: status={} body={}", mobile, response.statusCode(), response.body());

            if (response.statusCode() != 201) {
                log.error("[Twilio] Failed to send SMS. Status: {}", response.statusCode());
            }
        } catch (Exception e) {
            log.error("[Twilio] Exception while sending SMS to {}: {}", mobile, e.getMessage());
        }
    }

    // ──────────────── Inner record ────────────────────────────────────────────

    private record OtpRecord(String otp, long expiry) {}
}
