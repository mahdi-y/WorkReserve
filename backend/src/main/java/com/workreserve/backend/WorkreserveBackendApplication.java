package com.workreserve.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WorkreserveBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(WorkreserveBackendApplication.class, args);
	}

}
