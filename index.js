import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import 'dotenv/config';
import './global'
import indexRouter from './route/indexRouter';
import reportRouter from './route/reportRouter';
import './schedule/schedule';
const app = express();
const http = require('http').Server(app);

console.log(process.env.NODE_ENV)

app.set("views", "views/");
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static('public'));

app.use('/', indexRouter);
app.use('/report', reportRouter);

const host = '0.0.0.0';
const port = config.port || 3005;

http.listen(port, host, function() {
    console.log("Server started on " + port);
});
