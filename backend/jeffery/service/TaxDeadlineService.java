package com.taxpadi.api.service;

import com.taxpadi.api.dto.common.PaginationInfo;
import com.taxpadi.api.dto.deadline.CompleteDeadlineResponse;
import com.taxpadi.api.dto.deadline.DeadlineListResponse;
import com.taxpadi.api.dto.deadline.TaxDeadlineDto;
import com.taxpadi.api.dto.deadline.UpcomingDeadlinesResponse;
import com.taxpadi.api.exception.BadRequestException;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.TaxDeadline;
import com.taxpadi.api.repository.TaxDeadlineRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TaxDeadlineService {

    private final TaxDeadlineRepository repo;

    public TaxDeadlineService(TaxDeadlineRepository repo) {
        this.repo = repo;
    }

    public DeadlineListResponse getAll(int page, int limit) {
        List<TaxDeadline> all = repo.findByIsActiveTrue();
        all.sort((a, b) -> a.getDueDate().compareTo(b.getDueDate()));
        long total = all.size();
        int fromIdx = Math.min((page - 1) * limit, (int) total);
        int toIdx = Math.min(fromIdx + limit, (int) total);
        List<TaxDeadlineDto> dtos = all.subList(fromIdx, toIdx).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        int totalPages = (int) Math.ceil((double) total / limit);
        return new DeadlineListResponse(dtos, new PaginationInfo(total, page, limit, totalPages));
    }

    public UpcomingDeadlinesResponse getUpcoming(int days) {
        if (days < 1 || days > 365) {
            throw new BadRequestException("Days parameter must be between 1 and 365.");
        }
        List<TaxDeadline> upcoming = repo.findUpcoming(LocalDate.now(), LocalDate.now().plusDays(days));
        List<TaxDeadlineDto> dtos = upcoming.stream()
                .map(d -> toDtoWithUrgency(d, true))
                .collect(Collectors.toList());
        return new UpcomingDeadlinesResponse(dtos);
    }

    @Transactional
    public CompleteDeadlineResponse complete(UUID deadlineId) {
        TaxDeadline d = repo.findById(deadlineId)
                .orElseThrow(() -> new NotFoundException("No deadline found with this ID."));
        if ("COMPLETED".equals(d.getStatus())) {
            throw new BadRequestException("This deadline is already marked as complete.");
        }
        d.setStatus("COMPLETED");
        repo.save(d);

        CompleteDeadlineResponse resp = new CompleteDeadlineResponse();
        resp.setDeadlineId(d.getDeadlineId());
        resp.setTaxType(d.getTaxType());
        resp.setDescription(d.getDescription());
        resp.setDeadlineDate(d.getDueDate());
        resp.setCompleted(true);
        resp.setCompletedAt(d.getUpdatedAt());
        return resp;
    }

    private TaxDeadlineDto toDto(TaxDeadline d) {
        return toDtoWithUrgency(d, false);
    }

    private TaxDeadlineDto toDtoWithUrgency(TaxDeadline d, boolean includeUrgency) {
        TaxDeadlineDto dto = new TaxDeadlineDto();
        dto.setDeadlineId(d.getDeadlineId());
        dto.setTaxType(d.getTaxType());
        dto.setTitle(d.getTitle());
        dto.setDescription(d.getDescription());
        dto.setDeadlineDate(d.getDueDate());
        long daysUntil = ChronoUnit.DAYS.between(LocalDate.now(), d.getDueDate());
        dto.setDaysUntilDue(daysUntil);
        dto.setCompleted("COMPLETED".equals(d.getStatus()));
        if (includeUrgency) {
            if (daysUntil <= 7) dto.setUrgency("critical");
            else if (daysUntil <= 30) dto.setUrgency("warning");
            else dto.setUrgency("normal");
        }
        return dto;
    }
}
