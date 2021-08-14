const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(u => u.username === username);

  if(user){
    request.user = user;
    return next();
  }

  return response.status(400).json({error: 'User unauthorized.'});
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  
  const userExist = users.some(u => u.username === username);

  if(!userExist){
    const user = {
      id: uuidv4(),
      name,
      username,
      todos: []
    }
  
    users.push(user);
    return response.status(201).json(user);
  }

  return response.status(400).json({error: 'Username already exist.'});
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const user                = request.user;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline,
    created_at: new Date()
  }

  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id }              = request.params;
  const { title, deadline } = request.body;
  const user                = request.user;

  const todo = user.todos.find(t => t.id === id);
  
  if(todo) {
    todo.title    = title;
    todo.deadline = deadline;

    return response.status(201).json(todo);
  }

  return response.status(404).json({error: 'Todo id does not exist.'});
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id }              = request.params;
  const user                = request.user;

  const todo = user.todos.find(t => t.id === id);
  
  if(todo) {
    todo.done = true;
    return response.status(200).json(todo);
  }

  return response.status(404).json({error: 'Todo id does not exist.'});
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id }              = request.params;
  const user                = request.user;

  const todoIndex = user.todos.findIndex(t => t.id === id);
  
  if(todoIndex >= 0 ) {
    user.todos.splice(todoIndex, 1);
    return response.status(204).send();
  }

  return response.status(404).json({error: 'Todo id does not exist.'});
});

module.exports = app;