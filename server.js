const express = require('express');
const cluster = require('cluster');
const os = require('os');
const rateLimiter = require('./rateLimiter');
const redisQueue = require('./redisQueue');
const { task } = require('./taskHandler');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;

  // Fork workers.
  for (let i = 0; i < 2; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });

} else {
  const app = express();
  app.use(express.json());

  // Use the rate limiting middleware
  app.use('/api/v1/task', rateLimiter);

  // Task route
  app.post('/api/v1/task', async (req, res) => {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).send({ message: "user_id is required" });
    }

    // Add task to queue
    await redisQueue.addTask(user_id);

    res.status(200).send({ message: "Task received and queued" });
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} started`);
  });
}
