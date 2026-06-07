package com.taxpadi.api.controller;

import com.taxpadi.api.common.ApiResponse;
import com.taxpadi.api.dto.paye.*;
import com.taxpadi.api.model.User;
import com.taxpadi.api.security.TaxPadiUserDetails;
import com.taxpadi.api.service.PayeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tax/paye")
public class PayeController {

    private final PayeService payeService;

    public PayeController(PayeService payeService) {
        this.payeService = payeService;
    }

    @GetMapping("/employees")
    public ResponseEntity<ApiResponse<EmployeeListResponse>> getEmployees(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam(defaultValue = "active") String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            payeService.getEmployees(user, status, page, limit),
            "Employees retrieved successfully."));
    }

    @PostMapping("/employees")
    public ResponseEntity<ApiResponse<AddEmployeeResponse>> addEmployee(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestBody CreateEmployeeRequest request) {
        User user = userDetails.getUser();
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(true,
            payeService.addEmployee(user, request),
            "Employee added successfully."));
    }

    @GetMapping("/employees/{id}")
    public ResponseEntity<ApiResponse<EmployeeDetailDto>> getEmployee(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            payeService.getEmployee(user, id),
            "Employee retrieved successfully."));
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<ApiResponse<UpdateEmployeeResponse>> updateEmployee(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id,
            @RequestBody UpdateEmployeeRequest request) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            payeService.updateEmployee(user, id, request),
            "Employee updated successfully."));
    }

    @DeleteMapping("/employees/{id}")
    public ResponseEntity<ApiResponse<DeactivateEmployeeResponse>> deactivateEmployee(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id,
            @RequestBody DeactivateEmployeeRequest request) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            payeService.deactivateEmployee(user, id, request),
            "Employee deactivated successfully. Historical PAYE records preserved."));
    }

    @GetMapping("/records")
    public ResponseEntity<ApiResponse<PayeRecordListResponse>> getRecords(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) UUID employee_id,
            @RequestParam(required = false) Boolean remitted,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            payeService.getRecords(user, month, year, employee_id, remitted, page, limit),
            "PAYE records retrieved successfully."));
    }

    @GetMapping("/records/{month}/{year}")
    public ResponseEntity<ApiResponse<MonthlySummaryResponse>> getMonthlySummary(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable int month,
            @PathVariable int year) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            payeService.getMonthlySummary(user, month, year),
            "Monthly PAYE summary retrieved successfully."));
    }

    @PutMapping("/records/{id}/remit")
    public ResponseEntity<ApiResponse<PayeRemitResponse>> remit(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id,
            @RequestBody(required = false) RemitRequest request) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            payeService.remit(user, id, request != null ? request : new RemitRequest()),
            "PAYE record marked as remitted."));
    }

    @GetMapping("/annual-return/{year}")
    public ResponseEntity<ApiResponse<AnnualReturnResponse>> getAnnualReturn(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable int year) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            payeService.getAnnualReturn(user, year),
            "Annual PAYE return retrieved successfully."));
    }
}
