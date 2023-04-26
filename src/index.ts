import "reflect-metadata";

import express from 'express'
import {InversifyExpressServer} from "inversify-express-utils";
import {container} from "./di/inversify.config";
import errorHandlerMiddleware from "./middlewares/ErrorHandlerMiddleware";

let server = new InversifyExpressServer(container);
server.setConfig((app) => {
    app.use(express.json())
})

server.setErrorConfig((app) => {
    app.use(errorHandlerMiddleware)
})

let app = server.build();

const port = process.env.PORT
app.listen(port, () => console.log(`App is running on ${port} port`))