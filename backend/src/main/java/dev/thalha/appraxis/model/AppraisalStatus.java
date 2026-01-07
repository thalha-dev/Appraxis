package dev.thalha.appraxis.model;

public enum AppraisalStatus {
    OPEN,                           // Initial state - waiting for PM assignment
    PENDING_PM_REVIEW,              // PM assigned, waiting for PM to complete review
    PENDING_BOSS_REVIEW,            // PM review done, waiting for boss final review
    CLOSED                          // Appraisal complete
}
