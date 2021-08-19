#!/usr/bin/env node

import chalk from 'chalk'
const args = process.argv

const commands = ['new', 'get', 'complete', 'help']

const usage = function() {
  const usageText = `
  todo helps you manage you todo tasks.

  usage:
    todo <command>

    commands can be:

    new:      used to create a new todo
    get:      used to retrieve your todos
    complete: used to mark a todo as complete
    help:     used to print the usage guide
  `

  console.log(usageText)
}

import { join } from 'path'

import { Low, JSONFile } from 'lowdb'

const file = join('db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter)

import readline from "readline";

function errorLog(error) {
  const eLog = chalk.red(error)
  console.log(eLog)
}

if (args.length > 3) {
  errorLog(`only one argument can be accepted`)
  usage()
}

if (commands.indexOf(args[2]) == -1) {
  errorLog('invalid command passed')
  usage()
}

db.data ||= { todos: [] }


switch(args[2]) {
  case 'help':
    usage()
    break
  case 'new':
    newTodo();
    break
  case 'get':
    getTodos();
    break
  case 'complete':
    completeTodo();
    break
  default:
    errorLog('invalid command passed')
    usage()
}

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve, error) => {
    rl.question(question, answer => {
      rl.close()
      resolve(answer)
    });
  })
}

function newTodo() {
  const q = chalk.blue('Type in your todo\n')
  prompt(q).then(todo => {
    console.log(todo)
  })
}

function getTodos() {
    const todos = db.get('todos').value()
    let index = 1;
    todos.forEach(todo => {
      let todoText = `${index++}. ${todo.title}`
      if (todo.complete) {
        todoText += ' ✔ ️'
      }
      console.log(chalk.strikethrough(todoText))
    })
}

if (args.length > 3 && args[2] != 'complete') {
    errorLog('only one argument can be accepted')
    usage()
}

function completeTodo() {
    if (args.length != 4) {
      errorLog("invalid number of arguments passed for complete command")
    }
  
    let n = Number(args[3])
    if (isNaN(n)) {
      errorLog("please provide a valid number for complete command")
    }
  
    let todosLength = db.get('todos').value().length
    if (n > todosLength) {
      errorLog("invalid number passed for complete command.")
    }

    db.set(`todos[${n-1}].complete`, true).write()
}