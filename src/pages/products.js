import React from "react";
import { useState, useEffect } from "react";

export function Products() {
    const [content, setContent] = useState(<ProductList showForm={showForm} />)

    function showList() {
        setContent(<ProductList showForm={showForm} />);
    }

    function showForm(product) {
            setContent(<ProductForm product={product} showList={showList}/>);
    }

    return(
        <div className="container my-5">
            {content}
        </div>
    );
}

function ProductList(props){
    const [products, setProducst] = useState([]);

    function fetchProducts(){
        fetch("http://localhost:3004/products")
        .then((response) => {
        if(!response.ok) {
            throw new Error("Unexpected Server Response");
        }
        return response.json()
        })

       .then((data) => {
        //console.log(data);
        setProducst(data);
    })
       
    .catch((error) => console.log(error.message));
    }

    //fetchProducts();
    useEffect(() => fetchProducts(), [] );
    function deleteProduct(id){
        fetch('http://localhost:3004/products/' + id, {
            method: 'DELETE'
        })
        .then((response) => response.json())
        .then((data) => fetchProducts());
    }

    return(
        <>
        <h2 className="text-center mb-3">List of Products</h2>
        <button onClick={() => props.showForm({})} className="btn btn-primary me-2" type="button">Create</button>
        <button onClick={() => fetchProducts()} className="btn btn-outline-primary me-2" type="button">Refresh</button>
        <table className="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Brand</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Created At</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
               {
                products.map((product, index) => {
                    return(
                        <tr key={index}>
                            <td>{product.id}</td>
                            <td>{product.name}</td>
                            <td>{product.brand}</td>
                            <td>{product.category}</td>
                            <td>{product.price}</td>
                            <td>{product.createdAt}</td>
                            <td style={{width: "10px", whiteSpace: "nowrap"}}>
                                <button onClick={() => props.showForm(product)} className="btn btn-primary btn-sm me-2" type="button">Edit</button>
                                <button onClick={() => deleteProduct(product.id)} className="btn btn-danger btn-sm" type="button">Delete</button>
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


function ProductForm(props){

    const [errorMessage, setErrorMessage] = useState("");

    function handleSubmit(event){
        event.preventDefault();

        const formData = new FormData(event.target);

        const product = Object.fromEntries(formData.entries());

        if(!product.name || !product.category || !product.brand || !product.price ){
            console.log("Please, provide all the required fields!");
            setErrorMessage(
                    <div class="alert alert-warning" role="alert">
                         Please, provide all the required fields!
                    </div>
            );
            return;
        }
        
        if(props.product.id){
            fetch("http://localhost:3004/products/" + props.product.id, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(product)
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
            product.createdAt = new Date().toISOString().slice(0,10);
            fetch("http://localhost:3004/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(product)

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
        <h2 className="text-center mb-3">{props.product.id ? "Edit Product" : "Create New Product"} </h2>        
        <div className="row">
            <div className="col-lg-6 mx-auto">

                {errorMessage}

                <form onSubmit={(event) => handleSubmit(event)}>
                {props.product.id && <div className="row mb-3">
                        <label className="col-sm4 col-form-label">ID</label>
                        <div className="col-sm-8">
                            <input readOnly name="id" type="text" className="form-control-plaintext" defaultValue={props.product.id} placeholder="ID" />
                        </div>
                    </div>}

                    <div className="row mb-3">
                        <label className="col-sm4 col-form-label">Name</label>
                        <div className="col-sm-8">
                            <input name="name" type="text" className="form-control" defaultValue={props.product.name} placeholder="Name" />
                        </div>
                    </div>

                    <div className="row mb-3">
                        <label className="col-sm4 col-form-label">Brand</label>
                        <div className="col-sm-8">
                            <input name="brand" type="text" className="form-control" defaultValue={props.product.brand} placeholder="Brand" />
                        </div>
                    </div>

                    <div className="row mb-3">
                        <label className="col-sm4 col-form-label">Category</label>
                        <div className="col-sm-8">
                            <select className="form-select" name="category" defaultValue={props.product.category}>
                                <option value="Other">Other</option>
                                <option value="Food">Food</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Clothing">Clothing</option>
                                <option value="Toys">Toys</option>
                                <option value="Sports">Sports</option>
                            </select>
                        </div>
                    </div>

                    <div className="row mb-3">
                        <label className="col-sm4 col-form-label">Price</label>
                        <div className="col-sm-8">
                            <input name="price" type="number" className="form-control" defaultValue={props.product.price} placeholder="Price" />
                        </div>
                    </div>

                    <div className="row mb-3">
                        <label className="col-sm4 col-form-label">Description</label>
                        <div className="col-sm-8">
                            <textarea className="form-control" name="description" defaultValue={props.product.description}></textarea>
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
