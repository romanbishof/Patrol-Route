import express from 'express';
import jfile from 'jsonfile'
// import {Validator} from 'jsonschema'

// const schema = {
//         "type": "array",
//         "items": [
//           {
//             "type": "object",
//             "properties": {
//               "Jetty": {
//                 "type": "string"
//               },
//               "LastUpdate": {
//                 "type": "string"
//               },
//               "Home": {
//                 "type": "object",
//                 "properties": {
//                   "Latitude": {
//                     "type": "number"
//                   },
//                   "Longitude": {
//                     "type": "number"
//                   }
//                 },
//                 "required": [
//                   "Latitude",
//                   "Longitude"
//                 ]
//               },
//               "SecurityLevel": {
//                 "type": "integer"
//               },
//               "IntervalInMinutes": {
//                 "type": "integer"
//               },
//               "RoutePlans": {
//                 "type": "array",
//                 "items": [
//                   {
//                     "type": "object",
//                     "properties": {
//                       "Id": {
//                         "type": "integer"
//                       },
//                       "OrgId": {
//                         "type": "integer"
//                       },
//                       "StartAt": {
//                         "type": "string"
//                       },
//                       "IsActive": {
//                         "type": "boolean"
//                       },
//                       "CheckPoints": {
//                         "type": "array",
//                         "items": [
//                           {
//                             "type": "object",
//                             "properties": {
//                               "Id": {
//                                 "type": "integer"
//                               },
//                               "Name": {
//                                 "type": "string"
//                               },
//                               "Latitude": {
//                                 "type": "number"
//                               },
//                               "Longitude": {
//                                 "type": "number"
//                               },
//                               "WaitforSeconds": {
//                                 "type": "integer"
//                               },
//                               "Devices": {
//                                 "type": "array",
//                                 "items": [
//                                   {
//                                     "type": "string"
//                                   },
//                                   {
//                                     "type": "string"
//                                   }
//                                 ]
//                               }
//                             },
//                             "required": [
//                               "Id",
//                               "Name",
//                               "Latitude",
//                               "Longitude",
//                               "WaitforSeconds",
//                               "Devices"
//                             ]
//                           }
//                         ]
//                       }
//                     },
//                     "required": [
//                       "Id",
//                       "OrgId",
//                       "StartAt",
//                       "IsActive",
//                       "CheckPoints"
//                     ]
//                   }
//                 ]
//               }
//             },
//             "required": [
//               "Jetty",
//               "LastUpdate",
//               "Home",
//               "SecurityLevel",
//               "IntervalInMinutes",
//               "RoutePlans"
//             ]
//           }
//         ]
      
// }

const router = express.Router();

const updateDate = (obj) => {
    let date = new Date() 
    obj.LastUpdate = date.toLocaleString()
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

router.delete('/:routeName', (req, resp) => {
    
    let data = jfile.readFileSync('../data.json')
    data[0] = updateDate(data[0])
    const { routeName } = req.params
    let route = data[0].RoutePlans.filter(routePlan => routePlan.Name !== routeName)
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