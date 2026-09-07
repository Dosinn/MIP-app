package com.projekty.projekty.CustomException;

public class AccessForbiddenException extends RuntimeException {
    public AccessForbiddenException(String msg) {
        super(msg);
    }
}
