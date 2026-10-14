package com.yuhui.types.exception;

import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class PermissionException extends RuntimeException {

    private static final long serialVersionUID = 5317680961212299217L;

    /** 异常码 */
    private String code;

    /** 异常信息 */
    private String info;

    public PermissionException(String code) {
        this.code = code;
    }

    public PermissionException(String code, Throwable cause) {
        this.code = code;
        super.initCause(cause);
    }

    public PermissionException(String code, String message) {
        this.code = code;
        this.info = message;
    }

    public PermissionException(String code, String message, Throwable cause) {
        this.code = code;
        this.info = message;
        super.initCause(cause);
    }

    @Override
    public String toString() {
        return "PermissionException{" +
                "code='" + code + '\'' +
                ", info='" + info + '\'' +
                '}';
    }

}
