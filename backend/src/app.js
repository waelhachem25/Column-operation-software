const express = require('express');
const cors = require('cors');

const mathRoutes = require('./routes/math.routes');
const templateRoutes = require('./routes/template.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/math', mathRoutes);
app.use('/api/templates', templateRoutes);

module.exports = app;