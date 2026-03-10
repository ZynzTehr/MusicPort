import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document
{
    name: string;
    email: string;
    password?: string;
    googleId?: string;
    appleId?: string;
    isAdmin: boolean;
    lastLogin?: Date;

    bio?: string;
    photo?: string;
    viewedProducts: {
        _id: mongoose.Types.ObjectId;
        createdAt?: Date;
        updatedAt?: Date;
    }[];
    purchasedProducts: {
        _id: mongoose.Types.ObjectId;
    }[];
    completedLessons: {
        _id: mongoose.Types.ObjectId;
    }[];
    comparePassword ( password: string ): Promise<boolean>;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: false,
            trim: true,
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        appleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        lastLogin: {
            type: Date,
        },

        bio: {
            type: String,
            trim: true,
        },
        photo: {
            type: String,
        },
        viewedProducts: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Product',
            },
            { timestamps: true }
        ],
        purchasedProducts: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Product',
            },
        ],
        completedLessons: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Lesson',
            },
        ],
    },
    { timestamps: true }
);

// Hash password middleware
userSchema.pre( 'save', async function ( next )
{
    if ( ( this.isModified( 'password' ) || this.isNew ) && this.password )
    {
        try
        {
            const hash = await bcrypt.hash( this.password as string, 10 );
            this.password = hash;
            next();
        } catch ( err: any )
        {
            next( err );
        }
    } else
    {
        return next();
    }
} );

// Compare password method
userSchema.methods.comparePassword = async function ( password: string ): Promise<boolean>
{
    if ( !this.password ) return false;
    return bcrypt.compare( password, this.password as string );
};

const User: Model<IUser> = mongoose.model<IUser>( 'User', userSchema );
export default User;
