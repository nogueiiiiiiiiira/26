import React, { useState, useEffect } from "react";

export function Returns() {
  const [content, setContent] = useState(<ReturnList showForm={showForm} />);

  function showList() {
    setContent(<ReturnList showForm={showForm} />);
  }

  function showForm(ret) {
    setContent(<ReturnForm ret={ret} showList={showList} />);
  }

  return (
    <div className="container my-5">
      {content}
    </div>
  );
}

function ReturnList(props) {
  const [returns, setReturns] = useState([]);

  function fetchReturns() {
    fetch("http://localhost:3004/returns")
     .then((response) => {
        if (!response.ok) {
          throw new Error("Unexpected Server Response");
        }
        return response.json();
      })
     .then((data) => {
        setReturns(data);
      })
     .catch((error) => console.log(error.message));
  }

  useEffect(() => fetchReturns(), []);
  function deleteReturn(id) {
    fetch(`http://localhost:3004/returns/${id}`, {
      method: "DELETE",
    })
     .then((response) => response.json())
     .then((data) => fetchReturns());
  }

  return (
    <>
      <h2 className="text-center mb-3">List of Returns</h2>
      <button onClick={() => props.showForm({})} className="btn btn-primary me-2" type="button">
        Create
      </button>
      <button onClick={() => fetchReturns()} className="btn btn-outline-primary me-2" type="button">
        Refresh
      </button>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Reader's CPF</th>
            <th>Book's Title</th>
            <th>Created At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {returns.map((ret, index) => {
            return (
              <tr key={index}>
                <td>{ret.id}</td>
                <td>{ret.cpfReader}</td>
                <td>{ret.titleBook}</td>
                <td>{ret.createdAt}</td>
                <td style={{ width: "10px", whiteSpace: "nowrap" }}>
                  <button onClick={() => props.showForm(ret)} className="btn btn-primary btn-sm me-2" type="button">
                    Edit
                  </button>
                  <button onClick={() => deleteReturn(ret.id)} className="btn btn-danger btn-sm" type="button">
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

function ReturnForm(props) {
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
  
      if (props.ret.id) {
        fetch(`http://localhost:3004/returns/${props.ret.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ret),
        })
         .then((response) => {
            if (!response.ok) {
              throw new Error("Unexpected Server Response");
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
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ret),
        })
         .then((response) => {
            if (!response.ok) {
              throw new Error("Unexpected Server Response");
            }
            return response.json();
          })
         .then((data) => props.showList())
         .catch((error) => {
            console.error("Error:", error);
          });
      }
    }
  
    return (
      <>
        <h2 className="text-center mb-3">{"Create New Return"} </h2>
        <div className="row">
          <div className="col-lg-6 mx-auto">
            {errorMessage}
  
            <form onSubmit={(event) => handleSubmit(event)}>
              {props.ret.id && (
                <div className="row mb-3">
                  <label className="col-sm4 col-form-label">ID</label>
                  <div className="col-sm-8">
                    <input
                      readOnly
                      name="id"
                      type="text"
                      className="form-control-plaintext"
                      defaultValue={props.ret.id}
                      placeholder="ID"
                    />
                  </div>
                </div>
              )}
  
              <div className="row mb-3">
                <label className="col-sm4 col-form-label">Reader's CPF</label>
                <div className="col-sm-8">
                  <input
                    name="cpfReader"
                    type="text"
                    className="form-control"
                    defaultValue={props.ret.cpfReader}
                    placeholder="Reader's CPF"
                  />
                </div>
              </div>
  
              <div className="row mb-3">
                <label className="col-sm4 col-form-label">Book's Title</label>
                <div className="col-sm-8">
                  <input
                    name="titleBook"
                    type="text"
                    className="form-control"
                    defaultValue={props.ret.titleBook}
                    placeholder="Book's Title"
                  />
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