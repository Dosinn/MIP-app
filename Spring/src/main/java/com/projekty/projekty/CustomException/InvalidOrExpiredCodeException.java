package com.projekty.projekty.CustomException;

public class InvalidOrExpiredCodeException extends RuntimeException {
    public InvalidOrExpiredCodeException(String msg) {
        super(msg);
    }
}
