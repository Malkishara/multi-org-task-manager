package com.imh.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.liquibase.LiquibaseAutoConfiguration;
import org.springframework.boot.autoconfigure.AutoConfigureAfter;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

/**
 * This configuration is intentionally empty.
 * Liquibase is configured via application.yaml properties.
 * This class exists to ensure proper initialization order.
 */
@Configuration
@AutoConfigureAfter({DataSourceAutoConfiguration.class})
public class LiquibaseConfig {
}

