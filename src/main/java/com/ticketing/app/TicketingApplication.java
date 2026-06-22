package com.ticketing.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import com.ticketing.app.identity.model.User;
import com.ticketing.app.identity.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class TicketingApplication {

    public static void main(String[] args) {
        SpringApplication.run(TicketingApplication.class, args);
    }

    // Add this method here:
    @Bean
    CommandLineRunner debugAdmin(UserRepository repo, PasswordEncoder encoder) {
        return args -> {
            try {
                User admin = repo.findByEmail("admin@admin.com").orElseThrow();
                admin.setPassword(encoder.encode("admin123"));
                repo.save(admin);
                System.out.println(">>> PASSWORD RESET SUCCESSFUL: admin@admin.com set to admin123");
            } catch (Exception e) {
                System.out.println(">>> COULD NOT RESET ADMIN PASSWORD (User might not exist): " + e.getMessage());
            }
        };
    }
}