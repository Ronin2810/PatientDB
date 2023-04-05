const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser') 
const router = require('./routes/router')


const app = express()

app.use(express.json())

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({ extended: false }))

app.use("/static",express.static("static"))

app.use(express.static('data'))

const db_name = 'mongodb://127.0.0.1:27017/patientDB'
mongoose.connect(db_name)
.then(()=>{
    console.log("MongoDB Connection Successful");
})
.catch((err)=>{
    console.log(err);
})


app.set('view engine','ejs')
const port = process.env.port || 8080
app.listen(port,()=>{
    console.log(`Server listening on port ${port}`);
})

app.use('/',router)