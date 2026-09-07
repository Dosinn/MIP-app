package com.projekty.projekty.Project;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record RateProjectRequest(
        @NotNull @DecimalMin("0.0") @DecimalMax("5.0") Double rating
) {}
