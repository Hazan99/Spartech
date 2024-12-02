const express = require('express');
   const app = express();
   const PORT = process.env.PORT || 3000;

   // Health check endpoint
   app.get('/healthz', (req, res) => {
       res.status(200).send('OK');
   });

   // Other routes
   app.get('/', (req, res) => {
       res.send('Hello World!');
   });

   app.listen(PORT, () => {
       console.log(`Server is running on port ${PORT}`);
   });
