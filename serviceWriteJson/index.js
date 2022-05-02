
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

// getting health check
app.get('/hc',(req, resp) => {
    
    const nodeHC_Ok = {
        status: 'ok',
        service: 'nodeBE'
    }

    const nodeHC_error = {
        status: 'ok',
        service: 'nodeBE'
    }

    resp.status(200).send(nodeHC_Ok).setTimeout(2000)
    resp.status(500).send(nodeHC_error)
})


//                         ||
// setting the API route , \/ using the CRUD operators 
app.use('/routes', patrolRoutes_routes)

app.listen(PORT, () => {
    console.log(`the server is running on port ${PORT}`);
})