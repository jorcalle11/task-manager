const EventEmitter = require('events');

const commands = [
  { name: 'add', description: 'Add a new task' },
  {
    name: 'delete',
    description: 'Delete one (if the id is passed) o all tasks'
  },
  { name: 'ls', description: 'List all tasks saved' },
  { name: 'exit', description: 'Exit of the program' }
];

class Server extends EventEmitter {
  constructor(client) {
    super();
    this.client = client;
    this.tasks = {};
    this.taskId = 1;
    process.nextTick(() => {
      this.emit('response', 'Type a command (help to list available commands)');
    });
    this.watchCommands();
  }

  watchCommands() {
    this.client.on('command', (command, args) => {
      switch (command) {
        case 'help':
        case 'add':
        case 'delete':
        case 'ls':
        case 'exit':
          this[command](args);
          break;
        default:
          this.emit('response', 'Unknown command...');
          break;
      }
    });
  }

  help() {
    const response = commands.map(
      item => `${item.name.padEnd(10)} ${item.description}`
    );
    response.unshift(`${'Command'.padEnd(10)} Description`);
    this.emit('response', response.join('\n'));
  }

  add(args) {
    this.tasks[this.taskId] = args.join(' ').trim();
    this.emit('response', `Task added ${this.taskId}`);
    this.taskId++;
  }

  delete(args) {
    if (!args.length) {
      this.tasks = {};
      this.taskId = 1;
      this.emit('response', 'All tasks were removed');
      return;
    }

    const [id] = args;
    if (this.tasks[id]) {
      delete this.tasks[id];
      this.emit('response', `The task with id ${id} was removed`);
    } else {
      this.emit('response', 'Task no found');
    }
  }

  ls() {
    const taskIds = Object.keys(this.tasks);
    if (!taskIds.length) {
      this.emit('response', 'There are not tasks saved');
      return;
    }

    const tasks = taskIds.map(id => `${id.padEnd(4)} ${this.tasks[id]}`);
    tasks.unshift(`${'id'.padEnd(4)} task`);
    this.emit('response', tasks.join('\n'));
  }

  exit() {
    this.emit('response', 'Bye :)');
    process.exit();
  }
}

module.exports = client => new Server(client);
