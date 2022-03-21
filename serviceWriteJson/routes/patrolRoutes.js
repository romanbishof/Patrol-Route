import express from 'express';
import jfile from 'jsonfile'
import PatrolRouteSchema from '../routeSchema.js'
import Ajv from 'ajv'
const ajv = new Ajv()
const validate_route = ajv.compile(PatrolRouteSchema)

const router = express.Router();

// all routes to API starting with /users witch we set in index.js file
router.get('/', (req, resp) => {
    let data = jfile.readFileSync('../data.json')
    resp.send(data[0])
})

router.post('/', (req, resp) => {
    
    let data = jfile.readFileSync('../data.json');
    let reqData = req.body
    
    data[0].RoutePlans.push(reqData)

    jfile.writeFileSync('../data.json',data)
    resp.send(data);
})

router.delete('/:id', (req, resp) => {

    let data = jfile.readFileSync('../data.json')
    const { id } = req.params
    let route = data[0].RoutePlans.filter(routePlan => routePlan.Id !== id)
    data[0].RoutePlans = route
    jfile.writeFileSync('../data.json', data)

    resp.send('the route was deleted, heres new route:/n',data)
    
})



export default router;