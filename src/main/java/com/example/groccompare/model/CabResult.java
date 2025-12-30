package com.example.groccompare.model;

public class CabResult {
    private String platform; // Uber, Ola, etc.
    private String price;    // e.g., ₹250
    private String type;     // e.g., Sedan, Bike
    private String eta;      // e.g., 5 mins

    // Constructor
    public CabResult(String platform, String price, String type, String eta) {
        this.platform = platform;
        this.price = price;
        this.type = type;
        this.eta = eta;
    }

    // Getters and Setters
    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }
    public String getPrice() { return price; }
    public void setPrice(String price) { this.price = price; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getEta() { return eta; }
    public void setEta(String eta) { this.eta = eta; }
}