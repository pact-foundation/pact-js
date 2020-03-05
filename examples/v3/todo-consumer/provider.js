const express = require("express")
const server = express()

server.use((req, res, next) => {
  res.header("Content-Type", "application/xml")
  next()
})

// Get all animals
server.get("/projects", (req, res) => {
  res.send("<?xml version='1.0'?><ns1:projects id='1234' xmlns:ns1='http://some.namespace/and/more/stuff'><ns1:project id='1' name='Project 1' type='activity'><ns1:tasks><ns1:task done='true' id='1' name='Task 1'/><ns1:task done='true' id='1' name='Task 1'/><ns1:task done='true' id='1' name='Task 1'/><ns1:task done='true' id='1' name='Task 1'/><ns1:task done='true' id='1' name='Task 1'/></ns1:tasks></ns1:project><ns1:project id='1' name='Project 1' type='activity'><ns1:tasks><ns1:task done='true' id='1' name='Task 1'/><ns1:task done='true' id='1' name='Task 1'/><ns1:task done='true' id='1' name='Task 1'/><ns1:task done='true' id='1' name='Task 1'/><ns1:tasky done='true' id='1' name='Task 1'/></ns1:tasks></ns1:project></ns1:projects>")
})

module.exports = {
  server,
}
