package com.workreserve.backend.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager cacheManager = new SimpleCacheManager();
        
        cacheManager.setCaches(Arrays.asList(
            
            buildCache("rooms", 1000, 30), 
            buildCache("users", 500, 15),  
            
            
            buildCache("timeslots", 2000, 10),           
            buildCache("room-timeslots", 1000, 10),      
            buildCache("daterange-timeslots", 1000, 10), 
            
            
            buildCache("available-timeslots", 500, 5),   
            buildCache("reservations", 1000, 5),         
            buildCache("user-reservations", 500, 5),     
            buildCache("current-user", 100, 10)          
        ));
        
        return cacheManager;
    }
    
    private CaffeineCache buildCache(String name, int maximumSize, int minutesToExpire) {
        return new CaffeineCache(name, Caffeine.newBuilder()
                .maximumSize(maximumSize)
                .expireAfterWrite(minutesToExpire, TimeUnit.MINUTES)
                .recordStats() 
                .build());
    }
}