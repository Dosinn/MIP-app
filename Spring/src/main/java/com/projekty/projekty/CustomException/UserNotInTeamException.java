package com.projekty.projekty.CustomException;

public class UserNotInTeamException extends RuntimeException {
    public UserNotInTeamException(String msg) {
        super(msg);
    }
}
