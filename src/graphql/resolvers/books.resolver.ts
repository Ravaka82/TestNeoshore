import { createBook, updateBook, deleteBook, getAllBooks, getBookById } from '../services/books'

export default {
    Query: {
        books: async ({limit}: { limit: number }, context: any) => {
            // return limit ? booksData.slice(0, limit) : booksData;
            return await getAllBooks(limit)
        },
        book: async ({id}: { id: string }, context: any) => {
            // return booksData.find(book => book.id === id);
            return await getBookById(id)
        }
    },
    Mutation: {
        addBook: async ({ title, author, description }: Book, context: any) => {
            try {
                const book = await createBook({ title, author, description })
                // const book = { id: `${books.length+1}`, title, author, description }
                // books.push(book)
                return {
                    data: book,
                    ok: true,
                    error: ''
                };
            } catch (error: any) {
                return {
                    data: null,
                    ok: false,
                    error: error.message
                };
            }
        },
        updateBook: async ({ id, title, author, description }: Book & {id: string}, context: any) => {
            // const book = books.find(book => book.id === id);
            // if (!book) {
            //     return {
            //         data: null,
            //         ok: false,
            //         error: 'Book not found'
            //     };
            // }
            // if (author) book.author = author
            // if (title) book.title = title
            // if (description) book.description = description
            // books = books.map(b => b.id === id ? book : b)
            try {
                const book = await updateBook(id, { title, author, description })
                if (!book) {
                    return {
                        data: null,
                        ok: false,
                        error: 'Book not found'
                    };
                }
                return {
                    data: book,
                    ok: true,
                    error: ''
                };
            } catch (error: any) {
                return {
                    data: null,
                    ok: false,
                    error: error.message
                };
            }
        },
        deleteBook: async ({ id }: {id: string }, contex: any) => {
            // const book = books.find(book => book.id === id)

            
            // books = books.filter(book => book.id !== id)
            try {
                const book = await deleteBook(id)
                if (!book) {
                    return {
                        data: null,
                        ok: false,
                        error: 'Book not found'
                    };
                }
                return {
                    data: book,
                    ok: true,
                    error: ''
                };
            }
            catch (error: any) {
                return {
                    data: null,
                    ok: false,
                    error: error.message
                };
            }
        }
    }
};
interface Book {
    title: string
    description: string
    author: string
}
