import React, { useState } from "react";

export default function AdForm({ formType, fields, onSubmit }) {
    const [formData, setFormData] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded shadow">
        <h2 className="text-xl font-semibold capitalize">{formType} Creation</h2>
        {fields.map((field) => (
            <div key={field.name}>
            <label className="block mb-1 font-medium">{field.label}</label>
            <input
                type={field.type || "text"}
                name={field.name}
                placeholder={field.placeholder}
                value={formData[field.name] || ""}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required={field.required}
            />
            </div>
        ))}
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
            Submit
        </button>
        </form>
    );
}
