package dev.thalha.appraxis.controller;

import dev.thalha.appraxis.dto.RatingSubmissionDto;
import dev.thalha.appraxis.dto.ReportDto;
import dev.thalha.appraxis.model.AppraisalCycle;
import dev.thalha.appraxis.model.User;
import dev.thalha.appraxis.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employee")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping("/active-cycle")
    public ResponseEntity<AppraisalCycle> getActiveCycle(@AuthenticationPrincipal User employee) {
        return ResponseEntity.ok(employeeService.getActiveCycle(employee));
    }

    @GetMapping("/report/{cycleId}")
    public ResponseEntity<List<ReportDto>> getReport(@PathVariable Long cycleId) {
        return ResponseEntity.ok(employeeService.getReport(cycleId));
    }

    @PostMapping("/self-assessment/{cycleId}")
    public ResponseEntity<Void> submitSelfAssessment(@PathVariable Long cycleId, @RequestBody List<RatingSubmissionDto> submissions) {
        employeeService.submitSelfAssessment(cycleId, submissions);
        return ResponseEntity.ok().build();
    }
}
