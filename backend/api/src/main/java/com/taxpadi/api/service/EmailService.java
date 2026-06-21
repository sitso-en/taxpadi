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
        String subject = "Welcome to TaxPadi — You're all set! :)";
        String body = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
              <div style="background: #1a6b3c; padding: 32px 40px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">TaxPadi</h1>
                <p style="color: #a7f3c0; margin: 8px 0 0; font-size: 14px;">Your smart tax companion</p>
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
                      <div style="background: #1a6b3c; color: white; border-radius: 50%%; width: 26px; height: 26px; text-align: center; line-height: 26px; font-size: 13px; font-weight: bold;">1</div>
                    </td>
                    <td style="padding: 8px 0 8px 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                      <strong>Set up your tax profile</strong><br/>
                      Tell us a little about yourself: your income type, region, and taxpayer category, so we can tailor everything to you.
                    </td>
                  </tr>
                  <tr>
                    <td style="width: 36px; vertical-align: top; padding: 8px 0;">
                      <div style="background: #1a6b3c; color: white; border-radius: 50%%; width: 26px; height: 26px; text-align: center; line-height: 26px; font-size: 13px; font-weight: bold;">2</div>
                    </td>
                    <td style="padding: 8px 0 8px 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                      <strong>Log your first transaction</strong><br/>
                      Add your income and expenses. You can type them in, upload a receipt, or even record a voice note, whatever what you prefer
                    </td>
                  </tr>
                  <tr>
                    <td style="width: 36px; vertical-align: top; padding: 8px 0;">
                      <div style="background: #1a6b3c; color: white; border-radius: 50%%; width: 26px; height: 26px; text-align: center; line-height: 26px; font-size: 13px; font-weight: bold;">3</div>
                    </td>
                    <td style="padding: 8px 0 8px 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                      <strong>Know what you owe</strong><br/>
                      TaxPadi automatically calculates your income tax, VAT, and PAYE, all aligned with GRA rules.
                    </td>
                  </tr>
                  <tr>
                    <td style="width: 36px; vertical-align: top; padding: 8px 0;">
                      <div style="background: #1a6b3c; color: white; border-radius: 50%%; width: 26px; height: 26px; text-align: center; line-height: 26px; font-size: 13px; font-weight: bold;">4</div>
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
            """.formatted(fullName);
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

    public void sendDataExport(String to, String fullName, String jsonData) {
        String subject = "Your TaxPadi data export";
        String body = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: auto;\">"
            + "<h2 style=\"color: #1a6b3c;\">Your data is ready</h2>"
            + "<p>Hello " + fullName + ",</p>"
            + "<p>As requested, we've attached a full export of your TaxPadi account data. "
            + "It includes your profile, transactions, invoices, tax returns, VAT records, savings vault, and activity log.</p>"
            + "<p>If you did not request this export, please contact us immediately at "
            + "<a href=\"mailto:sitso.nkrumah@gmail.com\">sitso.nkrumah@gmail.com</a>.</p>"
            + "<p>The TaxPadi Team</p>"
            + "</div>";
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
