package dev.thalha.appraxis.repository;

import dev.thalha.appraxis.model.PmRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PmRatingRepository extends JpaRepository<PmRating, Long> {
}
