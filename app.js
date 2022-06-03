const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const { usersRouter } = require('./routes/user.routes');
const { productsRouter } = require('./routes/product.routes');
const { cartsRouter } = require('./routes/cart.routes');
const { viewsRouter } = require('./routes/views.routes');

const { globalErrorHandler } = require('./controllers/errors.controllers');

const path = require('path');

const app = express();

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));

app.use(express.json());

const limiter = rateLimit({
    max: 100,
    windowMs: 30*60*1000,
    message: 'You have exceed the limit request for your IP'
});
app.use(limiter);

app.use(helmet());
app.use(compression());

if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/cart', cartsRouter);
app.use('/', viewsRouter);

app.use('*', globalErrorHandler);

module.exports = { app };