package com.app.service;
import com.app.entity.*;
import com.app.enums.*;
import com.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service @RequiredArgsConstructor
public class SubscriptionService {
    private final SubscriptionRepository subscriptionRepository;
    private final TransactionRepository transactionRepository;
    private final TaxRecordRepository taxRecordRepository;
    private final UserRepository userRepository;
    private final PaystackClient paystackClient;
    private final TaxService taxService;

    @Value("${tax.rate}") private BigDecimal taxRate;

    @Transactional
    public Map<String,Object> initiate(String email, String planName, BigDecimal basePrice, BillingCycle cycle) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        BigDecimal taxAmount = taxService.calculateTax(basePrice);
        BigDecimal totalAmount = taxService.calculateTotal(basePrice);
        String reference = "SUB-" + UUID.randomUUID().toString().substring(0,12).toUpperCase();

        Transaction txn = Transaction.builder()
                .user(user).reference(reference).baseAmount(basePrice)
                .taxAmount(taxAmount).totalAmount(totalAmount)
                .currency("NGN").status(PaymentStatus.PENDING).build();
        transactionRepository.save(txn);

        Map paystackResp = paystackClient.initializeTransaction(email, totalAmount, reference);

        if (paystackResp == null || paystackResp.get("data") == null) {
            throw new RuntimeException("Invalid Paystack response");
        }

        Map data = (Map) paystackResp.get("data");

        return Map.of(
            "reference", reference,
            "authorizationUrl", data.get("authorization_url"),
            "baseAmount", basePrice,
            "taxAmount", taxAmount,
            "totalAmount", totalAmount,
            "taxRate", taxRate,
            "plan", planName,
            "billingCycle", cycle
        );
    }

    @Transactional
    public Transaction verifyAndActivate(String reference) {
        Map resp = paystackClient.verifyTransaction(reference);
        Map data = (Map) resp.get("data");
        String paystackRef = (String) data.get("reference");
        String gatewayStatus = (String) data.get("status");

        if (!reference.equals(paystackRef)) {
            throw new RuntimeException("Reference mismatch");
        }

        Transaction txn = transactionRepository.findByReference(reference)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (txn.getStatus() == PaymentStatus.SUCCESS) {
            return txn;
        }

        if ("success".equals(gatewayStatus)) {
            txn.setStatus(PaymentStatus.SUCCESS);
            txn.setPaystackReference(paystackRef);
            txn.setGatewayResponse(gatewayStatus);
            txn.setPaidAt(LocalDateTime.now());

            String receiptNo = "TAX-" + UUID.randomUUID().toString().substring(0,8).toUpperCase();
            txn.setTaxReceiptNumber(receiptNo);
            transactionRepository.save(txn);

            TaxRecord tax = TaxRecord.builder()
                    .transaction(txn).user(txn.getUser()).taxType("VAT").taxRate(taxRate)
                    .taxableAmount(txn.getBaseAmount()).taxAmount(txn.getTaxAmount())
                    .receiptNumber(receiptNo).taxPeriod(LocalDateTime.now().getYear() + "-" + String.format("%02d", LocalDateTime.now().getMonthValue()))
                    .build();
            taxRecordRepository.save(tax);
        } else {
            txn.setStatus(PaymentStatus.FAILED);
            transactionRepository.save(txn);
        }
        return txn;
    }

    public List<Subscription> getUserSubscriptions(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return subscriptionRepository.findByUserId(user.getId());
    }
}
