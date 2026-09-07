package com.projekty.projekty.CustomException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFoundException(UserNotFoundException ex) {
        return buildErrorResponse("USER_NOT_FOUND", ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(TeamNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleTeamNotFoundException(TeamNotFoundException ex) {
        return buildErrorResponse("TEAM_NOT_FOUND", ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ProjectNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleProjectNotFoundException(ProjectNotFoundException ex) {
        return buildErrorResponse("PROJECT_NOT_FOUND", ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(TeamInviteNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleTeamInviteNotFoundException(TeamInviteNotFoundException ex) {
        return buildErrorResponse("TEAM_INVITE_NOT_FOUND", ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(LessonNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleLessonNotFoundException(LessonNotFoundException ex) {
        return buildErrorResponse("LESSON_NOT_FOUND", ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ProjectSectionNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleProjectSectionNotFoundException(ProjectSectionNotFoundException ex) {
        return buildErrorResponse("PROJECT_SECTION_NOT_FOUND", ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(FileAttachmentNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleFileAttachmentNotFoundException(FileAttachmentNotFoundException ex) {
        return buildErrorResponse("FILE_ATTACHMENT_NOT_FOUND", ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ProjectReviewNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleProjectReviewNotFoundException(ProjectReviewNotFoundException ex) {
        return buildErrorResponse("PROJECT_REVIEW_NOT_FOUND", ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(NotificationNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotificationNotFoundException(NotificationNotFoundException ex) {
        return buildErrorResponse("NOTIFICATION_NOT_FOUND", ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(TeamFullException.class)
    public ResponseEntity<ErrorResponse> handleTeamFullException(TeamFullException ex) {
        return buildErrorResponse("TEAM_FULL", ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(UserAlreadyInTeamException.class)
    public ResponseEntity<ErrorResponse> handleUserAlreadyInTeamException(UserAlreadyInTeamException ex) {
        return buildErrorResponse("USER_ALREADY_IN_TEAM", ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(InviteAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleInviteAlreadyExistsException(InviteAlreadyExistsException ex) {
        return buildErrorResponse("INVITE_ALREADY_EXISTS", ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(InvalidEmailDomainException.class)
    public ResponseEntity<ErrorResponse> handleInvalidEmailDomainException(InvalidEmailDomainException ex) {
        return buildErrorResponse("INVALID_EMAIL_DOMAIN", ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(TeacherMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTeacherMismatchException(TeacherMismatchException ex) {
        return buildErrorResponse("TEACHER_MISMATCH", ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(TeamAlreadyHasProjectException.class)
    public ResponseEntity<ErrorResponse> handleTeamAlreadyHasProjectException(TeamAlreadyHasProjectException ex) {
        return buildErrorResponse("TEAM_ALREADY_HAS_PROJECT", ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(SectionClosedException.class)
    public ResponseEntity<ErrorResponse> handleSectionClosedException(SectionClosedException ex) {
        return buildErrorResponse("SECTION_CLOSED", ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(UserNotInTeamException.class)
    public ResponseEntity<ErrorResponse> handleUserNotInTeamException(UserNotInTeamException ex) {
        return buildErrorResponse("USER_NOT_IN_TEAM", ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(InvalidOrExpiredCodeException.class)
    public ResponseEntity<ErrorResponse> handleInvalidOrExpiredCodeException(InvalidOrExpiredCodeException ex) {
        return buildErrorResponse("INVALID_OR_EXPIRED_CODE", ex.getMessage(), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(AccessForbiddenException.class)
    public ResponseEntity<ErrorResponse> handleAccessForbiddenException(AccessForbiddenException ex) {
        return buildErrorResponse("ACCESS_FORBIDDEN", ex.getMessage(), HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .orElse("Validation failed");
        return buildErrorResponse("VALIDATION_ERROR", msg, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex) {
        return buildErrorResponse("INVALID_ARGUMENT", ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalStateException(IllegalStateException ex) {
        return buildErrorResponse("ILLEGAL_STATE", ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    private ResponseEntity<ErrorResponse> buildErrorResponse(String errorCode, String message, HttpStatus status) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                errorCode,
                message
        );
        return new ResponseEntity<>(errorResponse, status);
    }
}
