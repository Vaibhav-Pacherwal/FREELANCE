import { useState } from "react";
import { useNavigate } from "react-router-dom";

import server from "../../Environment.js";

export default function AddCategory() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        group: "",
    });

    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        const {
            name,
            value,
        } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert(
                "Category name is required"
            );

            return;
        }

        if (!formData.group) {
            alert(
                "Category group is required"
            );

            return;
        }


        try {
            setSaving(true);


            const response = await fetch(
                `${server}/categories`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        name:
                            formData.name,

                        description:
                            formData.description,

                        group:
                            formData.group,
                    }),
                }
            );


            const data =
                await response.json();


            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to create category"
                );
            }


            navigate(
                "/admin/categories"
            );

        } catch (error) {
            console.error(
                "Create category error:",
                error
            );

            alert(error.message);

        } finally {
            setSaving(false);
        }
    };


    return (
        <div className="category-form-page">

            <div className="category-form-header">

                <h1>
                    Add Category
                </h1>


                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/admin/categories"
                        )
                    }
                >
                    Cancel
                </button>

            </div>


            <form
                className="category-form"
                onSubmit={handleSubmit}
            >

                <div className="form-group">

                    <label htmlFor="name">
                        Category Name
                    </label>


                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={
                            formData.name
                        }
                        onChange={
                            handleChange
                        }
                        maxLength={100}
                        required
                    />

                </div>

                <div className="form-group">

                    <label htmlFor="group">
                        Category Group
                    </label>


                    <select
                        id="group"
                        name="group"
                        value={
                            formData.group
                        }
                        onChange={
                            handleChange
                        }
                        required
                    >

                        <option value="">
                            Select category group
                        </option>


                        <option value="clothing">
                            Clothing
                        </option>


                        <option value="footwear">
                            Footwear
                        </option>


                        <option value="accessories">
                            Accessories
                        </option>

                    </select>

                </div>

                <div className="form-group">

                    <label htmlFor="description">
                        Description
                    </label>


                    <textarea
                        id="description"
                        name="description"
                        value={
                            formData.description
                        }
                        onChange={
                            handleChange
                        }
                        maxLength={500}
                        rows={5}
                    />

                </div>

                <button
                    type="submit"
                    disabled={saving}
                >
                    {saving
                        ? "Creating..."
                        : "Create Category"}
                </button>

            </form>

        </div>
    );
}