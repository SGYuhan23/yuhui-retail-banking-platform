package com.yuhui.types.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ResponseCode {
    SUCCESS(1000, "success"),
    UN_ERROR(1001, "system error"),
    ILLEGAL_PARAMETER(1002, "illegal parameter"),
    NO_LOGIN(1003, "not logged in"),
    STRATEGY_RULE_WEIGHT_IS_NULL(1004, "strategy rule weight is null"),
    INDEX_DUP(1005, "duplicate index"),
    ACTIVITY_STATE_ERROR(1006, "activity is not open"),
    ACTIVITY_DATE_ERROR(1007, "activity date is invalid"),
    ACTIVITY_SKU_STOCK_ZERO(1008, "activity sku stock is empty"),
    ACCOUNT_QUOTA_ERROR(1009, "account total quota is insufficient"),
    ACCOUNT_MONTH_QUOTA_ERROR(1010, "account month quota is insufficient"),
    ACCOUNT_DAY_QUOTA_ERROR(1011, "account day quota is insufficient"),
    ACTIVITY_ORDER_ERROR(1012, "activity order already exists"),
    USER_CREDIT_ACCOUNT_NO_AVAILABLE_AMOUNT(1013, "credit is insufficient"),
    DEGRADE_SWITCH(1014, "feature degraded"),
    RATE_LIMITER(1015, "request rate limited"),
    HYSTRIX(1016, "service fallback triggered"),
    ACTIVITY_SKU_STOCK_ERROR(2008, "activity sku stock error"),
    DATA_EXIST(2009, "data already exists"),
    USER_ALREADY_RECEIVE_GIFT(2010, "user already received gift"),
    FEATURE_IS_NOT_CONFIGURED(2011, "feature is not configured"),
    PERMISSION_DENIED(2013, "permission denied"),
    REFRESH_TOKEN_INVALID(2015, "refresh token is invalid or expired"),
    AUTH_SERVICE_ERROR(2016, "auth service error"),
    EMAIL_EMPTY(2017, "email cannot be blank"),
    EMAIL_PASSCODE_EMPTY(2018, "email passcode cannot be blank"),
    AUTHING_SEND_EMAIL_FAILED(2019, "failed to send email passcode"),
    AUTHING_EMAIL_SIGN_UP_FAILED(2021, "failed to register by email"),
    AUTHING_SERVICE_ERROR(2022, "authing service error"),
    EMAIL_PASSWORD_EMPTY(2023, "email password cannot be blank"),
    EMAIL_ALREADY_REGISTERED(2024, "email has already been registered"),
    EMAIL_NOT_REGISTERED(2025, "email is not registered"),
    EMAIL_PASSWORD_INVALID(2026, "email or password is invalid");

    private final int code;
    private final String message;
}
