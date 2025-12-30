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
            
            // 2. Use Gemini to extract prices - Added STRICT formatting instructions
            String prompt = "Extract current cab fares from these search results: " + searchResponse + 
                            ". For " + from + " to " + to + ". RETURN ONLY A RAW JSON ARRAY. " +
                            "Use these keys: platform, price, type, eta. Do not include markdown or prose.";

            String aiRawResponse = callGemini(prompt);
            String cleanJson = sanitizeJson(aiRawResponse); // Clean the response
            
            JSONArray jsonArray = new JSONArray(cleanJson);

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
            System.err.println("Cab Discovery Error: " + e.getMessage());
            results.add(new CabResult("Uber", "Checking...", "Standard", "Live Update Pending"));
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
            
            // Added STRICT formatting instructions
            String prompt = "Analyze these search results for " + platform + 
                            " bundles in India: " + searchResponse + 
                            ". Compare direct price vs bundles (like Jio/Airtel). RETURN ONLY A RAW JSON ARRAY. " +
                            "Use these keys: platform, planName, price, bestDeal.";

            String aiRawResponse = callGemini(prompt);
            String cleanJson = sanitizeJson(aiRawResponse); // Clean the response
            
            JSONArray jsonArray = new JSONArray(cleanJson);

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
            System.err.println("Subscription Discovery Error: " + e.getMessage());
        }
        return results;
    }

    /**
     * HELPER: Sanitizes the AI response to extract only the JSON part.
     * Prevents "JSONArray text must start with [" error.
     */
    private String sanitizeJson(String input) {
        if (input.contains("```json")) {
            input = input.substring(input.indexOf("```json") + 7);
            input = input.substring(0, input.lastIndexOf("```"));
        } else if (input.contains("```")) {
            input = input.substring(input.indexOf("```") + 3);
            input = input.substring(0, input.lastIndexOf("```"));
        }
        return input.trim();
    }

    /**
     * HELPER: Calls Gemini API to process raw web data
     */
    private String callGemini(String prompt) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Sanitize the prompt for valid JSON transmission
        String escapedPrompt = prompt.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
        String requestBody = "{ \"contents\": [{ \"parts\": [{ \"text\": \"" + escapedPrompt + "\" }] }] }";

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