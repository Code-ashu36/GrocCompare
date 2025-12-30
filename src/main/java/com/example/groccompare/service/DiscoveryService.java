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

    @Value("${GEMINI_KEY}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * CAB COMPARISON LOGIC
     * Uses robust extraction to handle conversational AI responses.
     */
    public List<CabResult> getCabFares(String from, String to) {
    List<CabResult> results = new ArrayList<>();
    try {
        // IMPROVED URL: Targets pricing estimates and calculators for better snippets
        String serpUrl = "https://serpapi.com/search.json?q=Uber+Ola+fare+estimate+from+" + 
                         from.replace(" ", "+") + "+to+" + to.replace(" ", "+") + 
                         "+India+price+per+km&api_key=" + serpApiKey;
        
        String searchResponse = restTemplate.getForObject(serpUrl, String.class);
        
        // IMPROVED PROMPT: Forces numeric estimates and forbids vague "Use estimator" text
        String prompt = "Search results context: " + searchResponse + 
                        "\nTask: Extract specific cab fares for a ride from " + from + " to " + to + "." +
                        "\nRules:" +
                        "\n1. If a specific fare is found in the snippets, extract it. Remove any existing Currency symbols." +
                        "\n2. If NO specific fare is found, calculate a numeric estimate based on standard India rates (~₹18/km)." +
                        "\n3. NEVER return vague text like 'Use price estimator'. Return a numeric range or price." +
                        "\n4. If data is totally missing, provide a logical estimate based on typical distance." +
                        "\nRETURN ONLY A RAW JSON ARRAY with keys: platform, price, type, eta.";

        String aiRawResponse = callGemini(prompt);
        
        // FIXED: Sanitizes the response to find the start of the JSON array
        String cleanJson = sanitizeJson(aiRawResponse); 
        
        JSONArray jsonArray = new JSONArray(cleanJson);

        for (int i = 0; i < jsonArray.length(); i++) {
            JSONObject obj = jsonArray.getJSONObject(i);
            
            // FIXED: Using optString and String.valueOf to prevent type crashes
            results.add(new CabResult(
                obj.optString("platform", "Cab Provider"),
                String.valueOf(obj.get("price")), 
                obj.optString("type", "Standard"),
                obj.optString("eta", "Check app")
            ));
        }
    } catch (Exception e) {
        System.err.println("Cab Discovery Error: " + e.getMessage());
        results.add(new CabResult("Uber", "Checking...", "Standard", "Update Pending"));
    }
    return results;
}

    /**
     * SUBSCRIPTION BUNDLE LOGIC
     * Handles mixed data types (Booleans/Strings) from AI responses.
     */
    public List<SubscriptionResult> getSubscriptionDeals(String platform) {
        List<SubscriptionResult> results = new ArrayList<>();
        try {
            String serpUrl = "https://serpapi.com/search.json?q=" + platform.replace(" ", "+") + 
                             "+subscription+bundles+India+Jio+Airtel+offers+price+list&api_key=" + serpApiKey;
            
            String searchResponse = restTemplate.getForObject(serpUrl, String.class);
            
            // IMPROVED PROMPT: Prevents 'Not Specified' and extracts clear pricing logic
            String prompt = "Analyze results for " + platform + " bundles in India: " + searchResponse + 
                            "\nRules:" +
                            "\n1. If specific price is found (e.g. 199, 1499), extract it. Remove Currency symbols." +
                            "\n2. If no price is found, look for typical bundle pricing in the text snippets." +
                            "\n3. If STILL no price is found, DO NOT write 'Not specified'. Write 'See Site' or 'Plan Variable'." +
                            "\n4. RETURN ONLY A RAW JSON ARRAY. Keys: platform, planName, price, bestDeal.";

            String aiRawResponse = callGemini(prompt);
            String cleanJson = sanitizeJson(aiRawResponse);
            
            JSONArray jsonArray = new JSONArray(cleanJson);

            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject obj = jsonArray.getJSONObject(i);
                // FIXED: Using String.valueOf() to handle boolean 'true' vs string 'true'
                results.add(new SubscriptionResult(
                    obj.optString("platform", platform),
                    obj.optString("planName", "Standard Plan"),
                    obj.optString("price", "Check App"),
                    String.valueOf(obj.get("bestDeal")) 
                ));
            }
        } catch (Exception e) {
            System.err.println("Subscription Discovery Error: " + e.getMessage());
        }
        return results;
    }

    /**
     * STRENGTHENED SANITIZER:
     * Extracts only the content inside [] brackets, ignoring AI conversational text.
     */
    private String sanitizeJson(String input) {
        if (input == null) return "[]";
        int start = input.indexOf("[");
        int end = input.lastIndexOf("]");
        if (start != -1 && end != -1 && end > start) {
            return input.substring(start, end + 1);
        }
        return "[]";
    }

    private String callGemini(String prompt) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=" + geminiApiKey;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

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