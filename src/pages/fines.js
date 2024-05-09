import React from "react";
import { useState, useEffect } from "react";

export function Fines() {
    const [content, setContent] = useState(<FineList showForm={showForm} />)

    function showList() {
        setContent(<FineList showForm={showForm} />);
    }

    function showForm(fine) {
            setContent(<FineForm fine={fine} showList={showList}/>);
    }

    return(
        <div className="container my-5">
            {content}
        </div>
    );
}

function FineList(props){
    const [fines, setFines] = useState([]);

    function fetchFines(){
        fetch("http://localhost:3004/fines")
        .then((response) => {
        if(!response.ok) {
            throw new Error("Unexpected Server Response");
        }
        return response.json()
        })

       .then((data) => {
        //console.log(data);
        setFines(data);
    })
       
    .catch((error) => console.log(error.message));
    }

    //fetchFines();
    useEffect(() => fetchFines(), [] );
    function deleteFine(id){
        fetch('http://localhost:3004/fines/' + id, {
            method: 'DELETE'
        })
        .then((response) => response.json())
        .then((data) => fetchFines());
    }

    return(
        <>
        <h2 className="text-center mb-3">List of Fines</h2>
        <button onClick={() => props.showForm({})} className="btn btn-primary me-2" type="button">Pay Fine</button>
        <button onClick={() => fetchFines()} className="btn btn-outline-primary me-2" type="button">Refresh</button>
        <table className="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Reader's CPF</th>
                    <th>Book's Title</th>
                    <th>Price</th>
                    <th>Fine's Status</th>
                    <th>Created At</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
               {
                fines.map((fine, index) => {
                    return(
                        <tr key={index}>
                            <td>{fine.id}</td>
                            <td>{fine.cpfReader}</td>
                            <td>{fine.titleBook}</td>
                            <td>{fine.price}</td>
                            <td>{fine.statusFine}</td>
                            <td>{fine.createdAt}</td>
                            <td style={{width: "10px", whiteSpace: "nowrap"}}>
                                <button onClick={() => deleteFine(fine.id)} className="btn btn-danger btn-sm" type="button">Delete</button>
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


function FineForm(props){

    const [errorMessage, setErrorMessage] = useState("");

    function handleSubmit(event) {
        event.preventDefault();
      
        const formData = new FormData(event.target);
      
        const fine = Object.fromEntries(formData.entries());
      
        if (!fine.cpfReader || !fine.titleBook) {
          console.log("Please, provide all the required fields!");
          setErrorMessage(
            <div class="alert alert-warning" role="alert">
              Please, provide all the required fields!
            </div>
          );
          return;
        }

        // Verifica se a multa foi marcada como paga
        const isPaid = formData.get("statusFine") === "Paid";

        // Atualiza o status da multa para "Paid" se a multa foi paga
        if (isPaid) {
          fine.statusFine = "Paid";
        }
        
        if(props.fine.id){
            fetch("http://localhost:3004/fines/" + props.fine.id, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(fine)
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
            fine.createdAt = new Date().toISOString().slice(0,10);
            fetch("http://localhost:3004/fines", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(fine)

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
        <h2 className="text-center mb-3">{"Paid New Fine"} </h2>        
        <div className="row">
            <div className="col-lg-6 mx-auto">

                {errorMessage}

                <form onSubmit={(event) => handleSubmit(event)}>
                {props.fine.id && <div className="row mb-3">
                        <label className="col-sm4 col-form-label">ID</label>
                        <div className="col-sm-8">
                            <input readOnly name="id" type="text" className="form-control-plaintext" defaultValue={props.fine.id} placeholder="ID" />
                        </div>
                    </div>}

                    <div className="row mb-3">
                        <label className="col-sm4 col-form-label">Reader's CPF</label>
                        <div className="col-sm-8">
                            <input name="cpfReader" type="text" className="form-control" defaultValue={props.fine.cpfReader} placeholder="Reader's CPF" />
                        </div>
                    </div>

                    <div className="row mb-3">
                        <label className="col-sm4 col-form-label">Book's Title</label>
                        <div className="col-sm-8">
                            <input name="titleBook" type="text" className="form-control" defaultValue={props.fine.titleBook} placeholder="Book's Title" />
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

