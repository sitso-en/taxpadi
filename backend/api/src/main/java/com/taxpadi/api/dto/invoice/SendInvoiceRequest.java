package com.taxpadi.api.dto.invoice;

import jakarta.validation.constraints.NotBlank;

public class SendInvoiceRequest {

    @NotBlank(message = "Channel is required")
    private String channel;

    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }
}
