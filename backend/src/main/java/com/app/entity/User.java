package com.app.entity;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private String phoneNumber;
    private String paystackCustomerCode;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Subscription> subscriptions;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Transaction> transactions;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public User() {}

    public User(Long id, String email, String password, String fullName, String phoneNumber) {
        this.id = id; this.email = email; this.password = password;
        this.fullName = fullName; this.phoneNumber = phoneNumber;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id; private String email; private String password;
        private String fullName; private String phoneNumber; private String paystackCustomerCode;
        public Builder id(Long id) { this.id = id; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder password(String password) { this.password = password; return this; }
        public Builder fullName(String fullName) { this.fullName = fullName; return this; }
        public Builder phoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; return this; }
        public Builder paystackCustomerCode(String c) { this.paystackCustomerCode = c; return this; }
        public User build() {
            User u = new User(); u.id = id; u.email = email; u.password = password;
            u.fullName = fullName; u.phoneNumber = phoneNumber; u.paystackCustomerCode = paystackCustomerCode;
            return u;
        }
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getFullName() { return fullName; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getPaystackCustomerCode() { return paystackCustomerCode; }
    public List<Subscription> getSubscriptions() { return subscriptions; }
    public List<Transaction> getTransactions() { return transactions; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setId(Long id) { this.id = id; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public void setPaystackCustomerCode(String c) { this.paystackCustomerCode = c; }
}
