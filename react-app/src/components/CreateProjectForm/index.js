import React, { useState, useEffect, Component } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import * as projectActions from '../../store/projects';
import "./CreateProject.css"

function CreateProject() {
    const history = useHistory()
    const dispatch = useDispatch()
    const sessionUser = useSelector((state) => state.session.user);
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [images, setImages] = useState("")
    const [url, setUrl] = useState([])
    const [is_preview, setIsPreview] = useState(true)
    const [errors, setErrors] = useState([])
    const [proj, setProj] = useState({});
    const [submitted, setSubmitted] = useState(false)
    const formData = new FormData();


    if (!sessionUser) {
        return null
    }
    if (!proj) {
        return null
    }
    let correctFile = true
    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrors([])
        setImages("")
        const errorList = []
        if (name.length > 50 || name.length < 10) errorList.push("Name but be between 10 and 50 characters")
        if (description.length > 100 || description.length < 20) errorList.push("Description must be between 20 and 50 characters")
        let imageInput = document.querySelector("#imageinput")
        setErrors(errorList)
        if (errorList.length) {
            return
        } else {
            if (!imageInput.files.length || imageInput.files.length > 5) {
                errorList.push("Please select 1 to 5 images to upload")
                return setErrors(errorList)
            }
        }
        for (let i = 0; i < imageInput.files.length; i++) {
            let img = imageInput.files[i]
            if (img.type !== "image/gif" && img.type !== "image/jpeg" && img.type !== "image/png") {
                correctFile = false
            }
            formData.append('file', img)
        }
        if (correctFile === false) errorList.push("You may only upload .GIF, .JPEG/.JPG, and .PNG files!")
        if (errorList.length) return
        const pictures = await fetch('/api/projects/upload', {
            method: "POST",
            body: formData
        }).then((res) => res.json())
        const new_project = {
            name,
            description,
            user_id: sessionUser.id,
            images: pictures.images
        }
        // console.log(new_project)
        dispatch(projectActions.createProject(new_project)).then((data) => {
            history.push("/")
            history.push(`/gallery/${data.id}`)
        })
    }
    return (
        <div className="create-project-container">
            <form className="create-project-form" onSubmit={handleSubmit}>
                <h1>Start building your project:</h1>
                <label>Project Name</label>
                <input
                    type='text'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="create-project-fields" />
                <div>
                    {errors.map((error, idx) =>
                        error === "Name but be between 10 and 50 characters" ? <li key={idx} id='error-list'>{error}</li> : null
                    )}
                </div>
                <label>Provide a brief description of your project</label>
                <input
                    type='text'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="create-project-fields" />
                <div>
                    {errors.map((error, idx) =>
                        error === "Description must be between 20 and 50 characters" ? <li key={idx} id='error-list'>{error}</li> : null
                    )}
                </div>
                <div className="create-project-image-container">
                    <div className="create-project-image-prompt">
                        Attach image files
                    </div>
                    {errors.map((error, idx) =>
                        error === "Please select 1 to 5 images to upload" ? <li key={idx} id='image-error-list'>{error}</li> : null
                    )}
                    {errors.map((error, idx) =>
                        error === "You may only upload .GIF, .JPEG/.JPG, and .PNG files!" ? <li key={idx} id='image-error-list'>{error}</li> : null
                    )}
                    <div className="create-project-image-input">
                        <div>
                            <input type="file" name="file" id='imageinput' multiple encType="multipart/form-data" />
                        </div>
                    </div>
                    <div className='pro-tip-div'>
                        Pro-tip: Use ctrl + click (command + click for mac) to upload multiple pictures!
                    </div>
                    <span className='pro-tip-div'>Only PNGs, JPEGs/JPGs, and GIFs allowed</span>
                </div>
                <button type="submit" className="submit-button">Submit</button>
            </form>
        </div>
    )

}

export default CreateProject
