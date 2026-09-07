package com.projekty.projekty.CustomException;

public class ProjectNotFoundException extends RuntimeException {
    public ProjectNotFoundException(String msg) {
        super(msg);
    }
}
