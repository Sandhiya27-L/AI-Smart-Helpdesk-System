package com.helpdesk.service;

import com.helpdesk.dto.NlpQueryRequest;
import com.helpdesk.dto.NlpQueryResponse;
import com.helpdesk.entity.*;
import com.helpdesk.enums.Priority;
import com.helpdesk.enums.TicketStatus;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

/**
 * Built-in NLP Engine — no external API required.
 *
 * Uses keyword scoring + weighted pattern matching to:
 *  - Detect intent from natural language
 *  - Classify into IT categories (Hardware, Software, Network, etc.)
 *  - Assign priority (LOW / MEDIUM / HIGH / CRITICAL)
 *  - Return step-by-step solution from knowledge base
 *  - Calculate confidence score (0.0 – 1.0)
 *  - Auto-escalate to IT staff when confidence < threshold
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NlpService {

    @Value("${nlp.confidence.escalation-threshold:0.50}")
    private double escalationThreshold;

    private final UserRepository       userRepository;
    private final TicketRepository     ticketRepository;
    private final CategoryRepository   categoryRepository;
    private final AiResponseRepository aiResponseRepository;
    private final KnowledgeBaseRepository kbRepository;

    // ─────────────────────────────────────────────────────────────────────────
    //  NLP Knowledge Base — keyword → {category, priority, solution, score}
    // ─────────────────────────────────────────────────────────────────────────
    private static final List<NlpRule> RULES = List.of(

        new NlpRule(
            List.of("wifi","wi-fi","wireless","internet","network","connection","connectivity",
                    "not connecting","no internet","slow internet","ethernet","lan","vpn","router"),
            "Network", "HIGH", 0.82,
            "Network Connectivity Issue",
            "1. Turn WiFi off and back on from your device settings.\n" +
            "2. Forget the network and reconnect with the correct password.\n" +
            "3. Restart your router — unplug for 30 seconds, then reconnect.\n" +
            "4. Run Windows Network Troubleshooter (Settings → System → Troubleshoot).\n" +
            "5. Flush DNS: open Command Prompt and run 'ipconfig /flushdns'.\n" +
            "6. Update your network adapter drivers from Device Manager.\n" +
            "7. If the problem persists, contact IT support."
        ),

        new NlpRule(
            List.of("password","forgot password","reset password","locked out","can't login",
                    "cannot login","login failed","account locked","credentials","authentication failed"),
            "Security", "HIGH", 0.88,
            "Password / Login Issue",
            "1. Go to the login page and click 'Forgot Password'.\n" +
            "2. Enter your registered work email address.\n" +
            "3. Check your inbox (and spam folder) for the reset link.\n" +
            "4. Click the link and set a new password (min 8 characters, 1 number, 1 symbol).\n" +
            "5. If your account is locked after too many attempts, contact IT Admin.\n" +
            "6. For MFA issues, contact the IT helpdesk immediately."
        ),

        new NlpRule(
            List.of("printer","print","printing","scanner","scan","scanning","spooler",
                    "offline printer","paper jam","ink","toner","driver printer"),
            "Printer", "LOW", 0.85,
            "Printer / Scanner Issue",
            "1. Check that the printer is powered on and shows 'Ready' status.\n" +
            "2. Open 'Devices and Printers', right-click your printer → See what's printing.\n" +
            "3. Cancel all queued print jobs.\n" +
            "4. Restart the Print Spooler: open services.msc → find Print Spooler → Restart.\n" +
            "5. Remove the printer from your PC and re-add it.\n" +
            "6. Download and reinstall the latest drivers from the manufacturer's website.\n" +
            "7. Try printing a test page from the printer itself."
        ),

        new NlpRule(
            List.of("slow","freeze","frozen","hang","hanging","lagging","lag","unresponsive",
                    "performance","taking long","computer slow","laptop slow","pc slow"),
            "Hardware", "MEDIUM", 0.80,
            "Slow / Unresponsive System",
            "1. Save your work and restart the computer.\n" +
            "2. Open Task Manager (Ctrl+Shift+Esc) and close high-CPU/RAM processes.\n" +
            "3. Run Disk Cleanup: search 'Disk Cleanup' → select C: drive → clean system files.\n" +
            "4. Disable startup programs: Task Manager → Startup tab.\n" +
            "5. Run a full antivirus/malware scan.\n" +
            "6. Check for Windows Updates and install all pending updates.\n" +
            "7. If RAM usage is consistently above 90%, request a RAM upgrade from IT."
        ),

        new NlpRule(
            List.of("crash","blue screen","bsod","error","not working","broken","failed",
                    "application crash","software crash","program crash","unexpected error"),
            "Software", "HIGH", 0.78,
            "Application / System Crash",
            "1. Note the exact error message or error code.\n" +
            "2. Restart the application or service.\n" +
            "3. Restart your computer.\n" +
            "4. Check the Windows Event Viewer for error logs.\n" +
            "5. Repair or reinstall the affected application.\n" +
            "6. Run 'sfc /scannow' in Command Prompt (as Administrator) to fix system files.\n" +
            "7. If BSOD occurs repeatedly, submit a ticket with the error code for IT analysis."
        ),

        new NlpRule(
            List.of("email","outlook","mail","inbox","smtp","imap","calendar","teams","office365",
                    "not receiving email","can't send email","email not working","mailbox full"),
            "Email", "MEDIUM", 0.83,
            "Email / Communication Issue",
            "1. Check your internet connection.\n" +
            "2. Verify that Outlook/Mail is not in Offline mode (check the status bar).\n" +
            "3. Check your mailbox storage quota — a full mailbox blocks incoming mail.\n" +
            "4. Delete or archive old emails to free up space.\n" +
            "5. Remove and re-add your email account in Outlook.\n" +
            "6. Disable antivirus email scanning temporarily to test.\n" +
            "7. Contact IT if the issue involves the mail server itself."
        ),

        new NlpRule(
            List.of("install","installation","software install","app install","download software",
                    "install program","license","activate","activation","setup"),
            "Software", "LOW", 0.75,
            "Software Installation Request",
            "1. Check if you have administrator privileges on your machine.\n" +
            "2. Download the software only from the official/company-approved source.\n" +
            "3. Right-click the installer → Run as Administrator.\n" +
            "4. Temporarily disable antivirus during installation if it blocks setup.\n" +
            "5. If you require a license key, submit a ticket through IT portal.\n" +
            "6. For restricted software, approval from your manager may be required."
        ),

        new NlpRule(
            List.of("monitor","screen","display","blank screen","no display","flickering",
                    "resolution","projector","hdmi","vga","second screen","dual monitor"),
            "Hardware", "MEDIUM", 0.81,
            "Monitor / Display Issue",
            "1. Check that the monitor power cable and video cable (HDMI/VGA/DP) are secure.\n" +
            "2. Press Windows + P to cycle display modes (PC screen only / Extend / Duplicate).\n" +
            "3. Right-click desktop → Display Settings → rearrange or re-detect the display.\n" +
            "4. Update your graphics card driver from Device Manager.\n" +
            "5. Test with a different cable or a different monitor to isolate the issue.\n" +
            "6. If screen is physically damaged, log a hardware replacement request."
        ),

        new NlpRule(
            List.of("access","permission","denied","unauthorized","forbidden","can't open",
                    "cannot access","access denied","folder access","file access","share access"),
            "Access", "HIGH", 0.84,
            "Access / Permission Issue",
            "1. Confirm you are logged in with your correct work credentials.\n" +
            "2. Try logging out and logging back in to refresh your permissions.\n" +
            "3. If accessing a shared folder, ensure the path is correct (\\\\server\\share).\n" +
            "4. Contact your line manager to confirm you should have access to this resource.\n" +
            "5. Submit an Access Request ticket to IT with the resource name and business justification.\n" +
            "6. IT Admin will grant the necessary permissions within 1 business day."
        ),

        new NlpRule(
            List.of("virus","malware","ransomware","hack","hacked","phishing","suspicious email",
                    "spam","data breach","security threat","infected"),
            "Security", "CRITICAL", 0.92,
            "Security Incident",
            "IMMEDIATE ACTION REQUIRED:\n" +
            "1. Disconnect your computer from the network immediately (unplug LAN / turn off WiFi).\n" +
            "2. Do NOT turn off the computer — leave it running for forensic analysis.\n" +
            "3. Call the IT Security team immediately on the emergency hotline.\n" +
            "4. Do not click any more links or open any more attachments.\n" +
            "5. Do not attempt to clean the infection yourself.\n" +
            "6. IT Security will isolate and remediate the affected machine.\n" +
            "7. Change all passwords from a DIFFERENT, clean device."
        ),

        new NlpRule(
            List.of("keyboard","mouse","usb","headset","microphone","webcam","camera",
                    "headphone","peripheral","device not recognized","device not found"),
            "Hardware", "LOW", 0.79,
            "Peripheral Device Issue",
            "1. Unplug the device and reconnect to a different USB port.\n" +
            "2. Restart your computer with the device plugged in.\n" +
            "3. Open Device Manager and check for yellow warning icons.\n" +
            "4. Right-click the device → Update Driver.\n" +
            "5. Try the device on another computer to confirm if it is faulty.\n" +
            "6. If the device is faulty, submit a hardware replacement request to IT."
        ),

        new NlpRule(
            List.of("backup","restore","data loss","lost file","deleted file","recovery",
                    "restore file","version history","onedrive","cloud backup"),
            "Software", "HIGH", 0.77,
            "Data Backup / Recovery",
            "1. Check the Recycle Bin for accidentally deleted files.\n" +
            "2. Right-click the folder → Properties → Previous Versions tab.\n" +
            "3. Check OneDrive / SharePoint version history for cloud-synced files.\n" +
            "4. Do not save new data to the affected drive (may overwrite recoverable data).\n" +
            "5. Submit a Data Recovery ticket to IT immediately with the file path and date.\n" +
            "6. IT will attempt to restore from the last backup snapshot."
        )
    );

    // ─────────────────────────────────────────────────────────────────────────
    //  Public API
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public NlpQueryResponse processQuery(NlpQueryRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        NlpAnalysis analysis = analyze(request.getQuery());
        boolean shouldEscalate = analysis.confidence < escalationThreshold;

        // Persist NLP result
        AiResponse record = AiResponse.builder()
                .userQuery(request.getQuery())
                .detectedIntent(analysis.intent)
                .detectedCategory(analysis.category)
                .detectedPriority(analysis.priority)
                .suggestedSolution(analysis.solution)
                .confidenceScore(BigDecimal.valueOf(analysis.confidence))
                .escalatedToHuman(shouldEscalate)
                .build();

        String ticketNumber = null;

        if (request.isCreateTicket() || shouldEscalate) {
            Ticket ticket = createTicketFromAnalysis(user, request.getQuery(), analysis);
            record.setTicket(ticket);
            ticketNumber = ticket.getTicketNumber();
        }

        aiResponseRepository.save(record);

        String message = shouldEscalate
                ? "Your issue has been escalated to our IT team. Ticket #" + ticketNumber + " created."
                : "Here is the suggested solution for your issue:";

        return NlpQueryResponse.builder()
                .intent(analysis.intent)
                .category(analysis.category)
                .priority(analysis.priority)
                .solution(analysis.solution)
                .confidenceScore(analysis.confidence)
                .escalatedToHuman(shouldEscalate)
                .ticketNumber(ticketNumber)
                .message(message)
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Core NLP Analyzer — keyword scoring
    // ─────────────────────────────────────────────────────────────────────────

    private NlpAnalysis analyze(String query) {
        String normalized = query.toLowerCase().replaceAll("[^a-z0-9 ]", " ");
        String[] words = normalized.split("\\s+");
        Set<String> wordSet = new HashSet<>(Arrays.asList(words));

        NlpRule bestRule = null;
        int bestMatchCount = 0;

        for (NlpRule rule : RULES) {
            int matchCount = 0;
            for (String keyword : rule.keywords) {
                if (normalized.contains(keyword)) matchCount += 2;   // phrase match
                else {
                    for (String w : wordSet) {
                        if (keyword.contains(w) || w.contains(keyword)) matchCount++;
                    }
                }
            }
            if (matchCount > bestMatchCount) {
                bestMatchCount = matchCount;
                bestRule = rule;
            }
        }

        // Confidence formula: scale match count relative to keyword size
        if (bestRule == null || bestMatchCount == 0) {
            return new NlpAnalysis(
                    "General IT Support Request",
                    "Other", "MEDIUM",
                    "1. Please provide more details about your issue.\n" +
                    "2. Include any error messages you see.\n" +
                    "3. Describe what you were doing when the problem occurred.\n" +
                    "4. Our IT team will review and respond within 1 business day.",
                    0.25
            );
        }

        double rawConfidence = Math.min(1.0, (double) bestMatchCount / (bestRule.keywords.size() * 0.8));
        double finalConfidence = (rawConfidence * 0.7) + (bestRule.baseConfidence * 0.3);
        finalConfidence = Math.min(0.97, finalConfidence);

        // Check KB for even more specific solution
        String solution = findKbSolution(query, bestRule.category, bestRule.solution);

        return new NlpAnalysis(
                bestRule.intent,
                bestRule.category,
                bestRule.priority,
                solution,
                Math.round(finalConfidence * 100.0) / 100.0
        );
    }

    /** Try to find a more specific answer from the knowledge base first. */
    private String findKbSolution(String query, String category, String defaultSolution) {
        try {
            List<KnowledgeBase> results = kbRepository.search(query.length() > 50
                    ? query.substring(0, 50) : query);
            if (!results.isEmpty()) {
                results.get(0).setViewCount(results.get(0).getViewCount() + 1);
                kbRepository.save(results.get(0));
                return results.get(0).getContent();
            }
        } catch (Exception e) {
            log.debug("KB lookup skipped: {}", e.getMessage());
        }
        return defaultSolution;
    }

    private Ticket createTicketFromAnalysis(User user, String query, NlpAnalysis analysis) {
        Category category = categoryRepository.findByNameIgnoreCase(analysis.category)
                .orElse(categoryRepository.findByNameIgnoreCase("Other").orElse(null));

        Priority priority;
        try { priority = Priority.valueOf(analysis.priority); }
        catch (Exception e) { priority = Priority.MEDIUM; }

        String title = analysis.intent.length() > 200
                ? analysis.intent.substring(0, 200) : analysis.intent;

        Ticket ticket = Ticket.builder()
                .ticketNumber("TKT-" + System.currentTimeMillis())
                .title(title)
                .description(query)
                .status(TicketStatus.OPEN)
                .priority(priority)
                .category(category)
                .createdBy(user)
                .aiSuggestedSolution(analysis.solution)
                .aiConfidenceScore(BigDecimal.valueOf(analysis.confidence))
                .build();

        return ticketRepository.save(ticket);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Inner types
    // ─────────────────────────────────────────────────────────────────────────

    private record NlpAnalysis(
        String intent, String category, String priority,
        String solution, double confidence) {}

    private record NlpRule(
        List<String> keywords, String category, String priority,
        double baseConfidence, String intent, String solution) {}
}
