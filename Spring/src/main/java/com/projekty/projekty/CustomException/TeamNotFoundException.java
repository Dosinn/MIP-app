package com.projekty.projekty.CustomException;

public class TeamNotFoundException extends RuntimeException {
    public TeamNotFoundException(String msg) {
        super(msg);
    }
}
