package com.projekty.projekty.CustomException;

public class TeamFullException extends RuntimeException {
    public TeamFullException(String msg) {
        super(msg);
    }
}
