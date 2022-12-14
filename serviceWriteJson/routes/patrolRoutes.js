import express from 'express';
import jfile from 'jsonfile'
import moment from 'moment'
import fs from 'fs'

const router = express.Router();

const updateDate = (obj) => {
    let date = new Date() 
    obj.LastUpdate = moment(date).format('DD-MM-YYYY HH:mm')
    return obj
}

// all routes to API starting with /routes witch we set in index.js file
router.get('/', (req, resp) => {
    let data = jfile.readFileSync('../data.json')
    resp.send(data[0])
})

router.get('/log', (req, resp) => {

    let file = fs.readFileSync('../Trace.octolog').toString('utf8')
    // let file = fs.readFileSync('../../../SERVERLOGS/SERVICES/Patrol/log/Trace.octolog').toString('utf8')
    let arrayOfStings = file.split(/\r\n/)

    const regex = new RegExp()
    let matchResult = arrayOfStings.map((row) => row.match(/\{.+\}/));   
    
    let result = [];

    for (let i = 0; i < matchResult.length; i++) {        

        if (matchResult[i] === null){
            continue;
        }
        result.push(matchResult[i][0]);        
    }

    resp.send(result)
})

// save test file
router.post('/test', (req, resp) => {
    let testRouteFile = req.body
    jfile.writeFileSync('../testRoute.json', testRouteFile)
    resp.send('test file saved')
})

// save new route
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