package dev.thalha.appraxis;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.Set;

@SpringBootApplication
public class AppraxisApplication {

	public static void main(String[] args) {
		SpringApplication.run(AppraxisApplication.class, args);
	}

	@org.springframework.context.annotation.Bean
	public org.springframework.boot.CommandLineRunner commandLineRunner(
			dev.thalha.appraxis.repository.UserRepository userRepository,
			org.springframework.security.crypto.password.PasswordEncoder passwordEncoder
	) {
		return args -> {
			if (userRepository.count() == 0) {
				// ========== Regular Employees (5) ==========
				var emp1 = dev.thalha.appraxis.model.User.builder()
						.username("john.doe")
						.password(passwordEncoder.encode("password"))
						.name("John Doe")
						.email("john.doe@company.com")
						.roles(Set.of(dev.thalha.appraxis.model.Role.EMPLOYEE))
						.designation("Software Engineer")
						.build();

				var emp2 = dev.thalha.appraxis.model.User.builder()
						.username("sarah.wilson")
						.password(passwordEncoder.encode("password"))
						.name("Sarah Wilson")
						.email("sarah.wilson@company.com")
						.roles(Set.of(dev.thalha.appraxis.model.Role.EMPLOYEE))
						.designation("Frontend Developer")
						.build();

				var emp3 = dev.thalha.appraxis.model.User.builder()
						.username("mike.chen")
						.password(passwordEncoder.encode("password"))
						.name("Mike Chen")
						.email("mike.chen@company.com")
						.roles(Set.of(dev.thalha.appraxis.model.Role.EMPLOYEE))
						.designation("Backend Developer")
						.build();

				var emp4 = dev.thalha.appraxis.model.User.builder()
						.username("emily.davis")
						.password(passwordEncoder.encode("password"))
						.name("Emily Davis")
						.email("emily.davis@company.com")
						.roles(Set.of(dev.thalha.appraxis.model.Role.EMPLOYEE))
						.designation("QA Engineer")
						.build();

				var emp5 = dev.thalha.appraxis.model.User.builder()
						.username("alex.kumar")
						.password(passwordEncoder.encode("password"))
						.name("Alex Kumar")
						.email("alex.kumar@company.com")
						.roles(Set.of(dev.thalha.appraxis.model.Role.EMPLOYEE))
						.designation("DevOps Engineer")
						.build();

				// ========== Project Managers (2) - also employees ==========
				var pm1 = dev.thalha.appraxis.model.User.builder()
						.username("jane.smith")
						.password(passwordEncoder.encode("password"))
						.name("Jane Smith")
						.email("jane.smith@company.com")
						.roles(Set.of(
							dev.thalha.appraxis.model.Role.EMPLOYEE,
							dev.thalha.appraxis.model.Role.PROJECT_MANAGER
						))
						.designation("Senior Project Manager")
						.build();

				var pm2 = dev.thalha.appraxis.model.User.builder()
						.username("david.brown")
						.password(passwordEncoder.encode("password"))
						.name("David Brown")
						.email("david.brown@company.com")
						.roles(Set.of(
							dev.thalha.appraxis.model.Role.EMPLOYEE,
							dev.thalha.appraxis.model.Role.PROJECT_MANAGER
						))
						.designation("Technical Lead")
						.build();

				// ========== HR (1) - also an employee ==========
				var hr = dev.thalha.appraxis.model.User.builder()
						.username("lisa.johnson")
						.password(passwordEncoder.encode("password"))
						.name("Lisa Johnson")
						.email("lisa.johnson@company.com")
						.roles(Set.of(
							dev.thalha.appraxis.model.Role.EMPLOYEE,
							dev.thalha.appraxis.model.Role.HR
						))
						.designation("HR Manager")
						.build();

				// ========== Boss (1) - NOT in employee appraisals ==========
				var boss = dev.thalha.appraxis.model.User.builder()
						.username("robert.taylor")
						.password(passwordEncoder.encode("password"))
						.name("Robert Taylor")
						.email("robert.taylor@company.com")
						.roles(Set.of(
							dev.thalha.appraxis.model.Role.EMPLOYEE,
							dev.thalha.appraxis.model.Role.BOSS
						))
						.designation("CEO")
						.build();

				userRepository.saveAll(java.util.List.of(
					emp1, emp2, emp3, emp4, emp5,
					pm1, pm2,
					hr,
					boss
				));
				System.out.println("Data seeding completed - 9 users created.");
			}
		};
	}

}
