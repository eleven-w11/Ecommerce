import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';

const EdIt = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [error, setError] = useState('');

    console.warn("id is this", id);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/data/${id}`,
                    { withCredentials: true }

                );

                setFormData({ name: response.data.name, email: response.data.email });

            } catch (err) {
                setError('Failed to fetch user Data')
            }
        };

        fetchUser();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(
                `http://localhost:5000/api/data/update/${id}`,
                {
                    name: formData.name,
                    email: formData.email
                },
                { withCredentials: true }
            );
            alert('User updated successfully');
            navigate('/admin');
        } catch (err) {
            setError('Failed to update user');
        }
    };

    if (error) return <p style={{ color: 'red' }}>{error}</p>;


    return (
        <div>
            <h1>Edit User</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Name:
                    <input type="text"
                        name='name'
                        value={formData.name}
                        onChange={handleInputChange} />
                </label>
                <label>
                    Email:
                    <input type="email"
                        name='email'
                        value={formData.email}
                        onChange={handleInputChange} />
                </label>
                <button type='submit'>Save</button>
            </form>
        </div>
    );
};

export default EdIt;