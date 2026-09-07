package com.projekty.projekty.CustomException;

public class ProjectReviewNotFoundException extends RuntimeException {
    public ProjectReviewNotFoundException(String msg) {
        super(msg);
    }
}
