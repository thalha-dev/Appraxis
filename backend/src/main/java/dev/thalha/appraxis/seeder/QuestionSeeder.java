package dev.thalha.appraxis.seeder;

import dev.thalha.appraxis.model.Question;
import dev.thalha.appraxis.repository.QuestionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class QuestionSeeder implements CommandLineRunner {

    private final QuestionRepository questionRepository;

    public QuestionSeeder(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (questionRepository.count() == 0) {
            List<Question> questions = List.of(
                    new Question("How consistently does this person translate complex requirements into working code without constant supervision?", "Execution"),
                    new Question("How effectively does this person unblock themselves and others when facing technical hurdles?", "Problem Solving"),
                    new Question("Does this person actively participate in code reviews and provide constructive feedback?", "Collaboration"),
                    new Question("How well does this person document their code and architectural decisions?", "Documentation"),
                    new Question("Does this person demonstrate a strong understanding of security best practices?", "Security")
            );
            questionRepository.saveAll(questions);
            System.out.println("Seeded initial questions.");
        }
    }
}
