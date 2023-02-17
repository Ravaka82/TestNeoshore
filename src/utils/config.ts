import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as path from 'path'
import * as mongoose from 'mongoose';
import * as morgan from 'morgan';
import * as chalk from 'chalk';
import {APP_PORT, BODY_PARSER_LIMIT, DIST_PATH, GRAPHQL_PATH, MONGOOSE_URI} from "./app.constant";
import {ApolloServer} from 'apollo-server-express';
import GraphQlSchema from './graphql/schema'
import GraphQlResolver from './graphql/resolvers';
import {Permissions} from './graphql/shields';
import {applyMiddleware} from "graphql-middleware";
import {makeExecutableSchema} from "@graphql-tools/schema";
import {graphqlUploadExpress} from 'graphql-upload';
import Session from "./session";

// Server class
class Server {

    public app: any;

    constructor() {
        this.app = express();
        this.app.use((req, res, next) => {
            req.session = Session;
            next();
        });
        this.startGraphQL();
    }

    private connectDatabase() {
        // set up mongoose
        console.log('Connecting to DB....', MONGOOSE_URI)
        mongoose.set('useCreateIndex', true);
        return mongoose.connect(MONGOOSE_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            keepAlive: true,
            useCreateIndex: true,
            useFindAndModify: false
        })
            .then(() => console.log('Dabatase connected.'))
            .catch((e) => console.log('Error connection db.', e))
    }

    private morganChalk() {
        return morgan(function (tokens, req, res) {
            const logs = []
            logs.push(
                chalk.yellow(tokens.method(req, res)),
                chalk.blue(tokens.url(req, res)),
                chalk.green(tokens.status(req, res)),
                tokens['response-time'](req, res) + ' ms\n'
            );

            if (req.body && Object.keys(req.body).length > 0) {
                logs.push(chalk.gray('body', JSON.stringify(req.body), '\n'));
            }

            if (req.params && Object.keys(req.params).length > 0) {
                logs.push(chalk.red('params', JSON.stringify(req.params), '\n'));
            }

            if (req.query && Object.keys(req.query).length > 0) {
                logs.push(chalk.blue('query', JSON.stringify(req.query)));
            }

            return logs.join(' ');
        });
    }


    private use(...args) {
        this.app.use(...args);
    }

    private useStatic(target: string, folder: string)   {
        this.app.use(target, express.static(path.join(process.cwd(), folder)));
    }

    private useMiddlewareOn(path: string, func) {
        !path ? this.app.use(func) : this.app.use(path, func)
    }

    public async config() {
        await this.connectDatabase();
        this.use(cors());
        this.use(bodyParser.json({limit: BODY_PARSER_LIMIT}));
        this.use(bodyParser.urlencoded({limit: BODY_PARSER_LIMIT, extended: true}));
        this.use(this.morganChalk());
        this.useStatic('/upload', 'upload');
        this.useStatic('/', DIST_PATH);
        this.app.get('*', (req, res) => res.sendFile(path.join(process.cwd(), DIST_PATH, 'index.html')))
    }

    private async startGraphQL(): Promise<void> {
        const [typeDefs, resolvers] = [GraphQlSchema, GraphQlResolver];
        const schema = makeExecutableSchema({
            typeDefs,
            resolvers,
        });
        const server = new ApolloServer({
            schema: applyMiddleware(schema, Permissions),
            context: ({ req }) => {
                return {
                    token: req.headers['x-access-token'] || "",
                };
            }
        });
        await server.start();
        this.app.use(graphqlUploadExpress())

        server.applyMiddleware({
            app: this.app,
            path: GRAPHQL_PATH,
        });
    }

    public async bootstrap(server) {
        await this.config()
        server.listen({port: APP_PORT}, () => {
            console.log('🚀 Express server listening on port ' + APP_PORT);
            console.log('🚀 GraphQL ready on ', GRAPHQL_PATH)
        });
    }
}

export default Server;
