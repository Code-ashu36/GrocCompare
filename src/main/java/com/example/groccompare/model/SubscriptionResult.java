package com.example.groccompare.model;

public class SubscriptionResult {
    private String platform;  // Netflix, Prime
    private String planName;  // Family, Individual
    private String price;     // Monthly cost
    private String bestDeal;  // e.g., "Free with Airtel"

    // Constructor
    public SubscriptionResult(String platform, String planName, String price, String bestDeal) {
        this.platform = platform;
        this.planName = planName;
        this.price = price;
        this.bestDeal = bestDeal;
    }

    // Getters and Setters
    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }
    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }
    public String getPrice() { return price; }
    public void setPrice(String price) { this.price = price; }
    public String getBestDeal() { return bestDeal; }
    public void setBestDeal(String bestDeal) { this.bestDeal = bestDeal; }
}