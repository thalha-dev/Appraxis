package dev.thalha.appraxis.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BossSummaryDto {
    private Long cycleId;
    private String employeeName;
    private String designation;
    private String status;
    private List<ReportDto> reports;
    private List<FeedbackViewDto> clarifications;
}
