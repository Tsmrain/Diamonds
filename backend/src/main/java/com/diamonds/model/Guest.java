package com.diamonds.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Guest {
    @Column(name = "guest_ci")
    private String ci;

    @Column(name = "guest_name")
    private String name;

    @Column(name = "guest_phone")
    private String phone;

    @Builder.Default
    private Boolean ciInDeposit = true;
}
