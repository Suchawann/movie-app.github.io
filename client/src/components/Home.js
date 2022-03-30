
import { useState, useRef, useEffect } from "react";
import { Navbar, Nav, Container, Row, Col, Button, Form, Modal } from "react-bootstrap";
import { MDBCard, MDBCardBody, MDBCardTitle, MDBCardText, MDBCardImage, MDBBtn, MDBRipple } from 'mdb-react-ui-kit';

import { FaPlus, FaTrashAlt, FaPencilAlt } from 'react-icons/fa';
import axios from 'axios'
import { useMediaQuery } from 'react-responsive'
import { storage } from "../firebase";

export default function Home() {
    const API_URL = "http://localhost:3000";

    const [show, setShow] = useState(false);
    const [model, setModel] = useState(false);
    const [movie, setMovie] = useState([])
    const [rows, setRows] = useState([])
    const [fileName,setFileName] = useState(null)
    const [movieList, setMovieList] = useState({
        image:"",
        title: "",
        synopsis: "",
        actor: "",
        min: ""
    })
    const [Url, setUrl] = useState("");
    const [progress, setProgress] = useState(0);
    //Input references
    const refTitle = useRef(null);
    const refSysnopsis= useRef(null);
    const refMin = useRef(null);
    const refImage = useRef(null);
    const refActor = useRef(null);

    const handlePhoto = (e) => {
        if (e.target.files[0]) {
            setFileName(e.target.files[0]);
          }
    }

    useEffect(() => {
        const fetchMovies = async () => {
            const res = await axios.get(`${API_URL}/movie`)
            console.log(res)
            setMovie(res.data)
        }
        fetchMovies()
    }, [])

    const handleShowAdd = () => {
        setModel(true);
        setShow(true);
    };
    const handleUpdate = (movie) => {
        console.log("Update Movie", movie);
        console.log(movie._id);
        movie.current = movie._id;
        setShow(true);
        setMovieList(movie);  
    }

    const handleClose = () => {
        setModel(false);
        setShow(false);
    };

    const handleShow = () => setShow(true);

    const handleDelete = (movie) => {
        console.log(movie);
        if (window.confirm(`Are you sure to delete ${movie.title}?`)) {
            fetch(`${API_URL}/movie/${movie._id}`, {
                method: "DELETE",
                mode: "cors",
            })
                .then((res) => res.json())
                .then((json) => {
                    handleClose();
                    window.location.reload(false);  
                });
        }
    };
    const handleUpload = () => {
        const uploadTask = storage.ref(`images/${fileName.name}`).put(fileName);
        uploadTask.on(
          "state_changed",
          snapshot => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setProgress(progress);
          },
          error => {
            console.log(error);
          },
          () => {
            storage
              .ref("images")
              .child(fileName.name)
              .getDownloadURL()
              .then(url => {
                setUrl(url);
                // var src = URL.createObjectURL(url);
                if (model) {
                    //Add new news
                    const newMovie = {
                        image: Url,
                        title: refTitle.current.value,
                        synopsis: refSysnopsis.current.value,
                        actor: refActor.current.value,
                        min: refMin.current.value
                    }
                    console.log(newMovie);
        
                    fetch(`${API_URL}/movie`, {
                        method: "POST", // *GET, POST, PUT, DELETE, etc.
                        mode: "cors", // no-cors, *cors, same-origin
                        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
                        // credentials: "same-origin", // include, *same-origin, omit
                        headers: {
                            "Content-Type": "application/json",
                            // "Content-Type":"multipart/form-data"
                            // 'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        redirect: "follow", // manual, *follow, error
                        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                        body: JSON.stringify(newMovie), // body data type must match "Content-Type" header
        
                    })
                        .then((res) => res.json())
                        .then((json) => {
                            // Successfully added the product
                            console.log("POST Result", json);
                            movie.push(json);
                            setMovie(movie)
                            handleClose();
                        });
                } else {
                    // Update product
                    const updatedMovie = {
                        _id: movieList._id,
                        image: url,
                        title: refTitle.current.value,
                        synopsis: refSysnopsis.current.value,
                        actor: refActor.current.value,
                        min: refMin.current.value
                    };
                    console.log(updatedMovie);
        
                    fetch(`${API_URL}/movie`, {
                        method: "PUT", // *GET, POST, PUT, DELETE, etc.
                        mode: "cors", // no-cors, *cors, same-origin
                        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
                        // credentials: "same-origin", // include, *same-origin, omit
                        headers: {
                            "Content-Type": "application/json",
                            // 'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        redirect: "follow", // manual, *follow, error
                        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                        body: JSON.stringify(updatedMovie), // body data type must match "Content-Type" header
                    })
                        .then((res) => res.json())
                        .then((json) => {
                            // Successfully updated the product
                            console.log("PUT Result", json);
                            for (let i = 0; i < movie.length; i++) {
                                if (movie[i]._id === updatedMovie._id) {
                                    console.log(movie[i], updatedMovie);
                                    movie[i] = updatedMovie;
                                    break;
                                }
                            }
                    
                            setMovie(movie)
                            handleClose();
                        });
                }
                console.log(url)
              });
          }
        );
      };



    return (
        <>
            
                    <div className="add-button" >
                    <Button variant="outline-secondary" onClick={handleShowAdd}>Create Movies</Button>
                        {/* <FaPlus onClick={handleShowAdd} /> */}
                    </div>

                    <Modal
                        show={show}
                        onHide={handleClose}
                        backdrop="static"
                        keyboard={false}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>
                            {model ? "Add New News" : "Update News"}
                            </Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            <Form encType="multipart?form-data ">
                                <Row>
                                    <Col>Title</Col>
                                    <Col>
                                        <input type="text" ref={refTitle} defaultValue={movieList.title} />
                                    </Col>
                                </Row>

                                <Row>
                                    <Col>Image</Col>
                                    <Col >
                                        <input type="file" name="img" onChange={handlePhoto} ref={refImage}  />
                                       {/* <img src={url}></img> */}
                                        {/* <button onClick={handleUpload}>Upload</button> */}
                                    </Col>
                                </Row>

                                <Row>
                                    <Col>Description</Col>
                                    <Col>
                                        <input type="text" ref={refSysnopsis} defaultValue={movieList.synopsis} />
                                       {/* <div className="form-group">
                                        <textarea
                                            className="form-control"
                                            rows="5"
                                        />
                                        </div> */}
                                    </Col>
                                </Row>

                                <Row>
                                    <Col>Lead Actor</Col>
                                    <Col>
                                        <input type="text" ref={refActor} defaultValue={movieList.actor} />
                                    </Col>
                                </Row>

                                <Row>
                                    <Col>Time</Col>
                                    <Col>
                                        <input type="text" ref={refMin} defaultValue={movieList.min} />
                                    </Col>
                                </Row>

                               
                            </Form>
                        </Modal.Body>

                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                Close
                            </Button>
                            <Button variant="primary" onClick={handleUpload}>
                                {model ? "Add" : "Update"}
                            </Button>
                        </Modal.Footer>

                    </Modal>

                <MDBCard style={{ maxWidth: '22rem', borderRadius:"10px" }} >
                    {movie.map((movies) => (

                <><MDBRipple rippleColor='light' rippleTag='div' className='bg-image hover-overlay'>
                            <MDBCardImage src={movies.image} style={{ objectFit: "cover", borderRadius: "10px 10px 0 0", boxShadow: "1px 1px 1px 1px #888888" }} fluid alt='...' />
                            <a>
                                <div className='mask' style={{ backgroundColor: 'rgba(251, 251, 251, 0.15)' }}></div>
                            </a>
                        </MDBRipple><MDBCardBody style={{ boxShadow: "1px 1px 1px 1px #888888", borderRadius: "0 0 10px 10px" }}>
                                <MDBCardTitle>{movies.title}</MDBCardTitle>
                                <MDBCardText>
                                    {movies.synopsis}
                                </MDBCardText>
                                <FaPencilAlt onClick={() => handleUpdate(movies)} />
                                <FaTrashAlt onClick={() => handleDelete(movies)} />
                            </MDBCardBody></>
  
                        ))}
                </MDBCard>
                    
                    

            
            
           
        </>
    )


}


