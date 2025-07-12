import { NotificationType } from "./NotificationType"

export interface NotificationAdd {
    email: string,
    type: NotificationType,
    dateTime: string,
    subject: string,
    body: string
}