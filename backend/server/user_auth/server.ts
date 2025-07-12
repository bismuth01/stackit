import express, {Request, Response} from "express";

const app = express();
const PORT = 8080;

app.use(express.json());

app.get('/', async (req: Request, res: Response) => {
    res.json({"status": "Server is running"});
})

app.post('/register', (req: Request, res: Response) => {
    const { email, pass } = req.query;

    res.json({"Success":true});
})

app.post('/login', (req: Request, res: Response) => {
    const {email, pass} = req.query;
    res.json({"Success": true});
})

app.listen(PORT, () => {
    console.log(`Server started at ${PORT}`);
})