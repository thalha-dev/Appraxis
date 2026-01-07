package dev.thalha.appraxis.repository;

import dev.thalha.appraxis.model.AppraisalCycle;
import dev.thalha.appraxis.model.SelfAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SelfAssessmentRepository extends JpaRepository<SelfAssessment, Long> {
    List<SelfAssessment> findByAppraisalCycle(AppraisalCycle appraisalCycle);
}
