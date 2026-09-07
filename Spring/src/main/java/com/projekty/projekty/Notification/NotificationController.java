package com.projekty.projekty.Notification;

import com.projekty.projekty.User.User;
import com.projekty.projekty.util.CurrentUserProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping("/me")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications() {
        User currentUser = currentUserProvider.getCurrentUser();
        List<NotificationResponse> response = notificationService.getMyNotifications(currentUser).stream()
                .map(NotificationResponse::from)
                .toList();
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long id) {
        User currentUser = currentUserProvider.getCurrentUser();
        Notification notification = notificationService.markAsRead(currentUser, id);
        return ResponseEntity.ok(NotificationResponse.from(notification));
    }
}
