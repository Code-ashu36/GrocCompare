package com.example.groccompare.service;

import com.example.groccompare.model.CabResult;
import com.example.groccompare.model.SubscriptionResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.json.JSONObject;
import org.json.JSONArray;
import java.util.ArrayList;
import java.util.List;

@Service
public class DiscoveryService {

    @Value("${SERPAPI_KEY}")
    private String serpApiKey;

    @Value("${GEMINI_API_KEY}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * CAB COMPARISON LOGIC
     * Live search via SerpApi + Extraction via Gemini AI
     */
    public List<CabResult> getCabFares(String from, String to) {
        List<CabResult> results = new ArrayList<>();
        try {
            // 1. Get Live Search Data from SerpApi
            String serpUrl = "https://serpapi.com/search.json?q=Uber+Ola+Rapido+fare+from+" + 
                             from.replace(" ", "+") + "+to+" + to.replace(" ", "+") + 
                             "+India&api_key=" + serpApiKey;
            
            String searchResponse = restTemplate.getForObject(serpUrl, String.class);
            
            // 2. Use Gemini to extract prices from the search clutter
            String prompt = "Extract current cab fares from these search results: " + searchResponse + 
                            ". For " + from + " to " + to + ". Return only a JSON array of objects with keys: " +
                            "platform, price, type, eta. Do not include markdown formatting.";

            String aiResponse = callGemini(prompt);
            JSONArray jsonArray = new JSONArray(aiResponse);

            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject obj = jsonArray.getJSONObject(i);
                results.add(new CabResult(
                    obj.getString("platform"),
                    obj.getString("price"),
                    obj.getString("type"),
                    obj.getString("eta")
                ));
            }
        } catch (Exception e) {
            System.err.println("Discovery Error: " + e.getMessage());
            // Fallback to basic data if AI fails
            results.add(new CabResult("Uber", "Checking...", "Sedan", "Unknown"));
        }
        return results;
    }

    /**
     * SUBSCRIPTION BUNDLE LOGIC
     * Scans for hidden bundles (Jio, Airtel, etc.) using Gemini
     */
    public List<SubscriptionResult> getSubscriptionDeals(String platform) {
        List<SubscriptionResult> results = new ArrayList<>();
        try {
            String serpUrl = "https://serpapi.com/search.json?q=" + platform.replace(" ", "+") + 
                             "+subscription+bundles+India+Jio+Airtel+offers&api_key=" + serpApiKey;
            
            String searchResponse = restTemplate.getForObject(serpUrl, String.class);
            
            String prompt = "Analyze these search results for " + platform + 
                            " bundles in India: " + searchResponse + 
                            ". Compare direct price vs bundles (like Jio/Airtel). Return a JSON array with keys: " +
                            "platform, planName, price, bestDeal. Return only the array.";

            String aiResponse = callGemini(prompt);
            JSONArray jsonArray = new JSONArray(aiResponse);

            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject obj = jsonArray.getJSONObject(i);
                results.add(new SubscriptionResult(
                    obj.getString("platform"),
                    obj.getString("planName"),
                    obj.getString("price"),
                    obj.getString("bestDeal")
                ));
            }
        } catch (Exception e) {
            System.err.println("Subscription Error: " + e.getMessage());
        }
        return results;
    }

    /**
     * HELPER: Calls Gemini API to process raw web data
     */
    private String callGemini(String prompt) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String requestBody = "{ \"contents\": [{ \"parts\": [{ \"text\": \"" + prompt.replace("\"", "\\\"") + "\" }] }] }";

        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        JSONObject json = new JSONObject(response.getBody());
        return json.getJSONArray("candidates")
                   .getJSONObject(0)
                   .getJSONObject("content")
                   .getJSONArray("parts")
                   .getJSONObject(0)
                   .getString("text").trim();
    }
}