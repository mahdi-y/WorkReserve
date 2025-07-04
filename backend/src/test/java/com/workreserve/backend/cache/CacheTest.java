package com.workreserve.backend.cache;

import com.workreserve.backend.room.RoomService;
import com.workreserve.backend.room.Room;
import com.workreserve.backend.room.RoomRepository;
import com.workreserve.backend.room.RoomType;
import com.workreserve.backend.timeslot.TimeSlotService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class CacheTest {

    @Autowired
    private RoomService roomService;

    @Autowired
    private TimeSlotService timeSlotService;

    @Autowired
    private CacheManager cacheManager;

    @Autowired
    private RoomRepository roomRepository;

    @SuppressWarnings("unchecked")
    @BeforeEach
    void setUp() {
        
        cacheManager.getCacheNames().forEach(cacheName -> {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                
                cache.clear();
                
                
                Object nativeCache = cache.getNativeCache();
                if (nativeCache instanceof com.github.benmanes.caffeine.cache.Cache) {
                    ((com.github.benmanes.caffeine.cache.Cache<Object, Object>) nativeCache).invalidateAll();
                }
            }
        });
        
        
        try {
            Thread.sleep(10);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    @Test
    void testRoomsCaching() {
        
        Room room = new Room();
        room.setName("Test Cache Room");
        room.setType(RoomType.HOT_DESK);
        room.setPricePerHour(10.0);
        room.setCapacity(2);
        roomRepository.save(room);

        
        var rooms1 = roomService.getAllRooms();
        
        
        Cache roomsCache = cacheManager.getCache("rooms");
        assertNotNull(roomsCache);
        
        
        @SuppressWarnings("unchecked")
        com.github.benmanes.caffeine.cache.Cache<Object, Object> nativeCache = 
            (com.github.benmanes.caffeine.cache.Cache<Object, Object>) roomsCache.getNativeCache();
        assertTrue(nativeCache.estimatedSize() > 0, "Cache should contain entries after first call");

        
        var rooms2 = roomService.getAllRooms();
        
        
        assertEquals(rooms1.size(), rooms2.size());
        
        
        assertTrue(nativeCache.stats().hitCount() > 0, "Cache should have recorded hits");
    }

    @Test
    void testCacheEviction() {
        
        Room room = new Room();
        room.setName("Test Eviction Room");
        room.setType(RoomType.CONFERENCE_ROOM);
        room.setPricePerHour(20.0);
        room.setCapacity(8);
        Room savedRoom = roomRepository.save(room);

        
        var initialRooms = roomService.getAllRooms();
        
        Cache roomsCache = cacheManager.getCache("rooms");
        assertNotNull(roomsCache);
        
        @SuppressWarnings("unchecked")
        com.github.benmanes.caffeine.cache.Cache<Object, Object> nativeCache = 
            (com.github.benmanes.caffeine.cache.Cache<Object, Object>) roomsCache.getNativeCache();
        
        
        assertTrue(nativeCache.estimatedSize() > 0, "Cache should have entries before update");
        long initialCacheSize = nativeCache.estimatedSize();

        
        com.workreserve.backend.room.DTO.RoomRequest updateReq = new com.workreserve.backend.room.DTO.RoomRequest();
        updateReq.setName("Updated Room Name");
        updateReq.setType(RoomType.CONFERENCE_ROOM);
        updateReq.setPricePerHour(25.0);
        updateReq.setCapacity(10);
        
        roomService.updateRoom(savedRoom.getId(), updateReq);

        
        assertEquals(0L, nativeCache.estimatedSize(), "Cache should be empty after update (cache eviction)");

        
        var updatedRooms = roomService.getAllRooms();
        
        
        assertTrue(nativeCache.estimatedSize() > 0, "Cache should have entries after repopulation");
        
        
        boolean foundUpdatedRoom = updatedRooms.stream()
                .anyMatch(r -> "Updated Room Name".equals(r.getName()));
        assertTrue(foundUpdatedRoom, "Updated room should be present in results");
    }

    @Test
    void testTimeSlotsCaching() {
        
        var timeSlots1 = timeSlotService.getAllTimeSlots();
        
        Cache timeSlotsCache = cacheManager.getCache("timeslots");
        assertNotNull(timeSlotsCache);
        
        @SuppressWarnings("unchecked")
        com.github.benmanes.caffeine.cache.Cache<Object, Object> nativeCache = 
            (com.github.benmanes.caffeine.cache.Cache<Object, Object>) timeSlotsCache.getNativeCache();
        
        
        long cacheSize = nativeCache.estimatedSize();
        
        var timeSlots2 = timeSlotService.getAllTimeSlots();
        assertEquals(timeSlots1.size(), timeSlots2.size());
        
        
        if (!timeSlots1.isEmpty()) {
            assertTrue(nativeCache.stats().hitCount() > 0, "Cache should have recorded hits for time slots");
        }
    }

    @Test
    void testCacheStatistics() {
        
        Room room = new Room();
        room.setName("Stats Test Room");
        room.setType(RoomType.HOT_DESK);
        room.setPricePerHour(15.0);
        room.setCapacity(4);
        roomRepository.save(room);

        Cache roomsCache = cacheManager.getCache("rooms");
        assertNotNull(roomsCache);
        
        @SuppressWarnings("unchecked")
        com.github.benmanes.caffeine.cache.Cache<Object, Object> nativeCache = 
            (com.github.benmanes.caffeine.cache.Cache<Object, Object>) roomsCache.getNativeCache();

        
        nativeCache.invalidateAll();
        
        
        long initialHitCount = nativeCache.stats().hitCount();
        long initialMissCount = nativeCache.stats().missCount();

        
        roomService.getAllRooms();
        
        
        assertEquals(initialMissCount + 1, nativeCache.stats().missCount(), 
            "Should have one more miss after first call");
        assertEquals(initialHitCount, nativeCache.stats().hitCount(), 
            "Hit count should not change after first call");

        
        roomService.getAllRooms();
        
        
        assertEquals(initialHitCount + 1, nativeCache.stats().hitCount(), 
            "Should have one more hit after second call");
        assertEquals(initialMissCount + 1, nativeCache.stats().missCount(), 
            "Miss count should not change after second call");
        
        
        assertTrue(nativeCache.stats().hitRate() > 0, 
            "Hit rate should be greater than 0");
    }
}