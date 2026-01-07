package dev.thalha.appraxis;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

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
				var hrAdmin = dev.thalha.appraxis.model.User.builder()
						.username("hr_admin")
						.password(passwordEncoder.encode("password"))
						.name("HR Administrator")
						.email("hr@appraxis.dev")
						.role(dev.thalha.appraxis.model.Role.HR)
						.designation("Head of HR")
						.build();

				var employee = dev.thalha.appraxis.model.User.builder()
						.username("john_doe")
						.password(passwordEncoder.encode("password"))
						.name("John Doe")
						.email("john@appraxis.dev")
						.role(dev.thalha.appraxis.model.Role.EMPLOYEE)
						.designation("Software Engineer")
						.build();

				var pm = dev.thalha.appraxis.model.User.builder()
						.username("jane_pm")
						.password(passwordEncoder.encode("password"))
						.name("Jane Project Manager")
						.email("jane@appraxis.dev")
						.role(dev.thalha.appraxis.model.Role.PROJECT_MANAGER)
						.designation("Senior PM")
						.build();

				var boss = dev.thalha.appraxis.model.User.builder()
						.username("big_boss")
						.password(passwordEncoder.encode("password"))
						.name("Big Boss")
						.email("boss@appraxis.dev")
						.role(dev.thalha.appraxis.model.Role.BOSS)
						.designation("CEO")
						.build();

				userRepository.saveAll(java.util.List.of(hrAdmin, employee, pm, boss));
				System.out.println("Data seeding completed.");
			}
		};
	}

}
