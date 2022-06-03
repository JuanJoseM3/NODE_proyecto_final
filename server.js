const { app } = require('./app');
const { db } = require('./utils/database');

const { initModels } = require('./models/initModels');

db.authenticate()
    .then(() => console.log('Database authenticated'))
    .catch(err => console.log(err));

initModels();

db.sync()
    .then(() => console.log('Database synced'))
    .catch(err => console.log(err));

const PORT = process.env.PORT || 3300;

app.listen(PORT, () => {
    console.log(`Express running on port: ${PORT}`);
});