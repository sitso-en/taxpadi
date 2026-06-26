package com.taxpadi.api.dto.report;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ExportResponse {

    private UUID exportId;
    private String format;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private RecordsIncluded recordsIncluded;
    private String fileUrl;
    private String expiresAt;
    private String note;
    private Map<String, Object> data;

    public UUID getExportId() { return exportId; }
    public void setExportId(UUID exportId) { this.exportId = exportId; }

    public String getFormat() { return format; }
    public void setFormat(String format) { this.format = format; }

    public LocalDate getPeriodStart() { return periodStart; }
    public void setPeriodStart(LocalDate periodStart) { this.periodStart = periodStart; }

    public LocalDate getPeriodEnd() { return periodEnd; }
    public void setPeriodEnd(LocalDate periodEnd) { this.periodEnd = periodEnd; }

    public RecordsIncluded getRecordsIncluded() { return recordsIncluded; }
    public void setRecordsIncluded(RecordsIncluded recordsIncluded) { this.recordsIncluded = recordsIncluded; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getExpiresAt() { return expiresAt; }
    public void setExpiresAt(String expiresAt) { this.expiresAt = expiresAt; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public Map<String, Object> getData() { return data; }
    public void setData(Map<String, Object> data) { this.data = data; }
}
