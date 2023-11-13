import "reflect-metadata";

import express from 'express'
import cors from 'cors';
import {InversifyExpressServer} from "inversify-express-utils";
import {container} from "./di/inversify.config";
import errorHandlerMiddleware from "./middlewares/ErrorHandlerMiddleware";
import * as https from "https";
import {Worker} from "worker_threads";
import cron from 'node-cron'
import ILoggerFactory from "./infrastructure/interfaces/ILoggerFactory";
import {TYPES} from "./di/types";
import IJob from "./jobs/interfaces/IJob";

/*
Currently VPN servers do not have SSL certificates
 */
https.globalAgent.options.rejectUnauthorized = false;

const loggerFactory = container.get<ILoggerFactory>(TYPES.LoggerFactory)
const logger = loggerFactory.create('main')
const jobsLogger = loggerFactory.create('jobs')
const jobs = [container.get<IJob>(TYPES.RenewJob)]

let server = new InversifyExpressServer(container);
server.setConfig((app) => {
    app.use(express.json())
    app.use(express.urlencoded())
    app.use(cors())
})

server.setErrorConfig((app) => {
    app.use(errorHandlerMiddleware)
})

cron.schedule(process.env.JOBS_CRON, async () => {
    jobsLogger.info('Jobs logger started')
    for (let job of jobs) {
        try {
            await job.run()
        } catch (e) {
            jobsLogger.error(`Error during executing job: ${e.message}`)
        }
    }
})

let app = server.build();

const port = process.env.PORT
app.listen(port, () => logger.info(`App is running on ${port} port`))