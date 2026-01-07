package dev.thalha.appraxis.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "clarifications")
public class Clarification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pm_rating_id", nullable = false)
    private PmRating pmRating;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String employeeReply;

    private LocalDateTime createdAt = LocalDateTime.now();
}
