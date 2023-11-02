import "reflect-metadata";

import express from 'express'
import cors from 'cors';
import {InversifyExpressServer, TYPE} from "inversify-express-utils";
import {container} from "./di/inversify.config";
import errorHandlerMiddleware from "./middlewares/ErrorHandlerMiddleware";
import * as https from "https";

/*
Currently VPN servers do not have SSL certificates
 */
https.globalAgent.options.rejectUnauthorized = false;

let server = new InversifyExpressServer(container);
server.setConfig((app) => {
    app.use(express.json())
    app.use(express.urlencoded())
    app.use(cors())
})

server.setErrorConfig((app) => {
    app.use(errorHandlerMiddleware)
})

let app = server.build();

const port = process.env.PORT
app.listen(port, () => console.log(`App is running on ${port} port`))