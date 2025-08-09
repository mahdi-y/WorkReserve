package com.workreserve.backend.room;

import com.workreserve.backend.room.DTO.RoomRequest;
import com.workreserve.backend.room.DTO.RoomResponse;
import com.workreserve.backend.activity.ActivityService;
import com.workreserve.backend.config.FileStorageService;
import com.workreserve.backend.timeslot.TimeSlotRepository;
import com.workreserve.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.List;
import java.util.Arrays;
import java.util.ArrayList;
import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private TimeSlotRepository timeSlotRepository;

    @Mock
    private ActivityService activityService;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private RoomService roomService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("test@example.com");
    }

    @Test
    void getAllRooms_returnsRoomResponses() {
        
        Room room = new Room();
        room.setId(1L);
        room.setName("Room A");
        room.setType(RoomType.CONFERENCE_ROOM);
        room.setPricePerHour(10.0);
        room.setCapacity(5);
        room.setDescription("Test room");
        room.setImageUrls(new ArrayList<>());

        when(roomRepository.findAll()).thenReturn(Arrays.asList(room));

        
        List<RoomResponse> result = roomService.getAllRooms();

        
        assertEquals(1, result.size());
        assertEquals("Room A", result.get(0).getName());
        assertEquals(RoomType.CONFERENCE_ROOM, result.get(0).getType());
        assertEquals(10.0, result.get(0).getPricePerHour());
        assertEquals(5, result.get(0).getCapacity());
    }

    @Test
    void getRoomById_found() {
        
        Room room = new Room();
        room.setId(1L);
        room.setName("Room A");
        room.setType(RoomType.CONFERENCE_ROOM);
        room.setPricePerHour(10.0);
        room.setCapacity(5);
        room.setDescription("Test room");
        room.setImageUrls(new ArrayList<>());

        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));

        
        RoomResponse result = roomService.getRoomById(1L);

        
        assertEquals("Room A", result.getName());
        assertEquals(RoomType.CONFERENCE_ROOM, result.getType());
    }

    @Test
    void getRoomById_notFound() {
        
        when(roomRepository.findById(1L)).thenReturn(Optional.empty());

        
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> roomService.getRoomById(1L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        assertEquals("Room not found", ex.getReason());
    }

    @Test
    void createRoom_success() {
        
        RoomRequest req = new RoomRequest();
        req.setName("Room B");
        req.setType(RoomType.HOT_DESK);
        req.setPricePerHour(20.0);
        req.setCapacity(10);
        req.setDescription("New room");
        req.setImageUrls(new ArrayList<>());

        Room saved = new Room();
        saved.setId(2L);
        saved.setName("Room B");
        saved.setType(RoomType.HOT_DESK);
        saved.setPricePerHour(20.0);
        saved.setCapacity(10);
        saved.setDescription("New room");
        saved.setImageUrls(new ArrayList<>());

        when(roomRepository.findAll()).thenReturn(new ArrayList<>()); 
        when(roomRepository.save(any(Room.class))).thenReturn(saved);
        doNothing().when(activityService).logActivity(anyString(), anyString(), anyString(), anyLong(), anyString());

        
        RoomResponse result = roomService.createRoom(req);

        
        assertEquals("Room B", result.getName());
        assertEquals(RoomType.HOT_DESK, result.getType());
        assertEquals(20.0, result.getPricePerHour());
        verify(roomRepository).save(any(Room.class));
        verify(activityService).logActivity(eq("test@example.com"), contains("New room created"), eq("ROOM"), eq(2L), eq("Room B"));
    }

    @Test
    void createRoom_duplicateName() {
        
        RoomRequest req = new RoomRequest();
        req.setName("Existing Room");
        req.setType(RoomType.HOT_DESK);
        req.setPricePerHour(20.0);
        req.setCapacity(10);

        Room existingRoom = new Room();
        existingRoom.setId(1L);
        existingRoom.setName("Existing Room");

        when(roomRepository.findAll()).thenReturn(Arrays.asList(existingRoom));

        
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> roomService.createRoom(req));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals("A room with this name already exists.", ex.getReason());
    }

    @Test
    void updateRoom_success() {
        
        RoomRequest req = new RoomRequest();
        req.setName("Room C");
        req.setType(RoomType.DEDICATED_DESK);
        req.setPricePerHour(30.0);
        req.setCapacity(8);
        req.setDescription("Updated room");
        req.setImageUrls(Arrays.asList("image1.jpg", "image2.jpg"));

        Room existing = new Room();
        existing.setId(3L);
        existing.setName("Old Name");
        existing.setType(RoomType.CONFERENCE_ROOM);
        existing.setPricePerHour(15.0);
        existing.setCapacity(5);
        existing.setImageUrls(Arrays.asList("old_image.jpg"));

        when(roomRepository.findById(3L)).thenReturn(Optional.of(existing));
        when(roomRepository.findAll()).thenReturn(Arrays.asList(existing)); 
        when(roomRepository.save(any(Room.class))).thenReturn(existing);
        doNothing().when(activityService).logActivity(anyString(), anyString(), anyString(), anyLong(), anyString());
        doNothing().when(fileStorageService).deleteFile(anyString());

        
        RoomResponse result = roomService.updateRoom(3L, req);

        
        assertEquals("Room C", result.getName());
        assertEquals(RoomType.DEDICATED_DESK, result.getType());
        assertEquals(30.0, result.getPricePerHour());
        verify(roomRepository).save(any(Room.class));
        verify(activityService).logActivity(eq("test@example.com"), contains("Room updated"), eq("ROOM"), eq(3L), eq("Room C"));
        verify(fileStorageService).deleteFile("old_image.jpg"); 
    }

    @Test
    void updateRoom_notFound() {
        
        RoomRequest req = new RoomRequest();
        req.setName("Non-existent Room");
        
        when(roomRepository.findById(99L)).thenReturn(Optional.empty());

        
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> roomService.updateRoom(99L, req));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        assertEquals("Room not found", ex.getReason());
    }

    @Test
    void updateRoom_duplicateName() {
        
        RoomRequest req = new RoomRequest();
        req.setName("Another Room");

        Room existing = new Room();
        existing.setId(1L);
        existing.setName("Current Room");

        Room anotherRoom = new Room();
        anotherRoom.setId(2L);
        anotherRoom.setName("Another Room");

        when(roomRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(roomRepository.findAll()).thenReturn(Arrays.asList(existing, anotherRoom));

        
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> roomService.updateRoom(1L, req));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals("A room with this name already exists.", ex.getReason());
    }

    @Test
    void deleteRoom_success() {
        
        Room room = new Room();
        room.setId(1L);
        room.setName("Room to Delete");
        room.setImageUrls(Arrays.asList("image1.jpg", "image2.jpg"));

        when(roomRepository.findById(1L)).thenReturn(Optional.of(room)); 
        doNothing().when(roomRepository).deleteById(1L);
        doNothing().when(activityService).logActivity(anyString(), anyString(), anyString(), anyLong(), anyString());
        doNothing().when(fileStorageService).deleteFile(anyString());

        
        assertDoesNotThrow(() -> roomService.deleteRoom(1L));

        
        verify(roomRepository).deleteById(1L);
        verify(activityService).logActivity(eq("test@example.com"), contains("Room deleted"), eq("ROOM"), eq(1L), eq("Room to Delete"));
        verify(fileStorageService, times(2)).deleteFile(anyString()); 
    }

    @Test
    void deleteRoom_notFound() {
        
        when(roomRepository.findById(99L)).thenReturn(Optional.empty()); 

        
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> roomService.deleteRoom(99L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        assertEquals("Room not found", ex.getReason());
    }

    @Test
    void getAvailableRooms_success() {
        
        LocalDate date = LocalDate.now().plusDays(1);
        LocalTime startTime = LocalTime.of(9, 0);
        LocalTime endTime = LocalTime.of(10, 0);

        Room room = new Room();
        room.setId(1L);
        room.setName("Available Room");
        room.setType(RoomType.CONFERENCE_ROOM);
        room.setPricePerHour(25.0);
        room.setCapacity(8);
        room.setImageUrls(new ArrayList<>());

        when(timeSlotRepository.findAvailableRooms(date, startTime, endTime))
                .thenReturn(Arrays.asList(room));

        
        List<RoomResponse> result = roomService.getAvailableRooms(date, startTime, endTime);

        
        assertEquals(1, result.size());
        assertEquals("Available Room", result.get(0).getName());
        verify(timeSlotRepository).findAvailableRooms(date, startTime, endTime);
    }
}
