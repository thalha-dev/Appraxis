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

    public AppraisalService(AppraisalRepository appraisalRepository, UserRepository userRepository) {
        this.appraisalRepository = appraisalRepository;
        this.userRepository = userRepository;
    }

    public List<User> getAllEmployees() {
        return userRepository.findByRole(Role.EMPLOYEE);
    }

    public List<AppraisalCycle> getAllAppraisals() {
        return appraisalRepository.findAll();
    }

    public AppraisalCycle initiateAppraisal(Long employeeId, String year, User initiator) {
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (employee.getRole() != Role.EMPLOYEE) {
            throw new RuntimeException("Can only initiate appraisal for employees");
        }

        AppraisalCycle appraisal = new AppraisalCycle();
        appraisal.setEmployee(employee);
        appraisal.setHrInitiator(initiator);
        appraisal.setStartDate(LocalDate.now());
        appraisal.setStatus(AppraisalStatus.OPEN);
        appraisal.setYear(year);

        return appraisalRepository.save(appraisal);
    }
}
