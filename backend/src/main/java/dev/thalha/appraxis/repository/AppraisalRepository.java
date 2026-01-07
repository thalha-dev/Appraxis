package dev.thalha.appraxis.repository;

import dev.thalha.appraxis.model.AppraisalCycle;
import dev.thalha.appraxis.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppraisalRepository extends JpaRepository<AppraisalCycle, Long> {
    Optional<AppraisalCycle> findByEmployeeAndYear(User employee, String year);
    List<AppraisalCycle> findByEmployeeOrderByYearDesc(User employee);
}
