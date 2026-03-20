"use server"

import { connectToDatabase } from "@/database/mongoose";
import { CreateBook, TextSegment } from "@/types";
import { generateSlug, serializeData } from "../utils";
import Book from "@/database/models/book.model";
import BookSegment from "@/database/models/bookSegment.model";

export const checkBookExists = async (title : string) => {
    try {

        await connectToDatabase()
        const slug = generateSlug(title)
        const existingBook = await Book.findOne({slug}).lean()
       if(existingBook) {
        return {
            exists: true, data: serializeData(existingBook)
        }
       }

       return {
        exists: false
       }
        
    } catch (error) {
        console.error("Error checking book exists", error)
        return {
            exists: false, error
        }
    }
}


export const createBook = async (data: CreateBook) => {
    try {
        await connectToDatabase()
        const slug = generateSlug(data.title)
        const existingBook = await Book.findOne({slug}).lean()
        if(existingBook){
            return {
                success: false,
                data: serializeData(existingBook),
                alreadyExists: true
            }
        }
        // Check subscription limit before creating a book

        const book = await Book.create({...data, slug, totalSegments: 0})
        return {
            success: true,
            data: serializeData(book),
            message: "Book created successfully"
        }

    } catch (error) {
        console.error("Error creating a book", error)
        return {
            success: false,
            message: error
        }
    }
}

export const saveBookSegments = async (bookId: string, clerkId: string, segments: TextSegment[]) => {
    try {
        await connectToDatabase()
        const segmentsToInsert = segments.map(({text, segmentIndex, wordCount, pageNumber}) => ({
            bookId,
            clerkId,
            content: text,
            segmentIndex,
            wordCount,
            pageNumber
        }))
        await BookSegment.insertMany(segmentsToInsert)
        await Book.findByIdAndUpdate(bookId, {totalSegments: segments.length})
        return {
            success: true,
            data: {segmentsCreated: segments.length}
        }
    } catch (error) {
        console.error("Error saving book segments", error)
        await BookSegment.deleteMany({bookId})
        await Book.findByIdAndDelete(bookId)
        console.error("Deleted book segments and book due to failure to save segments")
        return {
            success: false,
            message: error
        }
    }
}