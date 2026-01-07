package dev.thalha.appraxis.model;

public enum Role {
    EMPLOYEE,       // Base role - everyone is an employee
    PROJECT_MANAGER, // Additional role - can review employees
    HR,             // Additional role - can initiate appraisals
    BOSS            // Additional role - can finalize appraisals
}
