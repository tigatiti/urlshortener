import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';


//Routes
import connectDB from './config/db.js';
import urlRoutes from './routes/url.js';
import authRoutes from './routes/auth.js';
//import authRouter from './routes/auth.js';

dotenv.config({path: '../.env'});
const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

app.use(express.json());  
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app .use('/public', express.static(`${process.cwd()}/public`));


app.use('/api/url', urlRoutes);
app.use('/api/auth', authRoutes);

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

connectDB();
//app.use('/qrcode', qrcodeRouter);

app.listen(port, function() {
    console.log(`Listening on port ${port}`);   
  });

app.use(function(req, res, next) {
next(createError(404));
});

app.use(function(err, req, res, next) {
// set locals, only providing error in development
res.locals.message = err.message;
res.locals.error = req.app.get('env') === 'development' ? err : {};
// render the error page
res.status(err.status || 500);
res.render('error');
});     