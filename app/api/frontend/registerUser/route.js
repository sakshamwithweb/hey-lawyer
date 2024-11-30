import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(params) {
    try {
        const { name, omiUserId, profession, age, race, nationality, gender } = await params.json();
        if (name.trim().length == 0 || omiUserId.trim().length == 0 || profession.trim().length == 0 || age.trim().length == 0 || race.trim().length == 0 || nationality.trim().length == 0 || gender.trim().length == 0) {
            return NextResponse.json({ success: false, error: "Please fill all the fields" }, { status: 400 })
        }
        await dbConnect()
        const userFind = await User.findOne({ omiUserId })
        if (userFind) {
            return NextResponse.json({ success: false, error: "User already exists" }, { status: 400 })
        }
        const result = new User({ name, omiUserId, profession, age, race, nationality, gender });
        await result.save();
        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}