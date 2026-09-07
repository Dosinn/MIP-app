package com.projekty.projekty.Notification;

import com.projekty.projekty.ProjectHistory.ProjectHistory;
import com.projekty.projekty.User.User;
import org.springframework.stereotype.Component;

@Component
public class NotificationFactory {

    public Notification create(User user, ProjectHistory history) {
        return Notification.builder()
                .user(user)
                .history(history)
                .isRead(false)
                .build();
    }
}
