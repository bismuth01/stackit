// Basic packages
import express, {Request, Response} from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { authenticateJWT } from "./middleware/AuthenticateJWT";

// Types for structured inputs
import { NotificationQuery } from "./types/NotificationQuery";
import { NotificationAdd } from "./types/NotificationAdd";
import { NotificationDelete } from "./types/NotificationDelete";
import { NotificationRead } from "./types/NotificationRead";

dotenv.config();

// Only for testing API
const JWT_SECRET = process.env.JWT_SECRET || "";

const app = express();
const port = 3000;

app.use(express.json());
app.use('/notification/get', authenticateJWT);
app.use('/notification/read', authenticateJWT);
app.use('/notification/delete', authenticateJWT);

app.get('/', (req: Request, res: Response) => {
    console.log(`Server running`);
})

app.get('/notification/get', (req:Request<{}, {}, {}, NotificationQuery>, res) => {
    const query_details = req.query;
    const userId = query_details.userId;
    console.log(`Email received: ${userId}`);
    res.json({userId});
})

app.post('/notification/add', (req: Request<{}, {}, NotificationAdd>, res: Response) => {
    const notification_details = req.body;
    const { userId, type, dateTime, subject, body } = notification_details;
    
    res.json({
        message: "Notification added successfully",
        notification: notification_details
    });
})

app.post('/notification/delete', (req: Request<{}, {}, {}, NotificationDelete>, res:Response) => {
    const notif_details = req.query;
    const notifId = notif_details.notifId;

    res.json(`Notif deleted: ${notifId}`);
})

app.post('/notification/read', (req: Request<{}, {}, {}, NotificationRead>, res:Response) => {
    const notif_details = req.query;
    const notifId = notif_details.notifId;

    res.json(`Notif read: ${notifId}`);
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

app.get('/login/:userId', (req:Request, res:Response) => {
    const userId = req.params.userId;
    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
})