package com.example.groccompare.controller;

import com.example.groccompare.model.Product;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${SERPAPI_KEY}")
    private String API_KEY;

    // This MUST match the name in your Railway dashboard
    @Value("${GEMINI_API_KEY}") 
    private String GEMINI_API_KEY;

    @GetMapping("/")
    public String index() { return "index"; }

    @GetMapping("/search")
    @ResponseBody
    public Map<String, Object> search(@RequestParam String query, @RequestParam(defaultValue = "Delhi") String location) {
        Map<String, Object> response = new HashMap<>();
        List<Product> results = new ArrayList<>();
        try {
            String encodedQuery = query.replace(" ", "+");
            String encodedLocation = location.replace(" ", "+");
            String searchUrl = "https://serpapi.com/search.json?engine=google_shopping&q=" + encodedQuery 
                                + "&location=" + encodedLocation + ",+India&gl=in&hl=en&api_key=" + API_KEY;

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder().uri(URI.create(searchUrl)).build();
            HttpResponse<String> apiResponse = client.send(request, HttpResponse.BodyHandlers.ofString());
            JSONObject jsonResponse = new JSONObject(apiResponse.body());

            if (jsonResponse.has("shopping_results")) {
                JSONArray shoppingResults = jsonResponse.getJSONArray("shopping_results");
                int count = Math.min(shoppingResults.length(), 10);
                double totalSum = 0;
                for (int i = 0; i < count; i++) {
                    totalSum += shoppingResults.getJSONObject(i).optDouble("extracted_price", 0.0);
                }
                double averagePrice = (count > 0) ? (totalSum / count) : 0.0;

                for (int i = 0; i < count; i++) {
                    JSONObject item = shoppingResults.getJSONObject(i);
                    double currentItemPrice = item.optDouble("extracted_price", 0.0);
                    String title = item.optString("title", "Unknown Product");
                    String imageUrl = item.optString("thumbnail", "https://via.placeholder.com/150");

                    String rawLink = item.optString("link", item.optString("product_link", ""));
                    String absoluteLink = rawLink.isEmpty() ? "#" : (rawLink.startsWith("http") ? rawLink : "https://" + rawLink);

                    String status = (averagePrice > 0 && currentItemPrice < (averagePrice * 0.9)) ? "Low" : 
                                   (averagePrice > 0 && currentItemPrice > (averagePrice * 1.1)) ? "High" : "Average";

                    results.add(new Product(String.valueOf(i), title, item.optString("source", "Unknown Store"), 
                                          currentItemPrice, currentItemPrice, calculateNormalizedPrice(title, currentItemPrice),
                                          absoluteLink, status, imageUrl));
                }
            }
        } catch (Exception e) { System.err.println("Search Error: " + e.getMessage()); }
        results.sort(Comparator.comparingDouble(Product::normalizedPrice));
        response.put("comparisonResults", results);
        if (!results.isEmpty()) response.put("globalBestDeal", results.get(0));
        return response;
    }

    @PostMapping("/chat")
    @ResponseBody
    public Map<String, String> chat(@RequestBody Map<String, String> payload) {
        String userMsg = payload.get("message");
        
        // Security check for the key
        if (GEMINI_API_KEY == null || GEMINI_API_KEY.isEmpty()) {
            return Map.of("reply", "Error: GEMINI_API_KEY variable is missing in Railway settings.");
        }

        String geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY;
        
        try {
            // Updated JSON structure for Gemini 1.5
            JSONObject body = new JSONObject();
            JSONArray contents = new JSONArray();
            JSONObject part = new JSONObject().put("text", "You are the GrocCompare AI assistant. Help the user save money on groceries. User asks: " + userMsg);
            contents.put(new JSONObject().put("parts", new JSONArray().put(part)));
            body.put("contents", contents);

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(geminiUrl))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body.toString()))
                .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            JSONObject resJson = new JSONObject(response.body());
            
            // Precise navigation of Gemini's response object
            String aiReply = resJson.getJSONArray("candidates")
                                   .getJSONObject(0)
                                   .getJSONObject("content")
                                   .getJSONArray("parts")
                                   .getJSONObject(0)
                                   .getString("text");

            return Map.of("reply", aiReply);
        } catch (Exception e) { 
            e.printStackTrace(); 
            return Map.of("reply", "AI Error: Check Railway logs for details. Mismatched key or API quota exceeded."); 
        }
    }

    private double calculateNormalizedPrice(String title, double price) {
        if (price <= 0) return 0.0;
        try {
            Pattern pattern = Pattern.compile("(\\d+\\.?\\d*)\\s*(kg|g|ml|l)", Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(title);
            if (matcher.find()) {
                double qty = Double.parseDouble(matcher.group(1));
                String unit = matcher.group(2).toLowerCase();
                return (unit.equals("g") || unit.equals("ml")) ? (price / qty) * 1000 : price / qty;
            }
        } catch (Exception e) { return price; }
        return price;
    }
}