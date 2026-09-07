package com.projekty.projekty.CustomException;

public class UserAlreadyInTeamException extends RuntimeException {
    public UserAlreadyInTeamException(String msg) {
        super(msg);
    }
}
