package dev.thalha.appraxis.dto;

import lombok.Data;

@Data
public class PmRatingDto {
    private Long questionId;
    private Integer rating;
    private String comment;
}
