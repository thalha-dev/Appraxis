package dev.thalha.appraxis.repository;

import dev.thalha.appraxis.model.Clarification;
import dev.thalha.appraxis.model.PmRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClarificationRepository extends JpaRepository<Clarification, Long> {
    Optional<Clarification> findByPmRating(PmRating pmRating);
}
