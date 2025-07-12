import { NotificationType } from "./NotificationType"

export interface NotificationAdd {
    userId: string,
    type: NotificationType,
    dateTime: string,
    subject: string,
    body: string
}