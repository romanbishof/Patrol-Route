const routeSchema = ({
    type: "array",
    items: [
        {
            type: "object",
            properties: {
                Jetty: {type: "string"},
                LastUpdate: {type: "string"},
                Home: {type: "object"},
                RoutePlans: {
                    type: "array",
                    items: [{
                        type: "object"
                    }]
                }
            }
        }
    ]
})

export default routeSchema;