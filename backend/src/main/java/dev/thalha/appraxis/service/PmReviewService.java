package dev.thalha.appraxis.service;

import dev.thalha.appraxis.dto.PmRatingDto;
import dev.thalha.appraxis.model.*;
import dev.thalha.appraxis.repository.AppraisalRepository;
import dev.thalha.appraxis.repository.PmRatingRepository;
import dev.thalha.appraxis.repository.PmReviewRepository;
import dev.thalha.appraxis.repository.QuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PmReviewService {

    private final PmReviewRepository pmReviewRepository;
    private final PmRatingRepository pmRatingRepository;
    private final QuestionRepository questionRepository;
    private final AppraisalRepository appraisalRepository;

    public PmReviewService(PmReviewRepository pmReviewRepository, PmRatingRepository pmRatingRepository, 
                           QuestionRepository questionRepository, AppraisalRepository appraisalRepository) {
        this.pmReviewRepository = pmReviewRepository;
        this.pmRatingRepository = pmRatingRepository;
        this.questionRepository = questionRepository;
        this.appraisalRepository = appraisalRepository;
    }

    public List<PmReview> getPendingReviews(User reviewer) {
        return pmReviewRepository.findByReviewerAndStatus(reviewer, ReviewStatus.PENDING);
    }

    public List<Question> getActiveQuestions() {
        return questionRepository.findByActiveTrue();
    }

    @Transactional
    public void submitReview(Long reviewId, List<PmRatingDto> ratings) {
        PmReview review = pmReviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (review.getStatus() != ReviewStatus.PENDING) {
            throw new RuntimeException("Review is already submitted");
        }

        for (PmRatingDto dto : ratings) {
            Question question = questionRepository.findById(dto.getQuestionId())
                    .orElseThrow(() -> new RuntimeException("Question not found"));

            PmRating rating = new PmRating();
            rating.setPmReview(review);
            rating.setQuestion(question);
            rating.setRating(dto.getRating());
            rating.setComment(dto.getComment());

            pmRatingRepository.save(rating);
        }

        review.setStatus(ReviewStatus.SUBMITTED);
        review.setFeedbackDate(LocalDateTime.now());
        pmReviewRepository.save(review);

        // Update appraisal cycle status to PENDING_BOSS_REVIEW
        AppraisalCycle cycle = review.getAppraisalCycle();
        cycle.setStatus(AppraisalStatus.PENDING_BOSS_REVIEW);
        appraisalRepository.save(cycle);
    }
}
