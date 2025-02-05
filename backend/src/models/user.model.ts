import { model, Schema } from 'mongoose';

const userSchema: Schema = new Schema(
    {
    userId: {
        type: String,
        required: true,
        unique: true,
        },  
    agentId: {
        type: String,
        required: true,
        unique: true,
        },
    roomId: {
        type: String,
        required: true,
        unique: true,
        },
    word: {
        type: String,
        required: true
        },
    category: {
        type: String,
        required: true
        },      
    },
    {
      timestamps: true,
    },
  );

  const userModel = model('UserDetails', userSchema);

  export default userModel;