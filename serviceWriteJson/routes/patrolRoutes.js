import express from 'express';
import jfile from 'jsonfile'
import moment from 'moment'

const router = express.Router();

const updateDate = (obj) => {
    let date = new Date() 
    obj.LastUpdate = moment(date).format('DD-MM-YYYY HH:MM')
    return obj
}

// all routes to API starting with /users witch we set in index.js file
router.get('/', (req, resp) => {
    let data = jfile.readFileSync('../data.json')
    resp.send(data[0])
})

router.post('/', (req, resp) => {
    
    let data = jfile.readFileSync('../data.json');
    let reqData = req.body
    data[0].RoutePlans.push(reqData)
    data[0] = updateDate(data[0])
    jfile.writeFileSync('../data.json',data)
    resp.send(data);
})

router.delete('/:routeId', (req, resp) => {
    
    let data = jfile.readFileSync('../data.json')
    data[0] = updateDate(data[0])
    const { routeId } = req.params
    let route = data[0].RoutePlans.filter(routePlan => routePlan.Id !== routeId)
    data[0].RoutePlans = route
    jfile.writeFileSync('../data.json', data)
    resp.send('the route was deleted, heres new route:/n',data)
})

router.put('/', (req, resp) => {

    let data = jfile.readFileSync('../data.json')
    data[0] = updateDate(data[0])
    let updateRoute = req.body
    console.log(updateRoute);
    let index = data[0].RoutePlans.findIndex(route => route.Id === updateRoute.Id)
    data[0].RoutePlans[index] = updateRoute
    jfile.writeFileSync('../data.json', data)
    resp.status(200).send('Data updated: /n', data)
    
})

export default router;