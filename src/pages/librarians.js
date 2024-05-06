import React from "react";
import { useState, useEffect } from "react";


export function Librarians() {
    const [content, setContent] = useState(<LibrarianList showForm={showForm} />)

    function showList() {
        setContent(<LibrarianList showForm={showForm} />);
    }

    function showForm(librarian) {
            setContent(<LibrarianForm librarian={librarian} showList={showList}/>);
    }

    return(
        <div className="container my-5">
            {content}
        </div>
    );
}

function LibrarianList(props){
    const [librarians, setLibrarians] = useState([]);

    function fetchLibrarians(){
        fetch("http://localhost:3004/librarians")
        .then((response) => {
        if(!response.ok) {
            throw new Error("Unexpected Server Response");
        }
        return response.json()
        })

       .then((data) => {
        //console.log(data);
        setLibrarians(data);
    })
       
    .catch((error) => console.log(error.message));
    }

    //fetchLibrarians();
    useEffect(() => fetchLibrarians(), [] );
    function deleteLibrarian(id){
        fetch('http://localhost:3004/librarians/' + id, {
            method: 'DELETE'
        })
        .then((response) => response.json())
        .then((data) => fetchLibrarians());
    }

    return(
        <>
        <h2 className="text-center mb-3">List of Librarians</h2>
        <button onClick={() => props.showForm({})} className="btn btn-primary me-2" type="button">Create</button>
        <button onClick={() => fetchLibrarians()} className="btn btn-outline-primary me-2" type="button">Refresh</button>
        <table className="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>CPF</th>
                    <th>Phone</th>
                    <th>Created At</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
               {
                librarians.map((librarian, index) => {
                    return(
                        <tr key={index}>
                            <td>{librarian.id}</td>
                            <td>{librarian.name}</td>
                            <td>{librarian.email}</td>
                            <td>{librarian.cpf}</td>
                            <td>{librarian.phone}</td>
                            <td>{librarian.createdAt}</td>
                            <td style={{width: "10px", whiteSpace: "nowrap"}}>
                                <button onClick={() => props.showForm(librarian)} className="btn btn-primary btn-sm me-2" type="button">Edit</button>
                                <button onClick={() => deleteLibrarian(librarian.id)} className="btn btn-danger btn-sm" type="button">Delete</button>
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


function LibrarianForm(props){

    const [errorMessage, setErrorMessage] = useState("");

    function handleSubmit(event) {
        event.preventDefault();
      
        const formData = new FormData(event.target);
      
        const librarian = Object.fromEntries(formData.entries());
      
        if (!librarian.name || !librarian.cpf || !librarian.phone || !librarian.email) {
          console.log("Please, provide all the required fields!");
          setErrorMessage(
            <div class="alert alert-warning" role="alert">
              Please, provide all the required fields!
            </div>
          );
          return;
        }
        
        if(props.librarian.id){
            fetch("http://localhost:3004/librarians/" + props.librarian.id, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(librarian)
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
            librarian.createdAt = new Date().toISOString().slice(0,10);
            fetch("http://localhost:3004/librarians", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(librarian)

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
        <h2 className="text-center mb-3">{props.librarian.id ? "Edit Librarian" : "Create New Librarian"} </h2>        
        <div className="row">
            <div className="col-lg-6 mx-auto">

                {errorMessage}

                <form onSubmit={(event) => handleSubmit(event)}>
                {props.librarian.id && <div className="row mb-3">
                        <label className="col-sm4 col-form-label">ID</label>
                        <div className="col-sm-8">
                            <input readOnly name="id" type="text" className="form-control-plaintext" defaultValue={props.librarian.id} placeholder="ID" />
                        </div>
                    </div>}

                    <div className="row mb-3">
                        <label className="col-sm4 col-form-label">Name</label>
                        <div className="col-sm-8">
                            <input name="name" type="text" className="form-control" defaultValue={props.librarian.name} placeholder="Name" />
                        </div>
                    </div>

                    <div className="row mb-3">
                        <label className="col-sm4 col-form-label">Email</label>
                        <div className="col-sm-8">
                            <input name="email" type="text" className="form-control" defaultValue={props.librarian.email} placeholder="Email" />
                        </div>
                    </div>

                    <div className="row mb-3">
                        <label className="col-sm4 col-form-label">CPF</label>
                        <div className="col-sm-8">
                            <input name="cpf" type="text" className="form-control" defaultValue={props.librarian.cpf} placeholder="CPF" />
                        </div>
                    </div>

                    <div className="row mb-3">
                        <label className="col-sm4 col-form-label">Phone</label>
                        <div className="col-sm-8">
                            <input name="phone" type="text" className="form-control" defaultValue={props.librarian.phone} placeholder="Phone" />
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
