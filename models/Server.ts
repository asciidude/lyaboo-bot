import { Schema, model } from 'mongoose';

const serverConfigSchema = new Schema({
    server_id: String,
    welcome_message: String,
    welcome_enabled: Boolean,
});

export default model('Server', serverConfigSchema);