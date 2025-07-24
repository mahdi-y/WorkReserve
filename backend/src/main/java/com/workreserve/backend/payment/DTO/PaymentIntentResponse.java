package com.workreserve.backend.payment.DTO;

public class PaymentIntentResponse {
    private String clientSecret;
    private String paymentIntentId;
    private Double amount;

    public PaymentIntentResponse(String clientSecret, String paymentIntentId, Double amount) {
        this.clientSecret = clientSecret;
        this.paymentIntentId = paymentIntentId;
        this.amount = amount;
    }

    public String getClientSecret() { return clientSecret; }
    public void setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }

    public String getPaymentIntentId() { return paymentIntentId; }
    public void setPaymentIntentId(String paymentIntentId) { this.paymentIntentId = paymentIntentId; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
}