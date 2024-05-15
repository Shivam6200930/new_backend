import mongoose, { mongo } from 'mongoose';


const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true,validate: {
        validator: validator.isEmail,
        message: 'Please use a valid email address',
      }, },
    password: { type: String, required: true, trim: true,minlength: 6, match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        'Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      ], },
    phone:{type:String,required: true, trim: true,match: [
        /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
        'Please enter a valid phone number',
      ],},
    profileImageUrl: { type: String},
    orderHistory: [{ type: Object }]
}, { timestamps: true }); 


const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
}, { timestamps: true }); 


const user = mongoose.model("user",userSchema)
const Product = mongoose.model('Product', ProductSchema);

export { user , Product };