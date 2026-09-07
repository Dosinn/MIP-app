package com.projekty.projekty.CustomException;

public class InvalidEmailDomainException extends RuntimeException {
    public InvalidEmailDomainException(String msg) {
        super(msg);
    }
}
