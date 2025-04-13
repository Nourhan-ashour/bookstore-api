const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

const JWT_SECRET_KEY="your_secure_secret_key_here";
//****************************************************************************************************** */
public_users.get('/fetch-books', async function (req, res) {
  try {
    const response = await axios.get('https://openlibrary.org/subjects/love.json');  // استبدل بـ URL الـ API الصحيح
    const fetchedBooks = response.data.works;  // ناخد فقط الكتب من داخل JSON
    return res.status(200).json(fetchedBooks);  // إرسال الكتب كاستجابة
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});


//******************************************************************** */
public_users.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and Password are required" });
  }

  const userExists =await users.find((user) => user.username === username);

  if (userExists) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username, password });

  return res.status(200).json({ message: "User registered successfully" });
});


// Get the book list available in the shop
// Get all books
/*public_users.get('/', (req, res) => {
  return res.status(200).json(books);
});*/
//
//*************************************************************************** */
public_users.get('/', function (req, res) {
  // تحويل الكائن `books` إلى تنسيق JSON قابل للعرض
  const booksList = JSON.stringify(books, null, 2); // باستخدام 2 مسافات للتنسيق
  return res.status(200).send(booksList); // إرجاع الكتب بشكل منسق
});

//********************************************************************************** */
// Get book details based on ISBN
/*public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const ISBN =req.params.isbn;
  const book_ispn =books[ISBN];

  if(book_ispn){
    return res.status(200).json({message: "find book", book: book_ispn});

  } else {
    return res.status(404).json({message: "Book not found"});
}
  });*/

  public_users.get('/isbn/:isbn', async function (req, res) {
    const { isbn } = req.params;
  
    try {
      // هنا بنفترض إن الـ API بيجيب بيانات كتاب معين باستخدام الـ ISBN
      const response = await axios.get(`https://openlibrary.org/isbn/${isbn}.json`);
      const book = response.data;
  
      return res.status(200).json({ message: "Book found", book });
    } catch (error) {
      return res.status(404).json({ message: "Book not found", error: error.message });
    }
  });
  //*////////////////////////////////////////////////////////////////////
// Get book details based on author
/*public_users.get('/author/:author',function (req, res) {

  //Write your code here
const author =req.params.author; // خدنا اسم المؤلف من ال URL
const booksByAuthor = Object.values(books).filter(book => book.author.toLowerCase().includes(author.toLowerCase()));
if (booksByAuthor.length === 0) {
  return res.status(404).json({ message: "No books found for this author" });
}
return res.status(200).json(booksByAuthor);});
*/

public_users.get('/author/:author', async function (req, res) {
  const { author } = req.params;

  try {
    // استدعاء بيانات الكتب حسب اسم المؤلف من OpenLibrary
    const response = await axios.get(`https://openlibrary.org/search.json?author=${author}`);
    const booksByAuthor = response.data.docs;

    if (booksByAuthor.length === 0) {
      return res.status(404).json({ message: "No books found for this author" });
    }

    return res.status(200).json(booksByAuthor);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by author", error: error.message });
  }
});

/////////////////////////////////////////////////////////////////////

/*

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const { title } = req.params;
  const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
  if (booksByTitle.length === 0) {
    return res.status(404).json({ message: "No books found with this title" });
  }
  return res.status(200).json(booksByTitle);});
*/

public_users.get('/title/:title', async function (req, res) {
  const { title } = req.params;

  try {
    const response = await axios.get(`https://openlibrary.org/search.json?title=${title}`);
    const booksByTitle = response.data.docs;

    if (booksByTitle.length === 0) {
      return res.status(404).json({ message: "No books found with this title" });
    }

    return res.status(200).json(booksByTitle);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by title", error: error.message });
  }
});




//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here

  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(book.reviews);

  });

module.exports.general = public_users;
