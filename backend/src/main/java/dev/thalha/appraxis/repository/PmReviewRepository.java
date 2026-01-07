package dev.thalha.appraxis.repository;

import dev.thalha.appraxis.model.AppraisalCycle;
import dev.thalha.appraxis.model.PmReview;
import dev.thalha.appraxis.model.ReviewStatus;
import dev.thalha.appraxis.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PmReviewRepository extends JpaRepository<PmReview, Long> {
    List<PmReview> findByReviewerAndStatus(User reviewer, ReviewStatus status);
    Optional<PmReview> findByAppraisalCycleAndReviewer(AppraisalCycle appraisalCycle, User reviewer);
}
