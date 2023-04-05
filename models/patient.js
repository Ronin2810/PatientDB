const mongoose = require('mongoose')
const schema = mongoose.Schema

const patient_schema = new schema({
    pname:{type:String,required:true,unique:true},
    gender:{type:String,required:true},
    page:{type:Number,required:true},
    ptype:{type:String,required:true},
    pno:{type:Number,required:true},
    email:{type:String},
    diagnosis: {type: [Object]},
    totaldue:{type:Number,required:true},
})


module.exports = mongoose.model('patient', patient_schema)


