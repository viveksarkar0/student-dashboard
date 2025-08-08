import mongoose, { Schema } from "mongoose";
import crypto from "crypto";
export var Role;
(function (Role) {
    Role["Admin"] = "admin";
    Role["Teacher"] = "teacher";
    Role["User"] = "user";
})(Role || (Role = {}));
const userSchema = new Schema({
    avatar: {
        type: String,
        default: function () {
            return 'https://avatar.iran.liara.run/public/boy';
        },
    },
    firstName: { type: String },
    lastName: { type: String, default: "" },
    username: {
        type: String,
        get() {
            return (this.firstName + this.email.slice(0, 5)).trim();
        },
    },
    fullName: {
        type: String,
        get() {
            return `${this.firstName} ${this.lastName}`.trim();
        },
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    salt: { type: String, required: true, select: false }, // Store salt
    onboard: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    account: {
        type: Schema.Types.ObjectId,
        ref: "Account",
    },
    role: { type: String, enum: Object.values(Role), default: Role.User },
    status: {
        status: Boolean,
        lastLoginAt: Date,
        lastLogoutAt: Date,
    },
    lastSeen: Date,
    starredChats: [{
            type: Schema.Types.ObjectId,
            ref: 'Chat'
        }]
}, { timestamps: true });
// method to hash password
export async function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
        .pbkdf2Sync(password, salt, 10000, 32, "sha512")
        .toString("hex");
    return { hash, salt };
}
// Instance method to compare password
userSchema.methods.comparePassword = function (password) {
    const hashedPassword = crypto
        .pbkdf2Sync(password, this.salt, 10000, 32, "sha512")
        .toString("hex");
    return hashedPassword === this.password;
};
export const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
