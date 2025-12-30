package com.example.groccompare.controller;

import com.example.groccompare.model.CabResult;
import com.example.groccompare.model.SubscriptionResult;
import com.example.groccompare.service.DiscoveryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allows local testing across different ports
public class DiscoveryController {

    @Autowired
    private DiscoveryService discoveryService;

    /**
     * Endpoint for Cab Comparison
     * Handles requests from app.js: fetch('/api/cabs/compare?from=...&to=...')
     */
    @GetMapping("/cabs/compare")
    public List<CabResult> compareCabs(@RequestParam String from, @RequestParam String to) {
        try {
            return discoveryService.getCabFares(from, to);
        } catch (Exception e) {
            System.err.println("Controller Error (Cabs): " + e.getMessage());
            return new ArrayList<>(); // Return empty list to keep frontend stable
        }
    }

    /**
     * Endpoint for Subscription Deals
     * Handles requests from app.js: fetch('/api/subs/compare?query=...')
     */
    @GetMapping("/subs/compare")
    public List<SubscriptionResult> compareSubs(@RequestParam String query) {
        try {
            return discoveryService.getSubscriptionDeals(query);
        } catch (Exception e) {
            System.err.println("Controller Error (Subs): " + e.getMessage());
            return new ArrayList<>(); // Return empty list to keep frontend stable
        }
    }
}