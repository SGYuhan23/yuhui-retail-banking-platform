package com.yuhui.types.exception;

import com.yuhui.types.enums.ResponseCode;
import com.yuhui.types.model.BaseResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import javax.validation.ConstraintViolationException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler
    public BaseResponse<Void> handleException(PermissionException e) {
        log.warn("permission denied", e);
        return new BaseResponse<>(ResponseCode.PERMISSION_DENIED.getCode(), ResponseCode.PERMISSION_DENIED.getMessage(), null);
    }

    @ExceptionHandler(AppException.class)
    public BaseResponse<?> handleAppException(AppException e) {
        log.error("business exception, code={}, message={}", e.getCode(), e.getMessage());
        return new BaseResponse<>(e.getCode(), e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public BaseResponse<?> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldError() == null
                ? ResponseCode.ILLEGAL_PARAMETER.getMessage()
                : e.getBindingResult().getFieldError().getDefaultMessage();
        return new BaseResponse<>(ResponseCode.ILLEGAL_PARAMETER.getCode(), message);
    }

    @ExceptionHandler({BindException.class, ConstraintViolationException.class})
    public BaseResponse<?> handleValidationException(Exception e) {
        String message = ResponseCode.ILLEGAL_PARAMETER.getMessage();
        if (e instanceof BindException bindException && bindException.getBindingResult().getFieldError() != null) {
            message = bindException.getBindingResult().getFieldError().getDefaultMessage();
        } else if (e instanceof ConstraintViolationException constraintViolationException
                && !constraintViolationException.getConstraintViolations().isEmpty()) {
            message = constraintViolationException.getConstraintViolations().iterator().next().getMessage();
        }
        return new BaseResponse<>(ResponseCode.ILLEGAL_PARAMETER.getCode(), message);
    }

    @ExceptionHandler(DuplicateKeyException.class)
    public BaseResponse<?> handleSqlException(DuplicateKeyException e) {
        String message = e.getMessage();
        String duplicateValue = null;
        Pattern pattern = Pattern.compile("Duplicate entry '(.*?)' for key");
        Matcher matcher = message == null ? null : pattern.matcher(message);
        if (matcher != null && matcher.find()) {
            duplicateValue = matcher.group(1);
        }
        String errorMessage = String.format("duplicate index {%s} already exists", duplicateValue);
        log.warn(errorMessage);
        return new BaseResponse<>(ResponseCode.INDEX_DUP.getCode(), errorMessage);
    }

    @ExceptionHandler(Exception.class)
    public BaseResponse<?> handleOtherException(Exception e) {
        log.error("system exception", e);
        return new BaseResponse<>(ResponseCode.UN_ERROR.getCode(), ResponseCode.UN_ERROR.getMessage());
    }
}
