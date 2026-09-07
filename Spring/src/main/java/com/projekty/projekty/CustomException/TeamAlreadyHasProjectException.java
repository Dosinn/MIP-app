package com.projekty.projekty.CustomException;

public class TeamAlreadyHasProjectException extends RuntimeException {
    public TeamAlreadyHasProjectException(String msg) {
        super(msg);
    }
}
