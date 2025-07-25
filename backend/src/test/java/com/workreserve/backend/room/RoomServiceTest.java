package com.workreserve.backend.room;

import com.workreserve.backend.activity.ActivityService;
import com.workreserve.backend.room.DTO.RoomRequest;
import com.workreserve.backend.room.DTO.RoomResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.List;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;
    @Mock
    private ActivityService activityService;

    @InjectMocks
    private RoomService roomService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        // Set the activityService field using reflection since it's @Autowired
        ReflectionTestUtils.setField(roomService, "activityService", activityService);
    }

    @Test
    void getAllRooms_returnsRoomResponses() {
        Room room = new Room();
        room.setId(1L);
        room.setName("Room A");
        room.setType(RoomType.CONFERENCE_ROOM);
        room.setPricePerHour(10.0);
        room.setCapacity(5);

        when(roomRepository.findAll()).thenReturn(Arrays.asList(room));

        List<RoomResponse> result = roomService.getAllRooms();

        assertEquals(1, result.size());
        assertEquals("Room A", result.get(0).getName());
    }

    @Test
    void getRoomById_found() {
        Room room = new Room();
        room.setId(1L);
        room.setName("Room A");
        room.setType(RoomType.CONFERENCE_ROOM);
        room.setPricePerHour(10.0);
        room.setCapacity(5);

        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));

        RoomResponse result = roomService.getRoomById(1L);

        assertEquals("Room A", result.getName());
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

        Room saved = new Room();
        saved.setId(2L);
        saved.setName("Room B");
        saved.setType(RoomType.HOT_DESK);
        saved.setPricePerHour(20.0);
        saved.setCapacity(10);

        when(roomRepository.save(any(Room.class))).thenReturn(saved);

        RoomResponse result = roomService.createRoom(req);

        assertEquals("Room B", result.getName());
        assertEquals(RoomType.HOT_DESK, result.getType());
    }

    @Test
    void updateRoom_success() {
        RoomRequest req = new RoomRequest();
        req.setName("Room C");
        req.setType(RoomType.DEDICATED_DESK);
        req.setPricePerHour(30.0);
        req.setCapacity(8);

        Room existing = new Room();
        existing.setId(3L);
        existing.setName("Old Name");
        existing.setType(RoomType.CONFERENCE_ROOM);
        existing.setPricePerHour(15.0);
        existing.setCapacity(5);

        when(roomRepository.findById(3L)).thenReturn(Optional.of(existing));
        when(roomRepository.save(any(Room.class))).thenReturn(existing);

        RoomResponse result = roomService.updateRoom(3L, req);

        assertEquals("Room C", result.getName());
        assertEquals(RoomType.DEDICATED_DESK, result.getType());
    }

    @Test
    void updateRoom_notFound() {
        RoomRequest req = new RoomRequest();
        when(roomRepository.findById(99L)).thenReturn(Optional.empty());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> roomService.updateRoom(99L, req));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        assertEquals("Room not found", ex.getReason());
    }

    @Test
    void deleteRoom_success() {
        when(roomRepository.existsById(1L)).thenReturn(true);
        doNothing().when(roomRepository).deleteById(1L);
        assertDoesNotThrow(() -> roomService.deleteRoom(1L));
        verify(roomRepository, times(1)).deleteById(1L);
    }

    @Test
    void deleteRoom_notFound() {
        when(roomRepository.existsById(99L)).thenReturn(false);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> roomService.deleteRoom(99L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        assertEquals("Room not found", ex.getReason());
    }
}
