package com.projekty.projekty.Notification;

import com.projekty.projekty.CustomException.AccessForbiddenException;
import com.projekty.projekty.CustomException.NotificationNotFoundException;
import com.projekty.projekty.User.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public List<Notification> getMyNotifications(User currentUser) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(currentUser);
    }

    public Notification markAsRead(User currentUser, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new AccessForbiddenException("This notification does not belong to you");
        }

        notification.setRead(true);
        return notificationRepository.save(notification);
    }
}
