package com.FIThread.FIThread.auth.dto;

import com.FIThread.FIThread.auth.SchoolEmail;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank(message = "Email khong duoc de trong")
    @SchoolEmail
    private String email;

    @NotBlank(message = "Ho ten khong duoc de trong")
    @Size(min = 2, max = 255, message = "Ho ten phai tu 2 den 255 ky tu")
    private String fullName;

    @NotBlank(message = "Mat khau khong duoc de trong")
    @Size(min = 8, message = "Mat khau phai co it nhat 8 ky tu")
    private String password;

    private String cohort;
}