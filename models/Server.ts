import { Schema, model } from 'mongoose';

const serverConfigSchema = new Schema({
    server_id: String,

    // Welcome
    welcome_message: String,
    welcome_enabled: Boolean,

    // Logs
    logs_channel: String,
    logs_enabled: Boolean,

    // Error Logging
    errors_channel: String,
    errors_enabled: Boolean
});

export default model('Server', serverConfigSchema);