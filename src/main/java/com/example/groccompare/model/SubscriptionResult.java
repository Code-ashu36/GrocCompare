package com.example.groccompare.model;

/**
 * Model representing a Subscription platform result.
 * Updated to ensure compatibility with JSON parsing from AI responses.
 */
public class SubscriptionResult {
    private String platform;  // e.g., Netflix, Amazon Prime
    private String planName;  // e.g., Family, Individual, Basic
    private String price;     // e.g., ₹199/mo
    private String bestDeal;  // e.g., "Included with Jio Plan" or "true"

    // Default Constructor (Required for certain JSON frameworks)
    public SubscriptionResult() {}

    // Parameterized Constructor
    public SubscriptionResult(String platform, String planName, String price, String bestDeal) {
        this.platform = platform;
        this.planName = planName;
        this.price = price;
        this.bestDeal = bestDeal;
    }

    // Getters and Setters
    public String getPlatform() { 
        return platform; 
    }
    
    public void setPlatform(String platform) { 
        this.platform = platform; 
    }

    public String getPlanName() { 
        return planName; 
    }
    
    public void setPlanName(String planName) { 
        this.planName = planName; 
    }

    public String getPrice() { 
        return price; 
    }
    
    public void setPrice(String price) { 
        this.price = price; 
    }

    public String getBestDeal() { 
        return bestDeal; 
    }
    
    public void setBestDeal(String bestDeal) { 
        this.bestDeal = bestDeal; 
    }
}