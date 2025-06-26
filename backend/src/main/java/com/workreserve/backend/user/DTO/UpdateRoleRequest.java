package com.workreserve.backend.user.DTO;

import com.workreserve.backend.user.Role;
import jakarta.validation.constraints.NotNull;

public class UpdateRoleRequest {
    @NotNull
    private Role role;

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}