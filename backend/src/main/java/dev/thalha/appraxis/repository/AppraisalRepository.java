package dev.thalha.appraxis.repository;

import dev.thalha.appraxis.model.AppraisalCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppraisalRepository extends JpaRepository<AppraisalCycle, Long> {
}
