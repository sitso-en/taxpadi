package com.taxpadi.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Attachments;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import java.util.Base64;
import java.io.InputStream;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Value("${sendgrid.api-key}")
    private String apiKey;

    @Value("${sendgrid.from-email}")
    private String fromEmail;

    @Value("${sendgrid.from-name}")
    private String fromName;

    private String logoImgTag() {
        try (InputStream is = getClass().getResourceAsStream("/images/logo.png")) {
            if (is == null) return "<p style=\"font-size:22px;font-weight:700;color:#B83729;\">TaxPadi</p>";
            String b64 = Base64.getEncoder().encodeToString(is.readAllBytes());
            return "<img src=\"data:image/png;base64," + b64 + "\" alt=\"TaxPadi\" style=\"height:48px;display:block;margin:0 auto;\" />";
        } catch (Exception e) {
            return "<p style=\"font-size:22px;font-weight:700;color:#B83729;\">TaxPadi</p>";
        }
    }

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
        String subject = "Welcome to TaxPadi — You're all set! :)";
        String logo = logoImgTag();
        String body = ("""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
              <div style="background: #ffffff; padding: 28px 40px 20px; text-align: center; border-bottom: 4px solid #B83729;">
                %s
              </div>
              <div style="padding: 40px;">
                <p style="font-size: 18px; color: #111827; font-weight: bold; margin-bottom: 4px;">Hey %s,</p>
                <p style="color: #4b5563; font-size: 15px; line-height: 1.7;">
                  Welcome to the TaxPadi family! 🙌 We're genuinely excited to have you on board.
                  Your account is verified and ready to go; staying on top of your taxes just got a whole lot easier.
                </p>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 28px 0;" />

                <p style="font-size: 15px; font-weight: bold; color: #111827; margin-bottom: 12px;">Here's how to get started:</p>
                <table style="width: 100%%; border-collapse: collapse;">
                  <tr>
                    <td style="width: 36px; vertical-align: top; padding: 8px 0;">
                      <div style="background: #B83729; color: white; border-radius: 50%%; width: 26px; height: 26px; text-align: center; line-height: 26px; font-size: 13px; font-weight: bold;">1</div>
                    </td>
                    <td style="padding: 8px 0 8px 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                      <strong>Set up your tax profile</strong><br/>
                      Tell us a little about yourself: your income type, region, and taxpayer category, so we can tailor everything to you.
                    </td>
                  </tr>
                  <tr>
                    <td style="width: 36px; vertical-align: top; padding: 8px 0;">
                      <div style="background: #B83729; color: white; border-radius: 50%%; width: 26px; height: 26px; text-align: center; line-height: 26px; font-size: 13px; font-weight: bold;">2</div>
                    </td>
                    <td style="padding: 8px 0 8px 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                      <strong>Log your first transaction</strong><br/>
                      Add your income and expenses. You can type them in, upload a receipt, or even record a voice note, whatever what you prefer
                    </td>
                  </tr>
                  <tr>
                    <td style="width: 36px; vertical-align: top; padding: 8px 0;">
                      <div style="background: #B83729; color: white; border-radius: 50%%; width: 26px; height: 26px; text-align: center; line-height: 26px; font-size: 13px; font-weight: bold;">3</div>
                    </td>
                    <td style="padding: 8px 0 8px 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                      <strong>Know what you owe</strong><br/>
                      TaxPadi automatically calculates your income tax, VAT, and PAYE, all aligned with GRA rules.
                    </td>
                  </tr>
                  <tr>
                    <td style="width: 36px; vertical-align: top; padding: 8px 0;">
                      <div style="background: #B83729; color: white; border-radius: 50%%; width: 26px; height: 26px; text-align: center; line-height: 26px; font-size: 13px; font-weight: bold;">4</div>
                    </td>
                    <td style="padding: 8px 0 8px 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                      <strong>File your returns</strong><br/>
                      When it's time, file directly through the app and never miss a GRA deadline again.
                    </td>
                  </tr>
                </table>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 28px 0;" />

                <p style="font-size: 14px; color: #4b5563; line-height: 1.7;">
                  Have a question or need help getting started? We're always here.
                </p>
                <p style="font-size: 14px; color: #4b5563; margin: 4px 0;">
                  📧 <a href="mailto:sitso.nkrumah@gmail.com" style="color: #1a6b3c;">sitso.nkrumah@gmail.com</a>
                </p>
                <p style="font-size: 14px; color: #4b5563; margin: 4px 0;">
                  📞 0551 448 215 &nbsp;|&nbsp; 0509 315 180
                </p>

                <p style="color: #4b5563; font-size: 14px; margin-top: 28px; line-height: 1.7;">
                  With you all the way,<br/>
                  <strong style="color: #111827;">The TaxPadi Team</strong>
                </p>
              </div>
              <div style="background: #f9fafb; padding: 20px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                  If you didn't create a TaxPadi account, you can safely ignore this email or contact us at
                  <a href="mailto:sitso.nkrumah@gmail.com" style="color: #1a6b3c;">sitso.nkrumah@gmail.com</a>.
                </p>
              </div>
            </div>
            """).formatted(logo, fullName);
        send(to, subject, body);
    }

    private String brandedEmail(String logoTag, String heading, String greeting, String message) {
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"></head>"
            + "<body style=\"margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;\">"
            + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#f3f4f6;padding:40px 0;\">"
            + "<tr><td align=\"center\">"
            + "<table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;\">"
            + "<tr><td style=\"background:#ffffff;padding:28px 40px 20px;text-align:center;border-bottom:4px solid #B83729;\">"
            + logoTag
            + "</td></tr>"
            + "<tr><td style=\"padding:40px;\">"
            + "<p style=\"font-size:18px;font-weight:bold;color:#111827;margin:0 0 8px;\">" + heading + "</p>"
            + "<p style=\"font-size:15px;color:#374151;margin:0 0 16px;\">" + greeting + "</p>"
            + "<p style=\"font-size:15px;color:#374151;line-height:1.7;margin:0 0 28px;\">" + message + "</p>"
            + "<p style=\"font-size:14px;color:#4b5563;margin:0;\">With you all the way,<br/><strong style=\"color:#111827;\">The TaxPadi Team</strong></p>"
            + "</td></tr>"
            + "<tr><td style=\"background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;\">"
            + "<p style=\"font-size:12px;color:#9ca3af;margin:0;\">Smart Tax Management for Ghana &mdash; <a href=\"mailto:sitso.nkrumah@gmail.com\" style=\"color:#B83729;\">sitso.nkrumah@gmail.com</a></p>"
            + "</td></tr>"
            + "</table></td></tr></table></body></html>";
    }

    public void sendPasswordReset(String to, String fullName) {
        String subject = "Your TaxPadi password has been reset";
        String body = brandedEmail(logoImgTag(),
            "Password Reset Confirmation",
            "Hello <strong>" + fullName + "</strong>,",
            "Your TaxPadi password was successfully reset. If you did not request this change, please contact us immediately at "
            + "<a href=\"mailto:sitso.nkrumah@gmail.com\" style=\"color:#B83729;\">sitso.nkrumah@gmail.com</a>.");
        send(to, subject, body);
    }

    public void sendNewSessionAlert(String to, String fullName, String deviceInfo) {
        String subject = "New login detected on your TaxPadi account";
        String body = brandedEmail(logoImgTag(),
            "New Login Detected",
            "Hello <strong>" + fullName + "</strong>,",
            "A new login was detected on your TaxPadi account from <strong>" + deviceInfo + "</strong>. "
            + "If this was you, no action is needed. If not, please change your password immediately.");
        send(to, subject, body);
    }

    public void sendInvoice(String to, String clientName, String invoiceRef,
                            String totalAmount, String dueDate, String pdfUrl,
                            String senderName, String senderEmail) {
        String subject = "Invoice " + invoiceRef + " from " + senderName;
        String dueLine = (dueDate != null && !dueDate.isBlank())
            ? "<tr><td style=\"padding:8px 0;color:#6b7280;font-size:14px;\">Due Date</td>"
              + "<td style=\"padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;\">" + dueDate + "</td></tr>"
            : "";
        String body = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"></head><body style=\"margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;\">"
            + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#f3f4f6;padding:40px 0;\">"
            + "<tr><td align=\"center\">"
            + "<table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#ffffff;border-radius:8px;overflow:hidden;\">"

            // Header
            + "<tr><td style=\"background:#ffffff;padding:24px 40px 16px;text-align:center;border-bottom:4px solid #B83729;\">"
            + logoImgTag()
            + "</td></tr>"

            // Body
            + "<tr><td style=\"padding:40px 40px 24px;\">"
            + "<p style=\"margin:0 0 8px;font-size:16px;color:#111827;\">Hello <strong>" + clientName + "</strong>,</p>"
            + "<p style=\"margin:0 0 28px;font-size:15px;color:#374151;line-height:1.6;\">"
            + "<strong>" + senderName + "</strong> has sent you an invoice via TaxPadi. "
            + "Please review the details below and download your copy using the button provided.</p>"

            // Invoice details card
            + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:20px 24px;margin-bottom:28px;\">"
            + "<tr><td style=\"padding:0 0 12px;\"><p style=\"margin:0;font-size:12px;font-weight:700;color:#6b7280;letter-spacing:1px;text-transform:uppercase;\">Invoice Summary</p></td></tr>"
            + "<tr><td style=\"padding:8px 0;color:#6b7280;font-size:14px;\">Invoice Number</td>"
            + "<td style=\"padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;\">" + invoiceRef + "</td></tr>"
            + "<tr><td colspan=\"2\" style=\"border-top:1px solid #e5e7eb;\"></td></tr>"
            + dueLine
            + "<tr><td colspan=\"2\" style=\"border-top:1px solid #e5e7eb;\"></td></tr>"
            + "<tr><td style=\"padding:12px 0 4px;color:#111827;font-size:15px;font-weight:700;\">Total Amount</td>"
            + "<td style=\"padding:12px 0 4px;color:#B83729;font-size:18px;font-weight:700;text-align:right;\">GHS " + totalAmount + "</td></tr>"
            + "</table>"

            // CTA button
            + "<table cellpadding=\"0\" cellspacing=\"0\" style=\"margin-bottom:28px;\">"
            + "<tr><td style=\"background:#B83729;border-radius:6px;\">"
            + "<a href=\"" + pdfUrl + "\" style=\"display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;\">Download Invoice PDF</a>"
            + "</td></tr></table>"

            + "<p style=\"margin:0;font-size:14px;color:#6b7280;line-height:1.6;\">If the button doesn't work, copy and paste this link into your browser:</p>"
            + "<p style=\"margin:6px 0 0;font-size:13px;color:#B83729;word-break:break-all;\">" + pdfUrl + "</p>"
            + "</td></tr>"

            // Divider + sender info
            + "<tr><td style=\"padding:0 40px 32px;\">"
            + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\"><tr><td style=\"border-top:1px solid #e5e7eb;padding-top:24px;\">"
            + "<p style=\"margin:0;font-size:14px;color:#374151;\">Questions about this invoice? Reply to this email or contact <strong>" + senderName + "</strong> directly at "
            + "<a href=\"mailto:" + senderEmail + "\" style=\"color:#B83729;\">" + senderEmail + "</a>.</p>"
            + "</td></tr></table>"
            + "</td></tr>"

            // Footer
            + "<tr><td style=\"background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;\">"
            + "<p style=\"margin:0;font-size:12px;color:#9ca3af;text-align:center;\">This invoice was sent via <strong>TaxPadi</strong> &mdash; Smart Tax Management for Ghana.</p>"
            + "<p style=\"margin:6px 0 0;font-size:12px;color:#9ca3af;text-align:center;\">You received this email because " + senderName + " sent you an invoice.</p>"
            + "</td></tr>"

            + "</table></td></tr></table></body></html>";
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

    public void sendDataExport(String to, String fullName, String jsonData) {
        String subject = "Your TaxPadi data export is ready";
        String body = brandedEmail(logoImgTag(),
            "Your Data Export",
            "Hello <strong>" + fullName + "</strong>,",
            "As requested, we've attached a full export of your TaxPadi account data. "
            + "It includes your profile, transactions, invoices, tax returns, VAT records, savings vault, and activity log. "
            + "If you did not request this export, please contact us immediately at "
            + "<a href=\"mailto:sitso.nkrumah@gmail.com\" style=\"color:#B83729;\">sitso.nkrumah@gmail.com</a>.");
        try {
            Email from = new Email(fromEmail, fromName);
            Email toEmail = new Email(to);
            Content content = new Content("text/html", body);
            Mail mail = new Mail(from, subject, toEmail, content);

            Attachments attachment = new Attachments();
            attachment.setContent(Base64.getEncoder().encodeToString(jsonData.getBytes()));
            attachment.setType("application/json");
            attachment.setFilename("taxpadi-export.json");
            attachment.setDisposition("attachment");
            mail.addAttachments(attachment);

            SendGrid sg = new SendGrid(apiKey);
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            sg.api(request);
            log.info("Data export email sent to={}", to);
        } catch (Exception e) {
            log.error("Failed to send data export email to={}, error={}", to, e.getMessage());
        }
    }
}
