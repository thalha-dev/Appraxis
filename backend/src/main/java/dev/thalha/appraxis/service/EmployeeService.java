package dev.thalha.appraxis.service;

import dev.thalha.appraxis.dto.RatingSubmissionDto;
import dev.thalha.appraxis.dto.ReportDto;
import dev.thalha.appraxis.model.*;
import dev.thalha.appraxis.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmployeeService {

    private final AppraisalRepository appraisalRepository;
    private final PmReviewRepository pmReviewRepository;
    private final PmRatingRepository pmRatingRepository;
    private final SelfAssessmentRepository selfAssessmentRepository;
    private final QuestionRepository questionRepository;

    public EmployeeService(AppraisalRepository appraisalRepository, 
                           PmReviewRepository pmReviewRepository, 
                           PmRatingRepository pmRatingRepository, 
                           SelfAssessmentRepository selfAssessmentRepository, 
                           QuestionRepository questionRepository) {
        this.appraisalRepository = appraisalRepository;
        this.pmReviewRepository = pmReviewRepository;
        this.pmRatingRepository = pmRatingRepository;
        this.selfAssessmentRepository = selfAssessmentRepository;
        this.questionRepository = questionRepository;
    }

    public AppraisalCycle getActiveCycle(User employee) {
        String currentYear = String.valueOf(LocalDate.now().getYear());
        return appraisalRepository.findByEmployeeAndYear(employee, currentYear)
                .orElse(null);
    }

    public List<ReportDto> getReport(Long cycleId) {
        AppraisalCycle cycle = appraisalRepository.findById(cycleId)
                .orElseThrow(() -> new RuntimeException("Cycle not found"));

        // Get Self Assessments
        List<SelfAssessment> selfAssessments = selfAssessmentRepository.findByAppraisalCycle(cycle);
        Map<Long, Integer> selfRatingsMap = new HashMap<>();
        for (SelfAssessment sa : selfAssessments) {
            selfRatingsMap.put(sa.getQuestion().getId(), sa.getRating());
        }

        // Get PM Ratings
        List<PmReview> allReviews = pmReviewRepository.findAll(); 
        List<PmReview> cycleReviews = allReviews.stream()
                .filter(r -> r.getAppraisalCycle().getId().equals(cycleId) && r.getStatus() == ReviewStatus.SUBMITTED)
                .toList();

        Map<Long, List<Integer>> pmRatingsMap = new HashMap<>();
        for (PmReview review : cycleReviews) {
            List<PmRating> ratings = pmRatingRepository.findAll().stream()
                    .filter(r -> r.getPmReview().getId().equals(review.getId()))
                    .toList();
            
            for (PmRating r : ratings) {
                pmRatingsMap.computeIfAbsent(r.getQuestion().getId(), k -> new ArrayList<>()).add(r.getRating());
            }
        }

        List<Question> questions = questionRepository.findAll();
        List<ReportDto> report = new ArrayList<>();

        for (Question q : questions) {
            Integer selfRating = selfRatingsMap.get(q.getId());
            
            List<Integer> pmSpecificRatings = pmRatingsMap.getOrDefault(q.getId(), new ArrayList<>());
            Double avg = pmSpecificRatings.stream().mapToInt(Integer::intValue).average().orElse(0.0);
            
            report.add(new ReportDto(q.getText(), q.getCategory(), avg, selfRating));
        }

        return report;
    }

    @Transactional
    public void submitSelfAssessment(Long cycleId, List<RatingSubmissionDto> submissions) {
        AppraisalCycle cycle = appraisalRepository.findById(cycleId)
                .orElseThrow(() -> new RuntimeException("Cycle not found"));

        for (RatingSubmissionDto dto : submissions) {
            Question question = questionRepository.findById(dto.getQuestionId())
                    .orElseThrow(() -> new RuntimeException("Question not found"));

            SelfAssessment assessment = new SelfAssessment();
            assessment.setAppraisalCycle(cycle);
            assessment.setQuestion(question);
            assessment.setRating(dto.getRating());
            assessment.setComment(dto.getComment());

            selfAssessmentRepository.save(assessment);
        }
    }
}
