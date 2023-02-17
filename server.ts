import { makeExecutableSchema } from '@graphql-tools/schema';
import http from 'http';
import express, { Application, Request, Response } from 'express'
import os from 'os'
import cluster, { Worker } from 'cluster'
import { graphqlHTTP } from 'express-graphql'
import typeDefs from './src/graphql/schema'
import resolvers from './src/graphql/resolvers'
import envs from './src/utils/constant'
import db from './src/graphql/db'
import dataBooks from './src/fakeData/books'

const app = express()
const port = 4200

// const httpServer = async () => {
//     let server: http.Server;
//     if (cluster.isPrimary) {
//         const cpuCount = os.cpus().length;
//         for (let i = 0; i < cpuCount; i++) {
//             const fork = cluster.fork();
//             forks.add(fork);
//         }
//         cluster.on('online', (worker: any, code: any, signal: any) => {
//             console.log(`worker ${worker.process.pid} connected`);
//         });
//         cluster.on('exit', (worker, code, signal) => {
//             console.log(`worker ${worker.process.pid} died`);
//         });
//     } else {
//         server = await startServer();
//     }
// }


// db.once('open', async () => {
//     console.log('Connected to MongoDB');
//     await httpServer();
// });

// db.on('error', async (err: Error) => {
//     console.log('Error connecting to MongoDB', err.message);
//     process.exit(1);
// });

const executableSchema = makeExecutableSchema({
    typeDefs,
    resolvers,
})

// const startServer = async () => {
//     const app: Application = express();
//     app.use(express.json());
//     app.use(envs.graphqlPath, graphqlHTTP({
//         schema: executableSchema,
//         graphiql: true,
//         customFormatErrorFn: (err: any) => {
//             if (!err.originalError) {
//                 return err;
//             }
//             const data = err.originalError.data;
//             const message = err.message || 'An error occurred.';
//             const code = err.originalError.code || 500;
//             return {
//                 message: message,
//                 status: code,
//                 data: data,
//             };
//         },
//     }));

//     return app.listen(envs.port, () => {
//         console.log(`Server is running on port ${envs.port}`);
//     });
// }
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Entrypoint
app.use(
  '/graphql',
  graphqlHTTP({
    schema: executableSchema,
    context: {
        books: dataBooks
    },
    graphiql: true,
  })
)

app.listen(port, () => {
  console.log(`Running a server at http://localhost:${port}`)
})