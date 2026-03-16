package com.school.portal.password.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PasswordStatusResponse {
    private boolean canChangePassword; // true => show button
}