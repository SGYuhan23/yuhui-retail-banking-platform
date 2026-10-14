package com.yuhui.types.exception;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;

@EqualsAndHashCode(callSuper = true)
@Data
public class AppException extends RuntimeException {

    @Serial
    private static final long serialVersionUID = 5317680961212299217L;

    /**
     * 异常码
     */
    private int code;

    /**
     * 异常信息
     */
    private String message;

    public AppException(int code) {
        this.code = code;
    }

    public AppException(int code, Throwable cause) {
        this.code = code;
        super.initCause(cause);
    }

    public AppException(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public AppException(int code, String message, Throwable cause) {
        this.code = code;
        this.message = message;
        super.initCause(cause);
    }

    @Override
    public String toString() {
        return "com.marketing.x.api.types.exception.XApiException{" +
                "code='" + code + '\'' +
                ", info='" + message + '\'' +
                '}';
    }

}
