const mongoose=require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2');

const schema=new mongoose.Schema({
    id:{
        type:Number,
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    sold:{
        type:Boolean,
    },
    dateOfSale:{
        type:Date,
    },
})
schema.plugin(mongoosePaginate);
const UserModel=mongoose.model('databases',schema)

module.exports=UserModel