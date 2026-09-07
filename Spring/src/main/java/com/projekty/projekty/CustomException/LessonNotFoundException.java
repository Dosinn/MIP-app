package com.projekty.projekty.CustomException;

public class LessonNotFoundException extends RuntimeException {
    public LessonNotFoundException(String msg) {
        super(msg);
    }
}
