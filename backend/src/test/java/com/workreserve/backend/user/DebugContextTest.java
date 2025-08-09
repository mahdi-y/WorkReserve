package com.workreserve.backend.user;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class DebugContextTest {

    @Test
    void debugContextLoad() {
        System.out.println("✅ If you see this, context loaded successfully!");
    }
}