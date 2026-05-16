package com.taxpadi.api.repository;

import com.taxpadi.api.model.Employee;
import com.taxpadi.api.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    Page<Employee> findAllByUserAndIsActive(User user, Boolean isActive, Pageable pageable);

    Page<Employee> findAllByUser(User user, Pageable pageable);

    Optional<Employee> findByEmployeeIdAndUser(UUID employeeId, User user);

    long countByUserAndIsActive(User user, Boolean isActive);
}
