package com.projekty.projekty.CustomException;

public class TeamInviteNotFoundException extends RuntimeException {
    public TeamInviteNotFoundException(String msg) {
        super(msg);
    }
}
