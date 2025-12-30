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

    // This now reads your GROQ_API_KEY from Railway
    @Value("${GROQ_API_KEY}")
    private String groqApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * CAB COMPARISON LOGIC
     */
    public List<CabResult> getCabFares(String from, String to) {
        List<CabResult> results = new ArrayList<>();
        try {
            String serpUrl = "https://serpapi.com/search.json?q=Uber+Ola+fare+estimate+from+" + 
                             from.replace(" ", "+") + "+to+" + to.replace(" ", "+") + 
                             "+India+price+per+km&api_key=" + serpApiKey;
            
            String searchResponse = restTemplate.getForObject(serpUrl, String.class);
            
            String prompt = "Search results context: " + searchResponse + 
                            "\nTask: Extract specific cab fares for a ride from " + from + " to " + to + "." +
                            "\nRules:" +
                            "\n1. If a specific fare is found in the snippets, extract it. Remove any existing Currency symbols." +
                            "\n2. If NO specific fare is found, calculate a numeric estimate based on standard India rates (~₹18/km)." +
                            "\n3. NEVER return vague text like 'Use price estimator'. Return a numeric range or price." +
                            "\n4. If data is totally missing, provide a logical estimate based on typical distance." +
                            "\nRETURN ONLY A RAW JSON ARRAY with keys: platform, price, type, eta.";

            // Updated to use Groq
            String aiRawResponse = callGroq(prompt);
            
            String cleanJson = sanitizeJson(aiRawResponse); 
            JSONArray jsonArray = new JSONArray(cleanJson);

            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject obj = jsonArray.getJSONObject(i);
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
     */
    public List<SubscriptionResult> getSubscriptionDeals(String platform) {
        List<SubscriptionResult> results = new ArrayList<>();
        try {
            String serpUrl = "https://serpapi.com/search.json?q=" + platform.replace(" ", "+") + 
                             "+subscription+bundles+India+Jio+Airtel+offers+price+list&api_key=" + serpApiKey;
            
            String searchResponse = restTemplate.getForObject(serpUrl, String.class);
            
            String prompt = "Analyze results for " + platform + " bundles in India: " + searchResponse + 
                            "\nRules:" +
                            "\n1. If specific price is found (e.g. 199, 1499), extract it. Remove Currency symbols." +
                            "\n2. If no price is found, look for typical bundle pricing in the text snippets." +
                            "\n3. If STILL no price is found, DO NOT write 'Not specified'. Write 'See Site' or 'Plan Variable'." +
                            "\n4. RETURN ONLY A RAW JSON ARRAY. Keys: platform, planName, price, bestDeal.";

            // Updated to use Groq
            String aiRawResponse = callGroq(prompt);
            String cleanJson = sanitizeJson(aiRawResponse);
            
            JSONArray jsonArray = new JSONArray(cleanJson);

            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject obj = jsonArray.getJSONObject(i);
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
     * STRENGTHENED SANITIZER
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

    /**
     * GROQ API IMPLEMENTATION
     */
    private String callGroq(String prompt) {
        String url = "https://api.groq.com/openai/v1/chat/completions";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        // Constructing OpenAI-compatible JSON request
        JSONObject requestBody = new JSONObject();
        requestBody.put("model", "llama-3.3-70b-versatile");
        
        JSONArray messages = new JSONArray();
        JSONObject message = new JSONObject();
        message.put("role", "user");
        message.put("content", prompt);
        messages.put(message);
        
        requestBody.put("messages", messages);

        HttpEntity<String> entity = new HttpEntity<>(requestBody.toString(), headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        // Parsing Groq response
        JSONObject json = new JSONObject(response.getBody());
        return json.getJSONArray("choices")
                   .getJSONObject(0)
                   .getJSONObject("message")
                   .getString("content").trim();
    }
}