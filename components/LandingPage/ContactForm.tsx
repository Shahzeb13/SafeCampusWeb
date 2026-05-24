"use client";

import React, { useState } from "react";
import { postContactData } from "./PostContactData";

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        institution: "",
        email: "",
        message: ""
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        const success = await postContactData(formData);
        
        if (success) {
            setFormData({ name: "", institution: "", email: "", message: "" });
        }
        setLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
                <input 
                    type="text" 
                    name="name"
                    placeholder="Name" 
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                <input 
                    type="text" 
                    name="institution"
                    placeholder="Institution" 
                    value={formData.institution}
                    onChange={handleChange}
                    required
                />
            </div>
            <input 
                type="email" 
                name="email"
                placeholder="Email" 
                value={formData.email}
                onChange={handleChange}
                required
            />
            <textarea 
                name="message"
                placeholder="Tell us about your campus..." 
                rows={4}
                value={formData.message}
                onChange={handleChange}
                required
            ></textarea>
            <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '18px', fontSize: '18px' }}
                disabled={loading}
            >
                {loading ? "Submitting..." : "Submit Request"}
            </button>
        </form>
    );
};

export default ContactForm;
