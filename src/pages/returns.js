import React from "react";
import { useState, useEffect } from "react";

export function Rets() {
    const [content, setContent] = useState(<RetList showForm={showForm} />)

    function showList() {
        setContent(<RetList showForm={showForm} />);
    }

    function showForm(ret) {
        setContent(<RetForm ret={ret} showList={showList} />);
    }

    return(
        <div className="container my-5">
            {content}
        </div>
    );
}

function RetList(props){
    const [rets, setRets] = useState([]);

    function fetchRets(){
        fetch("http://localhost:3004/returns")
        .then((response) => {
            if(!response.ok) {
                throw new Error("Unexpected Server Response");
            }
            return response.json()
        })
        .then((data) => {
            setRets(data);
        })
        .catch((error) => console.log(error.message));
    }

    useEffect(() => {
        fetchRets();
    }, []);

    function deleteRet(id){
        fetch('http://localhost:3004/returns/' + id, {
            method: 'DELETE'
        })
        .then((response) => response.json())
        .then((data) => fetchRets());
    }

    return(
        <>
        <h2 className="text-center mb-3">List of Returns</h2>
        <button onClick={() => props.showForm({})} className="btn btn-primary me-2" type="button">Create</button>
        <button onClick={fetchRets} className="btn btn-outline-primary me-2" type="button">Refresh</button>
        <table className="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Reader's CPF</th>
                    <th>Book's Title</th>
                    <th>Return's Status</th>
                    <th>Fine</th>
                    <th>Created At</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {rets.map((ret, index) => (
                    <tr key={index}>
                        <td>{ret.id}</td>
                        <td>{ret.cpfReader}</td>
                        <td>{ret.titleBook}</td>
                        <td>{ret.statusReturn}</td>
                        <td>{ret.fine}</td>
                        <td>{ret.createdAt}</td>
                        <td style={{width: "10px", whiteSpace: "nowrap"}}>
                            <button onClick={() => props.showForm(ret)} className="btn btn-primary btn-sm me-2" type="button">Edit</button>
                            <button onClick={() => deleteRet(ret.id)} className="btn btn-danger btn-sm" type="button">Delete</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        </>
    );
}

function RetForm(props){

    const [errorMessage, setErrorMessage] = useState("");

    function handleSubmit(event) {
        event.preventDefault();
    
        const formData = new FormData(event.target);
        const ret = Object.fromEntries(formData.entries());
    
        if (!ret.cpfReader || !ret.titleBook) {
            console.log("Please, provide all the required fields!");
            setErrorMessage(
                <div className="alert alert-warning" role="alert">
                    Please, provide all the required fields!
                </div>
            );
            return;
        }
    
        fetch(`http://localhost:3004/loans?cpfReader=${ret.cpfReader}&titleBook=${ret.titleBook}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch loan details");
            }
            return response.json();
        })
        .then((data) => {
            if (!data.length) {
                console.log("Reader or book not found in loans!");
                setErrorMessage(
                    <div className="alert alert-warning" role="alert">
                        Reader or book not found in loans! Please check and try again.
                    </div>
                );
                return;
            }
    
            const loan = data[0]; // Assuming only one loan is returned
    
            const returnForecastDate = new Date(loan.returnForecast);
            const currentDate = new Date();
    
            if (currentDate > returnForecastDate) {
                // Return made late
                ret.statusReturn = "Return made late";
                ret.fine = "Attributed"; // Set fine to "Attributed"
    
                const daysLate = Math.ceil((currentDate - returnForecastDate) / (1000 * 60 * 60 * 24)); // Calculate number of days late
                const fineAmount = daysLate; // Fine amount is $1 per day late
    
                // Create fine record
                const fineData = {
                    cpfReader: ret.cpfReader,
                    titleBook: ret.titleBook,
                    price: fineAmount, // $1 per day late
                    statusFine: "Unpaid" // Set status to "Unpaid"
                };
    
                fetch("http://localhost:3004/fines", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(fineData)
                })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to create fine");
                    }
                    return response.json();
                })
                .catch((error) => {
                    console.error("Error creating fine:", error);
                });
            } else {
                // Return made correctly
                ret.statusReturn = "Return made correctly";
                ret.fine = "None"; // Set fine to "None"
            }
    
            if (props.ret.id) {
                fetch(`http://localhost:3004/returns/${props.ret.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(ret)
                })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to update return");
                    }
                    return response.json();
                })
                .then((data) => props.showList())
                .catch((error) => {
                    console.error("Error:", error);
                });
            } else {
                ret.createdAt = new Date().toISOString().slice(0, 10);
                fetch("http://localhost:3004/returns", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(ret)
                })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to create return");
                    }
                    return response.json();
                })
                .then((data) => props.showList())
                .catch((error) => {
                    console.error("Error:", error);
                });
            }
        })
        .catch((error) => {
            console.error("Error:", error.message);
        });
    }
    
    
    return(
        <>
        <h2 className="text-center mb-3">{props.ret.id ? "Edit Return" : "Create New Return"}</h2>        
        <div className="row">
            <div className="col-lg-6 mx-auto">
                {errorMessage}
                <form onSubmit={(event) => handleSubmit(event)}>
                    {props.ret.id && 
                        <div className="row mb-3">
                            <label className="col-sm4 col-form-label">ID</label>
                            <div className="col-sm-8">
                                <input readOnly name="id" type="text" className="form-control-plaintext" defaultValue={props.ret.id} placeholder="ID" />
                            </div>
                        </div>
                    }

                    <div className="row mb-3">
                        <label className="col-sm4 col-form-label">Reader's CPF</label>
                        <div className="col-sm-8">
                            <input name="cpfReader" type="text" className="form-control" defaultValue={props.ret.cpfReader} placeholder="Reader's CPF" />
                        </div>
                    </div>

                    <div className="row mb-3">
                        <label className="col-sm4 col-form-label">Book's Title</label>
                        <div className="col-sm-8">
                            <input name="titleBook" type="text" className="form-control" defaultValue={props.ret.titleBook} placeholder="Book's Title" />
                        </div>
                    </div>

                    <div className="row">
                        <div className="offset-sm-4 col-sm-4 d-grid">
                            <button className="btn btn-primary btn-sm me-3" type="submit">Save</button>
                        </div>
                        <div className="col-sm-4 d-grid">
                            <button onClick={props.showList} className="btn btn-secondary me-2" type="button">Cancel</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        </>
    );
}
