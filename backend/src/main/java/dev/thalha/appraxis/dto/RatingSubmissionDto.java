package dev.thalha.appraxis.dto;

import lombok.Data;

@Data
public class RatingSubmissionDto {
    private Long questionId;
    private Integer rating;
    private String comment;
}
