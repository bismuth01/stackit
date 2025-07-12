import express, {Request, Response} from "express";
import { NotificationQuery } from "./types/NotificationQuery";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    var data = req.params.one;
    res.json(`Hello World!`);
})

app.get('/notification/:email', (req:Request<NotificationQuery>, res) => {
    const query_details = req.params;
    const email = query_details.email;
    console.log(`Email received: ${email}`);
    res.json({email});
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})