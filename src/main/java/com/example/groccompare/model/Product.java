package com.example.groccompare.model;

public record Product(
    String productId, 
    String productName, 
    String platformId, 
    double price, 
    double currentPrice,
    double normalizedPrice,
    String productLink,
    String priceStatus,
    String imageUrl // Added for image rendering
) {}