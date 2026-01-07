package dev.thalha.appraxis.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReportDto {
    private String questionText;
    private String category;
    private Double pmAverageRating;
    private Integer selfRating;
}
