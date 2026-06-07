package com.taxpadi.service;
import com.taxpadi.entity.TaxDeadline;
import com.taxpadi.repository.TaxDeadlineRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class TaxDeadlineService {
    private final TaxDeadlineRepository repo;
    public TaxDeadlineService(TaxDeadlineRepository repo) { this.repo = repo; }

    public List<TaxDeadline> getAll() { return repo.findByIsActiveTrue(); }

    public List<TaxDeadline> getUpcoming(int days) {
        return repo.findUpcoming(LocalDate.now(), LocalDate.now().plusDays(days));
    }

    public List<TaxDeadline> getOverdue() { return repo.findOverdue(LocalDate.now()); }

    @Transactional
    public TaxDeadline create(Map<String,Object> req) {
        TaxDeadline d = new TaxDeadline();
        d.setTitle((String) req.get("title"));
        d.setTaxType((String) req.get("taxType"));
        d.setDescription((String) req.get("description"));
        d.setDueDate(LocalDate.parse((String) req.get("dueDate")));
        d.setFrequency((String) req.get("frequency"));
        d.setApplicableTo((String) req.get("applicableTo"));
        d.setPenaltyDescription((String) req.getOrDefault("penaltyDescription",""));
        d.setStatus("UPCOMING");
        return repo.save(d);
    }

    @Transactional
    public TaxDeadline update(Long id, Map<String,Object> req) {
        TaxDeadline d = repo.findById(id).orElseThrow(() -> new RuntimeException("Deadline not found"));
        if (req.containsKey("title")) d.setTitle((String) req.get("title"));
        if (req.containsKey("description")) d.setDescription((String) req.get("description"));
        if (req.containsKey("dueDate")) d.setDueDate(LocalDate.parse((String) req.get("dueDate")));
        if (req.containsKey("status")) d.setStatus((String) req.get("status"));
        d.setUpdatedAt(LocalDateTime.now());
        return repo.save(d);
    }
}
