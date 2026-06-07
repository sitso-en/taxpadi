package com.taxpadi.service;
import com.taxpadi.entity.Penalty;
import com.taxpadi.repository.PenaltyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class PenaltyService {
    private final PenaltyRepository repo;
    private static final BigDecimal LATE_FILING_RATE = new BigDecimal("0.01");
    private static final BigDecimal LATE_PAYMENT_RATE = new BigDecimal("0.005");
    private static final BigDecimal MIN_PENALTY = new BigDecimal("25000");

    public PenaltyService(PenaltyRepository repo) { this.repo = repo; }

    public List<Penalty> getUserPenalties(Long userId) { return repo.findByUserId(userId); }

    public List<Penalty> getUserPenaltiesByStatus(Long userId, String status) {
        return repo.findByUserIdAndStatus(userId, status);
    }

    public Map<String,Object> calculate(Map<String,Object> req) {
        BigDecimal taxAmount = new BigDecimal(req.get("taxAmount").toString());
        LocalDate dueDate = LocalDate.parse((String) req.get("dueDate"));
        LocalDate filingDate = LocalDate.parse((String) req.getOrDefault("filingDate", LocalDate.now().toString()));
        String type = (String) req.get("penaltyType");
        long daysLate = Math.max(0, ChronoUnit.DAYS.between(dueDate, filingDate));
        long monthsLate = (daysLate / 30) + 1;
        BigDecimal rate = "LATE_FILING".equals(type) ? LATE_FILING_RATE : LATE_PAYMENT_RATE;
        BigDecimal penaltyAmount = taxAmount.multiply(rate).multiply(BigDecimal.valueOf(monthsLate)).setScale(2, RoundingMode.HALF_UP);
        if (penaltyAmount.compareTo(MIN_PENALTY) < 0) penaltyAmount = MIN_PENALTY;
        Map<String,Object> result = new HashMap<>();
        result.put("originalTaxAmount", taxAmount);
        result.put("daysLate", daysLate);
        result.put("monthsLate", monthsLate);
        result.put("penaltyRate", rate);
        result.put("penaltyAmount", penaltyAmount);
        result.put("totalDue", taxAmount.add(penaltyAmount));
        return result;
    }

    @Transactional
    public Penalty record(Long userId, Map<String,Object> req) {
        Map<String,Object> calc = calculate(req);
        Penalty p = new Penalty();
        p.setUserId(userId);
        p.setTaxType((String) req.get("taxType"));
        p.setPenaltyType((String) req.get("penaltyType"));
        p.setOriginalTaxAmount(new BigDecimal(req.get("taxAmount").toString()));
        p.setPenaltyAmount((BigDecimal) calc.get("penaltyAmount"));
        p.setPenaltyRate((BigDecimal) calc.get("penaltyRate"));
        p.setDueDate(LocalDate.parse((String) req.get("dueDate")));
        p.setFilingDate(LocalDate.parse((String) req.getOrDefault("filingDate", LocalDate.now().toString())));
        p.setDaysLate(((Long) calc.get("daysLate")).intValue());
        p.setStatus("OUTSTANDING");
        p.setDescription((String) req.getOrDefault("description",""));
        p.setReferenceNumber("PEN-" + UUID.randomUUID().toString().substring(0,8).toUpperCase());
        return repo.save(p);
    }

    @Transactional
    public Penalty updateStatus(Long id, String status) {
        Penalty p = repo.findById(id).orElseThrow(() -> new RuntimeException("Penalty not found"));
        p.setStatus(status);
        if ("PAID".equals(status)) p.setPaidAt(LocalDateTime.now());
        p.setUpdatedAt(LocalDateTime.now());
        return repo.save(p);
    }

    public Map<String,Object> getSummary(Long userId) {
        List<Penalty> all = repo.findByUserId(userId);
        Map<String,Object> s = new HashMap<>();
        s.put("totalPenalties", all.size());
        s.put("outstandingAmount", repo.sumOutstandingByUserId(userId));
        s.put("outstandingCount", all.stream().filter(p -> "OUTSTANDING".equals(p.getStatus())).count());
        s.put("paidCount", all.stream().filter(p -> "PAID".equals(p.getStatus())).count());
        return s;
    }
}
