package dev.thalha.appraxis.controller;

import dev.thalha.appraxis.dto.FeedbackViewDto;
import dev.thalha.appraxis.dto.PmRatingDto;
import dev.thalha.appraxis.model.PmReview;
import dev.thalha.appraxis.model.Question;
import dev.thalha.appraxis.model.User;
import dev.thalha.appraxis.service.PmReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class PmController {

    private final PmReviewService pmReviewService;

    public PmController(PmReviewService pmReviewService) {
        this.pmReviewService = pmReviewService;
    }

    @GetMapping("/pm/pending-reviews")
    public ResponseEntity<List<PmReview>> getPendingReviews(@AuthenticationPrincipal User reviewer) {
        return ResponseEntity.ok(pmReviewService.getPendingReviews(reviewer));
    }

    @GetMapping("/pm/submitted-reviews")
    public ResponseEntity<List<PmReview>> getSubmittedReviews(@AuthenticationPrincipal User reviewer) {
        return ResponseEntity.ok(pmReviewService.getSubmittedReviews(reviewer));
    }

    @GetMapping("/pm/reviews/{reviewId}/clarifications")
    public ResponseEntity<List<FeedbackViewDto>> getReviewClarifications(@PathVariable Long reviewId) {
        return ResponseEntity.ok(pmReviewService.getReviewWithClarifications(reviewId));
    }

    @GetMapping("/questions")
    public ResponseEntity<List<Question>> getQuestions() {
        return ResponseEntity.ok(pmReviewService.getActiveQuestions());
    }

    @PostMapping("/pm/reviews/{reviewId}/submit")
    public ResponseEntity<Void> submitReview(@PathVariable Long reviewId, @RequestBody List<PmRatingDto> ratings) {
        pmReviewService.submitReview(reviewId, ratings);
        return ResponseEntity.ok().build();
    }
}
