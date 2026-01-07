package dev.thalha.appraxis.controller;

import dev.thalha.appraxis.dto.BossSummaryDto;
import dev.thalha.appraxis.model.AppraisalCycle;
import dev.thalha.appraxis.service.BossService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boss")
public class BossController {

    private final BossService bossService;

    public BossController(BossService bossService) {
        this.bossService = bossService;
    }

    @GetMapping("/pending")
    public ResponseEntity<List<AppraisalCycle>> getPendingReviews() {
        return ResponseEntity.ok(bossService.getPendingReviews());
    }

    @GetMapping("/summary/{cycleId}")
    public ResponseEntity<BossSummaryDto> getSummary(@PathVariable Long cycleId) {
        return ResponseEntity.ok(bossService.getSummary(cycleId));
    }

    @PostMapping("/close/{cycleId}")
    public ResponseEntity<Void> finalizeAppraisal(@PathVariable Long cycleId) {
        bossService.finalizeAppraisal(cycleId);
        return ResponseEntity.ok().build();
    }
}
