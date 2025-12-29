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

    @GetMapping("/")
    public String index() { return "index"; }

    @GetMapping("/search")
    @ResponseBody
    public Map<String, Object> search(
            @RequestParam String query, 
            @RequestParam(defaultValue = "Delhi") String location,
            @RequestParam(defaultValue = "grocery") String category) {
        
        Map<String, Object> response = new HashMap<>();
        List<Product> results = new ArrayList<>();

        try {
            // STEP 1: Smart Query Modification based on Category
            String finalQuery = query;
            if (category.equalsIgnoreCase("cabs")) {
                finalQuery = query + " cab fare in " + location + " price";
            } else if (category.equalsIgnoreCase("subscriptions")) {
                finalQuery = query + " subscription plans India cost";
            } else if (category.equalsIgnoreCase("appliances")) {
                finalQuery = query + " appliance best price";
            }

            String encodedQuery = finalQuery.replace(" ", "+");
            String searchUrl = "https://serpapi.com/search.json?engine=google_shopping&q=" 
                                + encodedQuery + "&location=" + location.replace(" ", "+") + ",+India"
                                + "&gl=in&hl=en&api_key=" + API_KEY;

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder().uri(URI.create(searchUrl)).build();
            HttpResponse<String> apiResponse = client.send(request, HttpResponse.BodyHandlers.ofString());
            JSONObject jsonResponse = new JSONObject(apiResponse.body());

            if (jsonResponse.has("shopping_results")) {
                JSONArray shoppingResults = jsonResponse.getJSONArray("shopping_results");
                int limit = Math.min(shoppingResults.length(), 10);
                
                // Average calculation for the Trend Badge
                double total = 0;
                for (int i = 0; i < limit; i++) {
                    total += shoppingResults.getJSONObject(i).optDouble("extracted_price", 0.0);
                }
                double avg = total / limit;

                for (int i = 0; i < limit; i++) {
                    JSONObject item = shoppingResults.getJSONObject(i);
                    double price = item.optDouble("extracted_price", 0.0);
                    String title = item.optString("title", "Product");
                    
                    // Link Logic
                    String link = item.optString("link", item.optString("product_link", "#"));
                    if (!link.startsWith("http") && !link.equals("#")) link = "https://" + link;

                    // Badge Logic
                    String status = "Average";
                    if (price < avg * 0.9) status = "Low";
                    else if (price > avg * 1.1) status = "High";

                    results.add(new Product(
                        String.valueOf(i), title, item.optString("source", "Store"),
                        price, price, calculateNormalizedPrice(title, price),
                        link, status, item.optString("thumbnail", "https://via.placeholder.com/150")
                    ));
                }
            }
        } catch (Exception e) { e.printStackTrace(); }

        results.sort(Comparator.comparingDouble(Product::normalizedPrice));
        response.put("comparisonResults", results);
        return response;
    }

    private double calculateNormalizedPrice(String title, double price) {
        try {
            Pattern pattern = Pattern.compile("(\\d+\\.?\\d*)\\s*(kg|g|ml|l)", Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(title);
            if (matcher.find()) {
                double qty = Double.parseDouble(matcher.group(1));
                String unit = matcher.group(2).toLowerCase();
                return (unit.equals("g") || unit.equals("ml")) ? (price / qty) * 1000 : price / qty;
            }
        } catch (Exception e) {}
        return price;
    }
}