package com.workreserve.backend.cache;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.web.bind.annotation.*;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/cache")
public class CacheTestController {

    @Autowired
    private CacheManager cacheManager;

    @SuppressWarnings("unchecked")
    @GetMapping("/info")
    public Map<String, Object> getCacheInfo() {
        Map<String, Object> cacheInfo = new HashMap<>();
        Collection<String> cacheNames = cacheManager.getCacheNames();
        
        for (String cacheName : cacheNames) {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                com.github.benmanes.caffeine.cache.Cache<Object, Object> nativeCache = 
                    (com.github.benmanes.caffeine.cache.Cache<Object, Object>) cache.getNativeCache();
                
                Map<String, Object> stats = new HashMap<>();
                stats.put("size", nativeCache.estimatedSize());
                stats.put("hitCount", nativeCache.stats().hitCount());
                stats.put("missCount", nativeCache.stats().missCount());
                stats.put("hitRate", String.format("%.2f%%", nativeCache.stats().hitRate() * 100));
                
                cacheInfo.put(cacheName, stats);
            }
        }
        
        return cacheInfo;
    }

    @DeleteMapping("/clear")
    public Map<String, String> clearAllCaches() {
        cacheManager.getCacheNames().forEach(cacheName -> {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.clear();
            }
        });
        return Map.of("message", "All caches cleared");
    }

    @DeleteMapping("/clear/{cacheName}")
    public Map<String, String> clearSpecificCache(@PathVariable String cacheName) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.clear();
            return Map.of("message", "Cache '" + cacheName + "' cleared");
        }
        return Map.of("error", "Cache '" + cacheName + "' not found");
    }
}