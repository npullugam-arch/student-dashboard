package com.school.portal.notice.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter
public class HolidayCreateRequest {

    @NotBlank
    @Size(max = 120)
    private String name;

    @NotNull
    private LocalDate startDate;

    private LocalDate endDate;

    @Size(max = 1000)
    private String description;

    private Boolean active;
}