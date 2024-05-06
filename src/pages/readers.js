import React from "react";
import { useState, useEffect } from "react";

export function Readers() {
    const [content, setContent] = useState(<ReaderList showForm={showForm} />)

    function showList() {
        setContent(<ReaderList showForm={showForm} />);
    }

    function showForm(reader) {
            setContent(<ReaderForm reader={reader} showList={showList}/>);
    }

    return(
        <div className="container my-5">
            {content}
        </div>
    );
}

function ReaderList(props){
    const [readers, setReaders] = useState([]);

    function fetchReaders(){
        fetch("http://localhost:3004/readers")
        .then((response) => {
        if(!response.ok) {
            throw new Error("Unexpected Server Response");
        }
        return response.json()
        })

       .then((data) => {
        //console.log(data);
        setReaders(data);
    })
       
    .catch((error) => console.log(error.message));
    }

    //fetchReaders();
    useEffect(() => fetchReaders(), [] );
    function deleteReader(id){
        fetch('http://localhost:3004/readers/' + id, {
            method: 'DELETE'
        })
        .then((response) => response.json())
        .then((data) => fetchReaders());
    }

    return(
        <>
        <h2 className="text-center mb-3">List of Readers</h2>
        <button onClick={() => props.showForm({})} className="btn btn-primary me-2" type="button">Create</button>
        <button onClick={() => fetchReaders()} className="btn btn-outline-primary me-2" type="button">Refresh</button>
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
                readers.map((reader, index) => {
                    return(
                        <tr key={index}>
                            <td>{reader.id}</td>
                            <td>{reader.name}</td>
                            <td>{reader.email}</td>
                            <td>{reader.cpf}</td>
                            <td>{reader.phone}</td>
                            <td>{reader.createdAt}</td>
                            <td style={{width: "10px", whiteSpace: "nowrap"}}>
                                <button onClick={() => props.showForm(reader)} className="btn btn-primary btn-sm me-2" type="button">Edit</button>
                                <button onClick={() => deleteReader(reader.id)} className="btn btn-danger btn-sm" type="button">Delete</button>
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


function ReaderForm(props){

    const [errorMessage, setErrorMessage] = useState("");

    function handleSubmit(event) {
        event.preventDefault();
      
        const formData = new FormData(event.target);
      
        const reader = Object.fromEntries(formData.entries());
      
        if (!reader.name || !reader.cpf || !reader.phone || !reader.email) {
          console.log("Please, provide all the required fields!");
          setErrorMessage(
            <div class="alert alert-warning" role="alert">
              Please, provide all the required fields!
            </div>
          );
          return;
        }
        
        if(props.reader.id){
            fetch("http://localhost:3004/readers/" + props.reader.id, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(reader)
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
            reader.createdAt = new Date().toISOString().slice(0,10);
            fetch("http://localhost:3004/readers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(reader)

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
        <h2 className="text-center mb-3">{props.reader.id ? "Edit Reader" : "Create New Reader"} </h2>        
        <div className="row">
            <div className="col-lg-6 mx-auto">

                {errorMessage}

                <form onSubmit={(event) => handleSubmit(event)}>
                {props.reader.id && <div className="row mb-3">
                        <label className="col-sm4 col-form-label">ID</label>
                        <div className="col-sm-8">
                            <input readOnly name="id" type="text" className="form-control-plaintext" defaultValue={props.reader.id} placeholder="ID" />
                        </div>
                    </div>}

                    <div className="row mb-3">
                        <label className="col-sm4 col-form-label">Name</label>
                        <div className="col-sm-8">
                            <input name="name" type="text" className="form-control" defaultValue={props.reader.name} placeholder="Name" />
                        </div>
                    </div>

                    <div className="row mb-3">
                        <label className="col-sm4 col-form-label">Email</label>
                        <div className="col-sm-8">
                            <input name="email" type="text" className="form-control" defaultValue={props.reader.email} placeholder="Email" />
                        </div>
                    </div>

                    <div className="row mb-3">
                        <label className="col-sm4 col-form-label">CPF</label>
                        <div className="col-sm-8">
                            <input name="cpf" type="text" className="form-control" defaultValue={props.reader.cpf} placeholder="CPF" />
                        </div>
                    </div>

                    <div className="row mb-3">
                        <label className="col-sm4 col-form-label">Phone</label>
                        <div className="col-sm-8">
                            <input name="phone" type="text" className="form-control" defaultValue={props.reader.phone} placeholder="Phone" />
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
