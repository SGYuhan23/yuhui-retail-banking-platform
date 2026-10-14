package com.yuhui.types.model;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

/**

 * 基础响应类
 */
@Data
public class BaseResponse<T> implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Integer code;
    private String message;
    private T data;

    public BaseResponse(int code, String msg, T data) {
        this.code = code;
        this.message = msg;
        this.data = data;
    }

    public BaseResponse(int code, String msg) {
        this.code = code;
        this.message = msg;
    }
}
