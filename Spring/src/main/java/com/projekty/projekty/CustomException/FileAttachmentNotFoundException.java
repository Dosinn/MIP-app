package com.projekty.projekty.CustomException;

public class FileAttachmentNotFoundException extends RuntimeException {
    public FileAttachmentNotFoundException(String msg) {
        super(msg);
    }
}
