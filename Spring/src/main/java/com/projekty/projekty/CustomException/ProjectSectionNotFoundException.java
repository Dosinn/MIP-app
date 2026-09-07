package com.projekty.projekty.CustomException;

public class ProjectSectionNotFoundException extends RuntimeException {
    public ProjectSectionNotFoundException(String msg) {
        super(msg);
    }
}
