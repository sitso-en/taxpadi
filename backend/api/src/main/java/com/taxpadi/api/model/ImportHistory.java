package com.taxpadi.api.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Id; 

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "import_history")
public class ImportHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "import_id")
    private UUID importId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 30)
    private String provider;

    @Column(name = "statement_from", nullable = false)
    private LocalDate statementFrom;

    @Column(name = "statement_to", nullable = false)
    private LocalDate statementTo;

    @Column(name = "total_imported", nullable = false)
    private Integer totalImported = 0;

    @Column(name = "total_skipped", nullable = false)
    private Integer totalSkipped = 0;

    @Column(name = "imported_at", updatable = false)
    private LocalDateTime importedAt;

    @PrePersist
    protected void onCreate() {
        importedAt = LocalDateTime.now();
    }



    public UUID getImportId() {
        return importId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public LocalDate getStatementFrom() {
        return statementFrom;
    }

    public void setStatementFrom(LocalDate statementFrom) {
        this.statementFrom = statementFrom;
    }

    public LocalDate getStatementTo() {
        return statementTo;
    }

    public void setStatementTo(LocalDate statementTo) {
        this.statementTo = statementTo;
    }

    public Integer getTotalImported() {
        return totalImported;
    }

    public void setTotalImported(Integer totalImported) {
        this.totalImported = totalImported;
    }

    public Integer getTotalSkipped() {
        return totalSkipped;
    }

    public void setTotalSkipped(Integer totalSkipped) {
        this.totalSkipped = totalSkipped;
    }

    public LocalDateTime getImportedAt() {
        return importedAt;
    }
    

}
