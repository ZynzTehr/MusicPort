import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILesson extends Document
{
    title: string;
    instrument: 'guitar' | 'bass' | 'drums' | 'keyboard';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    videoUrl: string;
    content: string;
    thumbnail: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        instrument: {
            type: String,
            enum: [ 'guitar', 'bass', 'drums', 'keyboard' ],
            required: true,
        },
        difficulty: {
            type: String,
            enum: [ 'beginner', 'intermediate', 'advanced' ],
            required: true,
        },
        videoUrl: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            default: '',
        },
        thumbnail: {
            type: String,
            default: '',
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Lesson: Model<ILesson> = mongoose.model<ILesson>( 'Lesson', lessonSchema );
export default Lesson;
