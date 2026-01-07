package dev.thalha.appraxis.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "appraisal_cycles")
public class AppraisalCycle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    private User employee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hr_initiator_id", nullable = false)
    private User hrInitiator;

    @Column(nullable = false)
    private LocalDate startDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppraisalStatus status;

    @Column(nullable = false)
    private String year;

    public AppraisalCycle() {
    }

    public AppraisalCycle(User employee, User hrInitiator, LocalDate startDate, AppraisalStatus status, String year) {
        this.employee = employee;
        this.hrInitiator = hrInitiator;
        this.startDate = startDate;
        this.status = status;
        this.year = year;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getEmployee() {
        return employee;
    }

    public void setEmployee(User employee) {
        this.employee = employee;
    }

    public User getHrInitiator() {
        return hrInitiator;
    }

    public void setHrInitiator(User hrInitiator) {
        this.hrInitiator = hrInitiator;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public AppraisalStatus getStatus() {
        return status;
    }

    public void setStatus(AppraisalStatus status) {
        this.status = status;
    }

    public String getYear() {
        return year;
    }

    public void setYear(String year) {
        this.year = year;
    }
}
