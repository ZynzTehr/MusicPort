import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPost extends Document
{
    content: string;
    author: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const postSchema = new Schema<IPost>( {
    content: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
} );

const Post: Model<IPost> = mongoose.model<IPost>( 'Post', postSchema );
export default Post;
