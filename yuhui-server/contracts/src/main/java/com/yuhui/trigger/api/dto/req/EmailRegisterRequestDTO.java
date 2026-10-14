package com.yuhui.trigger.api.dto.req;

import lombok.Data;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import java.io.Serial;
import java.io.Serializable;

@Data
public class EmailRegisterRequestDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotBlank(message = "email cannot be blank")
    @Email(message = "email format is invalid")
    private String email;

    @NotBlank(message = "email passcode cannot be blank")
    private String passCode;

    @NotBlank(message = "password cannot be blank")
    private String password;
}
