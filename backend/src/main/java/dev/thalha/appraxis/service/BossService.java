package dev.thalha.appraxis.service;

import dev.thalha.appraxis.dto.BossSummaryDto;
import dev.thalha.appraxis.dto.FeedbackViewDto;
import dev.thalha.appraxis.model.AppraisalCycle;
import dev.thalha.appraxis.model.AppraisalStatus;
import dev.thalha.appraxis.repository.AppraisalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BossService {

    private final AppraisalRepository appraisalRepository;
    private final EmployeeService employeeService; // Reuse report and feedback generation

    public BossService(AppraisalRepository appraisalRepository, EmployeeService employeeService) {
        this.appraisalRepository = appraisalRepository;
        this.employeeService = employeeService;
    }

    public List<AppraisalCycle> getPendingReviews() {
        return appraisalRepository.findAll().stream()
                .filter(a -> a.getStatus() == AppraisalStatus.PENDING_BOSS_REVIEW)
                .toList(); 
    }

    public BossSummaryDto getSummary(Long cycleId) {
        AppraisalCycle cycle = appraisalRepository.findById(cycleId)
                .orElseThrow(() -> new RuntimeException("Cycle not found"));

        var reports = employeeService.getReport(cycleId);
        var clarifications = employeeService.getFeedback(cycleId);

        return new BossSummaryDto(
                cycle.getId(),
                cycle.getEmployee().getName(),
                cycle.getEmployee().getDesignation(),
                cycle.getStatus().name(),
                reports,
                clarifications
        );
    }

    @Transactional
    public void finalizeAppraisal(Long cycleId, String bossComment) {
        AppraisalCycle cycle = appraisalRepository.findById(cycleId)
                .orElseThrow(() -> new RuntimeException("Cycle not found"));

        if (cycle.getStatus() == AppraisalStatus.CLOSED) {
            throw new RuntimeException("Appraisal is already closed");
        }

        if (cycle.getStatus() != AppraisalStatus.PENDING_BOSS_REVIEW) {
            throw new RuntimeException("Appraisal is not ready for final review. Current status: " + cycle.getStatus());
        }

        cycle.setBossComment(bossComment);
        cycle.setStatus(AppraisalStatus.CLOSED);
        appraisalRepository.save(cycle);
    }
}
