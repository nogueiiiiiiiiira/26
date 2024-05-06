import React from "react";
import { useState, useEffect } from "react";

export function Loans() {
    const [content, setContent] = useState(<LoanList showForm={showForm} />)

    function showList() {
        setContent(<LoanList showForm={showForm} />);
    }

    function showForm(loan) {
            setContent(<LoanForm loan={loan} showList={showList}/>);
    }

    return(
        <div className="container my-5">
            {content}
        </div>
    );
}

function LoanList(props){
    const [loans, setLoans] = useState([]);

    function addDaysToDate(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result.toISOString().slice(0, 10);
      }

    function fetchLoans(){
        fetch("http://localhost:3004/loans")
        .then((response) => {
        if(!response.ok) {
            throw new Error("Unexpected Server Response");
        }
        return response.json()
        })

       .then((data) => {
        //console.log(data);
        setLoans(data);
    })
       
    .catch((error) => console.log(error.message));
    }

    //fetchLoans();
    useEffect(() => fetchLoans(), [] );
    function deleteLoan(id){
        fetch('http://localhost:3004/loans/' + id, {
            method: 'DELETE'
        })
        .then((response) => response.json())
        .then((data) => fetchLoans());
    }

    return(
        <>
        <h2 className="text-center mb-3">List of Loans</h2>
        <button onClick={() => props.showForm({})} className="btn btn-primary me-2" type="button">Create</button>
        <button onClick={() => fetchLoans()} className="btn btn-outline-primary me-2" type="button">Refresh</button>
        <table className="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Reader's CPF</th>
                    <th>Book's Title</th>
                    <th>Created At</th>
                    <th>Return Forecast</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
               {
                loans.map((loan, index) => {
                    return(
                        <tr key={index}>
                            <td>{loan.id}</td>
                            <td>{loan.cpfReader}</td>
                            <td>{loan.titleBook}</td>
                            <td>{loan.createdAt}</td>
                            <td>{addDaysToDate(loan.createdAt, 7)}</td>
                            <td style={{width: "10px", whiteSpace: "nowrap"}}>
                                <button onClick={() => props.showForm(loan)} className="btn btn-primary btn-sm me-2" type="button">Edit</button>
                                <button onClick={() => deleteLoan(loan.id)} className="btn btn-danger btn-sm" type="button">Delete</button>
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


function LoanForm(props){

    const [errorMessage, setErrorMessage] = useState("");

    function handleSubmit(event) {
        event.preventDefault();
    
        const formData = new FormData(event.target);
        const loan = Object.fromEntries(formData.entries());
    
        if (!loan.cpfReader || !loan.titleBook) {
          console.log("Please, provide all the required fields!");
          setErrorMessage(
            <div className="alert alert-warning" role="alert">
              Please, provide all the required fields!
            </div>
          );
          return;
        }
    
        // Verificar se o CPF do leitor existe na tabela readers
        fetch(`http://localhost:3004/readers?cpf=${loan.cpfReader}`)
         .then((response) => response.json())
         .then((data) => {
            if (!data.length) {
              console.log("Reader not found!");
              setErrorMessage(
                <div className="alert alert-warning" role="alert">
                  Reader not found!  It's not possible to realize the loan!
                </div>
              );
              return;
            }
    
            // Verificar se o título do livro existe na tabela books
            fetch(`http://localhost:3004/books?title=${loan.titleBook}`)
             .then((response) => response.json())
             .then((data) => {
                if (!data.length) {
                  console.log("Book not found!");
                  setErrorMessage(
                    <div className="alert alert-warning" role="alert">
                      Book not found! It's not possible to realize the loan! Check if it's exists or the book's status in the stock!
                    </div>
                  );
                  return;
                }
    
                // Se ambos os campos existem, criar ou editar o empréstimo
                if (props.loan.id) {
                  fetch(`http://localhost:3004/loans/${props.loan.id}`, {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(loan),
                  })
                   .then((response) => {
                      if (!response.ok) {
                        throw new Error("Unexpected Server Response");
                      }
                      return response.json();
                    })
                    .then((data) => {
                        props.showList(); // Mostra a lista de empréstimos após o salvamento bem-sucedido
                        // Reduz a quantidade disponível de livros na tabela "books"
                        fetch(`http://localhost:3004/books?title=${loan.titleBook}`)
                            .then((response) => response.json())
                            .then((books) => {
                                if (books.length) {
                                    const book = books[0];
                                    book.amount -= 1; // Diminui a quantidade disponível em 1
                                    // Atualiza a quantidade disponível do livro
                                    fetch(`http://localhost:3004/books/${book.id}`, {
                                        method: "PATCH",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify(book),
                                    })
                                    .then((response) => {
                                        if (!response.ok) {
                                            throw new Error("Unexpected Server Response");
                                        }
                                        return response.json();
                                    })
                                    .catch((error) => {
                                        console.error("Error:", error);
                                    });
                                }
                            })
                            .catch((error) => {
                                console.error("Error:", error);
                            });
                    })
                    .catch((error) => {
                        console.error("Error:", error);
                    });
                } else {
                  loan.createdAt = new Date().toISOString().slice(0, 10);
                  fetch("http://localhost:3004/loans", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(loan),
                  })
                   .then((response) => {
                      if (!response.ok) {
                        throw new Error("Unexpected Server Response");
                      }
                      return response.json();
                    })
                   .then((data) => {
                        props.showList(); // Mostra a lista de empréstimos após o salvamento bem-sucedido
                        // Reduz a quantidade disponível de livros na tabela "books"
                        fetch(`http://localhost:3004/books?title=${loan.titleBook}`)
                            .then((response) => response.json())
                            .then((books) => {
                                if (books.length) {
                                    const book = books[0];
                                    book.amount -= 1; // Diminui a quantidade disponível em 1
                                    // Atualiza a quantidade disponível do livro
                                    fetch(`http://localhost:3004/books/${book.id}`, {
                                        method: "PATCH",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify(book),
                                    })
                                    .then((response) => {
                                        if (!response.ok) {
                                            throw new Error("Unexpected Server Response");
                                        }
                                        return response.json();
                                    })
                                    .catch((error) => {
                                        console.error("Error:", error);
                                    });
                                }
                            })
                            .catch((error) => {
                                console.error("Error:", error);
                            });
                    })
                   .catch((error) => {
                      console.error("Error:", error);
                    });
                }
              })
             .catch((error) => {
                console.error("Error:", error);
              });
          })
         .catch((error) => {
            console.error("Error:", error);
          });
      }

    return(
        <>
        <h2 className="text-center mb-3">{props.loan.id ? "Edit Loan" : "Create New Loan"} </h2>        
        <div className="row">
            <div className="col-lg-6 mx-auto">

                {errorMessage}

                <form onSubmit={(event) => handleSubmit(event)}>
                {props.loan.id && <div className="row mb-3">
                        <label className="col-sm4 col-form-label">ID</label>
                        <div className="col-sm-8">
                            <input readOnly name="id" type="text" className="form-control-plaintext" defaultValue={props.loan.id} placeholder="ID" />
                        </div>
                    </div>}

                    <div className="row mb-3">
                        <label className="col-sm4 col-form-label">CPF</label>
                        <div className="col-sm-8">
                            <input name="cpfReader" type="text" className="form-control" defaultValue={props.loan.cpfReader} placeholder="Reader's CPF" />
                        </div>
                    </div>

                    <div className="row mb-3">
                        <label className="col-sm4 col-form-label">Book's Title</label>
                        <div className="col-sm-8">
                            <input name="titleBook" type="text" className="form-control" defaultValue={props.loan.titleBook} placeholder="Book's Title" />
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
