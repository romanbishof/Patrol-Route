
import express from 'express';
import cors from 'cors'
import bodyParser from 'body-parser';

import patrolRoutes_routes from './routes/patrolRoutes.js';

const PORT = 9090;
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({extended:true})).use(bodyParser.json())

app.get('/', (req, resp) => {
    resp.send("hello from home page")
})
//                         ||
// setting the API route , \/ using the CRUD operators 
app.use('/routes', patrolRoutes_routes)

app.listen(PORT, () => {
    console.log(`the server is running on port ${PORT}`);
})