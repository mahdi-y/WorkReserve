package com.workreserve.backend.exception;

public class TwoFactorRequiredException extends RuntimeException {
    public TwoFactorRequiredException(String message) {
        super(message);
    }
}