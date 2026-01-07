package dev.thalha.appraxis.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FeedbackViewDto {
    private Long pmRatingId;
    private String questionText;
    private String pmName;
    private Integer rating;
    private String comment;
    private String existingClarification; // null if none
}
