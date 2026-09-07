package com.projekty.projekty.CustomException;

public class NotificationNotFoundException extends RuntimeException {
    public NotificationNotFoundException(String msg) {
        super(msg);
    }
}
