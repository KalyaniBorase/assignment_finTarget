const Queue = require('bull');
const redis = require('redis');
const { task } = require('./taskHandler');

const client = redis.createClient();
const taskQueue = new Queue('tasks', { redis: { port: 6379, host: '127.0.0.1' } });

taskQueue.process(async (job) => {
  const { user_id } = job.data;
  await task(user_id);
});

const addTask = async (user_id) => {
  await taskQueue.add({ user_id });
};

module.exports = {
  addTask,
  client
};
