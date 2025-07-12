import express, {Request, Response} from "express";
import dotenv from "dotenv";

import { NotificationQuery } from "./types/NotificationQuery";
import { NotificationAdd } from "./types/NotificationAdd";

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    console.log(`Server running`);
})

app.get('/notification/:email', (req:Request<NotificationQuery>, res) => {
    const query_details = req.params;
    const email = query_details.email;
    console.log(`Email received: ${email}`);
    res.json({email});
})

app.post('/notification_add', (req: Request<{}, {}, NotificationAdd>, res: Response) => {
    const notification_details = req.body;
    const { email, type, dateTime, subject, body } = notification_details;
    
    res.json({
        message: "Notification added successfully",
        notification: notification_details
    });
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})