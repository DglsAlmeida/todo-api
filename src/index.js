const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username)

  if (!user) {
    return response.status(400).json({ error: "user not found" })
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const id = uuidv4()

  const userAlreadyExists = users.some(user => user.username === username);

  if (!userAlreadyExists) {
    users.push({
      id,
      name,
      username,
      todos: []
    })
  } else {
    return response.status(400).json({ error: 'user already exists!' })
  }

  return response.status(201).json({
    id,
    name,
    username,
    todos: []
  })
});

app.get("/users", (request, response) => {
  return response.json(users)
})

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  if (!title || !deadline) {
    return response.status(400).json({ erro: 'mandatory paramenters are missing' })
  } else {
    const id = uuidv4()

    user.todos.push({
      id,
      title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date()
    })

    return response.status(201).json({
      id,
      title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date()
    })
  }
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  const { id } = request.params

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if (todoIndex !== -1) {
    user.todos[todoIndex].title = title
    user.todos[todoIndex].deadline = deadline

    return response.status(201).json(user.todos[todoIndex])
  } else {
    return response.status(404).json({ error: "todo not found!" })
  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if (todoIndex !== -1) {
    user.todos[todoIndex].done = true

    return response.status(201).json(user.todos[todoIndex])
  } else {
    return response.status(404).json({ error: "todo not found!" })
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if (todoIndex !== -1) {
    user.todos.splice(todoIndex, 1)
    return response.status(204).json(user.todos)
  } else {
    return response.status(404).json({ error: "todo not found!" })
  }
});

module.exports = app;