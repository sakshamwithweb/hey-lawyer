// models/Session.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: String,
    omiUserId: String,
    profession: String,
    age: String,
    race: String,
    nationality: String,
    gender: String
});

export default mongoose.models.users || mongoose.model('users', UserSchema);