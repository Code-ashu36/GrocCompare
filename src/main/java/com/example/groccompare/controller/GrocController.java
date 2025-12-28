package com.example.groccompare.controller;

import com.example.groccompare.model.Product;
import org.springframework.web.bind.annotation.*;
import org.springframework.stereotype.Controller;
import org.json.JSONArray;
import org.json.JSONObject;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Controller
public class GrocController {

    private final String API_KEY = "b2ee0f453dc636c7c9cb8deb537212f8037765332a606ef4635535a45c4f9cfa";

    @GetMapping("/")
    public String index() { 
        return "index"; 
    }

    @GetMapping("/search")
    @ResponseBody
    public Map<String, Object> search(@RequestParam String query, @RequestParam(defaultValue = "Delhi") String location) {
        Map<String, Object> response = new HashMap<>();
        List<Product> results = new ArrayList<>();

        try {
            String searchUrl = "https://serpapi.com/search.json?engine=google_shopping&q=" 
                                + query.replace(" ", "+") 
                                + "&location=" + location.replace(" ", "+") + ",+India"
                                + "&gl=in&hl=en&api_key=" + API_KEY;

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder().uri(URI.create(searchUrl)).build();
            
            HttpResponse<String> apiResponse = client.send(request, HttpResponse.BodyHandlers.ofString());
            JSONObject jsonResponse = new JSONObject(apiResponse.body());

            if (jsonResponse.has("shopping_results")) {
                JSONArray shoppingResults = jsonResponse.getJSONArray("shopping_results");
                int count = Math.min(shoppingResults.length(), 10);
                
                // Step 1: Calculate average price for trend logic
                double totalSum = 0;
                for (int i = 0; i < count; i++) {
                    totalSum += shoppingResults.getJSONObject(i).optDouble("extracted_price", 0.0);
                }
                double averagePrice = (count > 0) ? (totalSum / count) : 0.0;

                // Step 2: Build the list with fixed links
                for (int i = 0; i < count; i++) {
                    JSONObject item = shoppingResults.getJSONObject(i);
                    double currentItemPrice = item.optDouble("extracted_price", 0.0);
                    String title = item.optString("title", "Unknown Product");

                    // FIX: Ensure the link is pulled correctly and made absolute
                    String rawLink = item.optString("link", "");
                    String absoluteLink = rawLink;
                    if (!rawLink.isEmpty() && !rawLink.startsWith("http")) {
                        absoluteLink = "https://" + rawLink;
                    } else if (rawLink.isEmpty()) {
                        absoluteLink = "#";
                    }

                    // Price Trend Logic
                    String status = "Average";
                    if (averagePrice > 0) {
                        if (currentItemPrice < (averagePrice * 0.9)) status = "Low";
                        else if (currentItemPrice > (averagePrice * 1.1)) status = "High";
                    }

                    // Map all fields to the Product record
                    results.add(new Product(
                        String.valueOf(i), 
                        title, 
                        item.optString("source", "Unknown Store"), 
                        currentItemPrice, 
                        currentItemPrice,
                        calculateNormalizedPrice(title, currentItemPrice),
                        absoluteLink, // This MUST go here to reach app.js
                        status
                    ));
                }
            }
        } catch (Exception e) {
            System.err.println("Search Error: " + e.getMessage());
        }

        results.sort(Comparator.comparingDouble(Product::normalizedPrice));
        response.put("searchQuery", query);
        response.put("comparisonResults", results);
        if (!results.isEmpty()) response.put("globalBestDeal", results.get(0));
        
        return response;
    }

    private double calculateNormalizedPrice(String title, double price) {
        if (price <= 0) return 0.0;
        try {
            Pattern pattern = Pattern.compile("(\\d+\\.?\\d*)\\s*(kg|g|ml|l)", Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(title);
            if (matcher.find()) {
                double quantity = Double.parseDouble(matcher.group(1));
                String unit = matcher.group(2).toLowerCase();
                if (unit.equals("g") || unit.equals("ml")) {
                    return (price / quantity) * 1000;
                } else {
                    return price / quantity;
                }
            }
        } catch (Exception e) { return price; }
        return price;
    }
}