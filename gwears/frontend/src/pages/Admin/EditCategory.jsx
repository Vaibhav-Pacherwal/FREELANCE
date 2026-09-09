import { useEffect, useState } from "react";
import {
    useNavigate,
    useParams,
} from "react-router-dom";

import server from "../../Environment.js";

export default function EditCategory() {
    const { id } = useParams();

    const navigate = useNavigate();


    const [formData, setFormData] =
        useState({
            name: "",
            description: "",
            group: "",
        });


    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    useEffect(() => {

        const fetchCategory = async () => {

            try {

                const response =
                    await fetch(
                        `${server}/categories/${id}`,
                        {
                            credentials:
                                "include",
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Failed to fetch category"
                    );
                }


                setFormData({
                    name:
                        data.category
                            .name || "",

                    description:
                        data.category
                            .description ||
                        "",

                    group:
                        data.category
                            .group || "",
                });


            } catch (error) {

                console.error(
                    "Get category error:",
                    error
                );

                alert(error.message);

                navigate(
                    "/admin/categories"
                );


            } finally {

                setLoading(false);

            }
        };


        fetchCategory();

    }, [id, navigate]);

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


            const response =
                await fetch(
                    `${server}/categories/${id}`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        credentials:
                            "include",

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
                        "Failed to update category"
                );
            }


            navigate(
                "/admin/categories"
            );


        } catch (error) {

            console.error(
                "Update category error:",
                error
            );

            alert(error.message);


        } finally {

            setSaving(false);

        }
    };

    if (loading) {

        return (
            <div>
                Loading category...
            </div>
        );
    }

    return (
        <div className="category-form-page">

            <div className="category-form-header">

                <h1>
                    Edit Category
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

                {/* CATEGORY NAME */}

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


                {/* CATEGORY GROUP */}

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
                        ? "Saving..."
                        : "Save Changes"}
                </button>

            </form>

        </div>
    );
}