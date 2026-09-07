package com.projekty.projekty.CustomException;

public class InviteAlreadyExistsException extends RuntimeException {
    public InviteAlreadyExistsException(String msg) {
        super(msg);
    }
}
