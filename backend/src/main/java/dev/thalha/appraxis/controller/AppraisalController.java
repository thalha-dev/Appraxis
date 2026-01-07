package dev.thalha.appraxis.controller;

import dev.thalha.appraxis.model.AppraisalCycle;
import dev.thalha.appraxis.model.User;
import dev.thalha.appraxis.service.AppraisalService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AppraisalController {

    private final AppraisalService appraisalService;
    public AppraisalController(AppraisalService appraisalService) {
        this.appraisalService = appraisalService;
    }

    @GetMapping("/users/employees")
    public ResponseEntity<List<User>> getEmployees() {
        return ResponseEntity.ok(appraisalService.getAllEmployees());
    }

    @GetMapping("/appraisals")
    public ResponseEntity<List<AppraisalCycle>> getAllAppraisals() {
        return ResponseEntity.ok(appraisalService.getAllAppraisals());
    }

    @PostMapping("/appraisals")
    public ResponseEntity<AppraisalCycle> initiateAppraisal(@RequestBody Map<String, Object> payload, @AuthenticationPrincipal User initiator) {
        Long employeeId = Long.valueOf(payload.get("employeeId").toString());
        String year = payload.get("year").toString();
        
        // Ensure initiator is fetched correctly. If @AuthenticationPrincipal works with User entity directly, great.
        // Otherwise we might need to fetch by username if initiator is UserDetails.
        // Assuming custom UserDetails or direct User mapping for now.
        
        return ResponseEntity.ok(appraisalService.initiateAppraisal(employeeId, year, initiator));
    }
}
