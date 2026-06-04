package com.taxpadi.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Value("${sendgrid.api-key}")
    private String apiKey;

    @Value("${sendgrid.from-email}")
    private String fromEmail;

    @Value("${sendgrid.from-name}")
    private String fromName;

    public void send(String to, String subject, String htmlBody) {
        try {
            Email from = new Email(fromEmail, fromName);
            Email toEmail = new Email(to);
            Content content = new Content("text/html", htmlBody);
            Mail mail = new Mail(from, subject, toEmail, content);

            SendGrid sg = new SendGrid(apiKey);
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            sg.api(request);
            log.info("Email sent to={}, subject={}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to={}, subject={}, error={}", to, subject, e.getMessage());
        }
    }


    public void sendWelcome(String to, String fullName) {
        String subject = "Welcome to TaxPadi!";
        String body = "<h2>Hello " + fullName + ",</h2>"
            + "<p>Your TaxPadi account has been created successfully. "
            + "You can now manage your taxes, file returns, and stay compliant with GRA — all in one place.</p>"
            + "<p>If you did not create this account, please contact us immediately.</p>"
            + "<p>The TaxPadi Team</p>";
        send(to, subject, body);
    }

    public void sendPasswordReset(String to, String fullName) {
        String subject = "Your password has been reset";
        String body = "<h2>Hello " + fullName + ",</h2>"
            + "<p>Your TaxPadi password was successfully reset. "
            + "If you did not request this change, please contact support immediately.</p>"
            + "<p>The TaxPadi Team</p>";
        send(to, subject, body);
    }

    public void sendNewSessionAlert(String to, String fullName, String deviceInfo) {
        String subject = "New login detected on your account";
        String body = "<h2>Hello " + fullName + ",</h2>"
            + "<p>A new login was detected on your TaxPadi account from <strong>" + deviceInfo + "</strong>.</p>"
            + "<p>If this was you, no action is needed. If not, please change your password immediately.</p>"
            + "<p>The TaxPadi Team</p>";
        send(to, subject, body);
    }

    public void sendInvoice(String to, String clientName, String invoiceRef,
                            String totalAmount, String pdfUrl,
                            String senderName, String senderEmail) {
        String subject = "Invoice " + invoiceRef + " from " + senderName;
        String body = "<h2>Hello " + clientName + ",</h2>"
            + "<p>Please find your invoice <strong>" + invoiceRef + "</strong> for <strong>GHS " + totalAmount + "</strong>.</p>"
            + "<p><a href=\"" + pdfUrl + "\">Download Invoice PDF</a></p>"
            + "<p>Thank you for your business.</p>"
            + "<p>" + senderName + "</p>";
        try {
            Email from = new Email(fromEmail, senderName + " via TaxPadi");
            Email toEmail = new Email(to);
            Email replyTo = new Email(senderEmail, senderName);
            Content content = new Content("text/html", body);
            Mail mail = new Mail(from, subject, toEmail, content);
            mail.setReplyTo(replyTo);

            SendGrid sg = new SendGrid(apiKey);
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            sg.api(request);
            log.info("Invoice email sent to={}, subject={}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send invoice email to={}, error={}", to, e.getMessage());
        }
    }
}
