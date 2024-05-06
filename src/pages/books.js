import React from "react";
import { useState, useEffect } from "react";

export function Books() {
    const [content, setContent] = useState(<BookList showForm={showForm} />)

    function showList() {
        setContent(<BookList showForm={showForm} />);
    }

    function showForm(book) {
            setContent(<BookForm book={book} showList={showList}/>);
    }

    return(
        <div className="container my-5">
            {content}
        </div>
    );
}

function BookList(props){
    const [books, setBooks] = useState([]);

    function fetchBooks(){
        fetch("http://localhost:3004/books")
        .then((response) => {
        if(!response.ok) {
            throw new Error("Unexpected Server Response");
        }
        return response.json()
        })

       .then((data) => {
        //console.log(data);
        setBooks(data);
    })
       
    .catch((error) => console.log(error.message));
    }

    //fetchBooks();
    useEffect(() => fetchBooks(), [] );
    function deleteBook(id){
        fetch('http://localhost:3004/books/' + id, {
            method: 'DELETE'
        })
        .then((response) => response.json())
        .then((data) => fetchBooks());
    }

    return(
        <>
        <h2 className="text-center mb-3">List of Books</h2>
        <button onClick={() => props.showForm({})} className="btn btn-primary me-2" type="button">Create</button>
        <button onClick={() => fetchBooks()} className="btn btn-outline-primary me-2" type="button">Refresh</button>
        <table className="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Created At</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
               {
                books.map((book, index) => {
                    return(
                        <tr key={index}>
                            <td>{book.id}</td>
                            <td>{book.title}</td>
                            <td>{book.author}</td>
                            <td>{book.category}</td>
                            <td>{book.amount}</td>
                            <td>{book.createdAt}</td>
                            <td style={{width: "10px", whiteSpace: "nowrap"}}>
                                <button onClick={() => props.showForm(book)} className="btn btn-primary btn-sm me-2" type="button">Edit</button>
                                <button onClick={() => deleteBook(book.id)} className="btn btn-danger btn-sm" type="button">Delete</button>
                            </td>
                        </tr>
                    );
                })
            }
            </tbody>
        </table>
        </>
    );
}


function BookForm(props){

    const [errorMessage, setErrorMessage] = useState("");

    function handleSubmit(event) {
        event.preventDefault();
      
        const formData = new FormData(event.target);
      
        const book = Object.fromEntries(formData.entries());
      
        if (!book.title || !book.author || !book.category || !book.amount) {
          console.log("Please, provide all the required fields!");
          setErrorMessage(
            <div class="alert alert-warning" role="alert">
              Please, provide all the required fields!
            </div>
          );
          return;
        }
        
        if(props.book.id){
            fetch("http://localhost:3004/books/" + props.book.id, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(book)
            })
            .then((response) => {
            if(!response.ok){
                throw new Error("Unexpected Server Response");
            }
            return response.json()
            })
            .then((data) => props.showList())
            .catch((error) => {
                console.error("Error:", error);
            });
        }
        else {
            book.createdAt = new Date().toISOString().slice(0,10);
            fetch("http://localhost:3004/books", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(book)

            })
            .then((response) => {
            if(!response.ok){
                throw new Error("Unexpected Server Response");
            }
            return response.json()
            })
            .then((data) => props.showList())
            .catch((error) => {
                console.error("Error:", error);
            });
        }
    }

    return(
        <>
        <h2 className="text-center mb-3">{props.book.id ? "Edit Book" : "Create New Book"} </h2>        
        <div className="row">
            <div className="col-lg-6 mx-auto">

                {errorMessage}

                <form onSubmit={(event) => handleSubmit(event)}>
                {props.book.id && <div className="row mb-3">
                        <label className="col-sm4 col-form-label">ID</label>
                        <div className="col-sm-8">
                            <input readOnly name="id" type="text" className="form-control-plaintext" defaultValue={props.book.id} placeholder="ID" />
                        </div>
                    </div>}

                    <div className="row mb-3">
                        <label className="col-sm4 col-form-label">Title</label>
                        <div className="col-sm-8">
                            <input name="title" type="text" className="form-control" defaultValue={props.book.title} placeholder="Title" />
                        </div>
                    </div>

                    <div className="row mb-3">
                        <label className="col-sm4 col-form-label">Author</label>
                        <div className="col-sm-8">
                            <input name="author" type="text" className="form-control" defaultValue={props.book.author} placeholder="Author" />
                        </div>
                    </div>

                    <div className="row mb-3">
                        <label className="col-sm4 col-form-label">Category</label>
                        <div className="col-sm-8">
                            <select className="form-select" name="category" defaultValue={props.book.category}>
                                <option value="Other">Other</option>
                                <option value="Fantasy">Fantasy</option>
                                <option value="Action">Action</option>
                            </select>
                        </div>
                    </div>

                    <div className="row mb-3">
                        <label className="col-sm4 col-form-label">Amount</label>
                        <div className="col-sm-8">
                            <input name="amount" type="number" className="form-control" defaultValue={props.book.amount} placeholder="Amount" />
                        </div>
                    </div>

                    <div className="row">
                        <div className="offset-sm-4 col-sm-4 d-grid">
                            <button className="btn btn-primary btn-sm me-3" type="submit">Save</button>
                        </div>
                        <div className="col-sm-4 d-grid">
                            <button onClick={() => props.showList()} className="btn btn-secondary me-2" type="button">Cancel</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        </>
    );
}
