const express = require('express');
const cors = require('cors');
const app = express();
const port = 5555;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Frota Digital!');
});


const router = express.Router();
app.use('/api', router);
require('./routes')(router);


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});