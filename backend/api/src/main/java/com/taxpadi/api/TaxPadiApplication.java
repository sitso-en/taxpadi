package com.taxpadi.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TaxPadiApplication {

	public static void main(String[] args) {
		SpringApplication.run(TaxPadiApplication.class, args);
	}

}
