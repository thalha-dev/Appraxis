package dev.thalha.appraxis.service;

import dev.thalha.appraxis.model.AppraisalCycle;
import dev.thalha.appraxis.model.AppraisalStatus;
import dev.thalha.appraxis.model.Role;
import dev.thalha.appraxis.model.User;
import dev.thalha.appraxis.repository.AppraisalRepository;
import dev.thalha.appraxis.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AppraisalService {


    private final AppraisalRepository appraisalRepository;
    private final UserRepository userRepository;
    private final dev.thalha.appraxis.repository.PmReviewRepository pmReviewRepository;

    public AppraisalService(AppraisalRepository appraisalRepository, UserRepository userRepository, dev.thalha.appraxis.repository.PmReviewRepository pmReviewRepository) {
        this.appraisalRepository = appraisalRepository;
        this.userRepository = userRepository;
        this.pmReviewRepository = pmReviewRepository;
    }

    public List<User> getAllEmployees() {
        // Get all users with EMPLOYEE role, but exclude those who also have BOSS role
        return userRepository.findByRole(Role.EMPLOYEE).stream()
                .filter(user -> !user.hasRole(Role.BOSS))
                .toList();
    }
    
    public List<User> getAllPms() {
        return userRepository.findByRole(Role.PROJECT_MANAGER);
    }

    public List<AppraisalCycle> getAllAppraisals() {
        return appraisalRepository.findAll();
    }

    public AppraisalCycle initiateAppraisal(Long employeeId, String year, User initiator) {
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (!employee.hasRole(Role.EMPLOYEE)) {
            throw new RuntimeException("Can only initiate appraisal for employees");
        }

        // Check for existing appraisal for same employee and year
        if (appraisalRepository.findByEmployeeAndYear(employee, year).isPresent()) {
            throw new RuntimeException("An appraisal for this employee already exists for year " + year);
        }

        AppraisalCycle appraisal = new AppraisalCycle();
        appraisal.setEmployee(employee);
        appraisal.setHrInitiator(initiator);
        appraisal.setStartDate(LocalDate.now());
        appraisal.setStatus(AppraisalStatus.OPEN);
        appraisal.setYear(year);

        return appraisalRepository.save(appraisal);
    }
    
    public void assignPm(Long cycleId, Long pmId) {
        AppraisalCycle cycle = appraisalRepository.findById(cycleId)
                .orElseThrow(() -> new RuntimeException("Appraisal cycle not found"));

        // Check if appraisal is in correct status
        if (cycle.getStatus() != AppraisalStatus.OPEN) {
            throw new RuntimeException("Cannot assign PM. Appraisal is not in OPEN status.");
        }
        
        User pm = userRepository.findById(pmId)
                .orElseThrow(() -> new RuntimeException("PM not found"));
                
        if (!pm.hasRole(Role.PROJECT_MANAGER)) {
            throw new RuntimeException("Selected user is not a Project Manager");
        }
        
        dev.thalha.appraxis.model.PmReview review = new dev.thalha.appraxis.model.PmReview();
        review.setAppraisalCycle(cycle);
        review.setReviewer(pm);
        review.setStatus(dev.thalha.appraxis.model.ReviewStatus.PENDING);
        
        pmReviewRepository.save(review);
        
        // Update cycle status
        cycle.setStatus(AppraisalStatus.PENDING_PM_REVIEW);
        appraisalRepository.save(cycle);
    }
}
