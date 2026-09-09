import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Navbar.css";

import API from "../ApiEndpoints.js";

import { useUserAuth } from "../utils/UserAuthContext.jsx";
import { useCart } from "../utils/CartContext.jsx";
import { useWishlist } from "../utils/WishlistContext.jsx";

export default function Navbar() {

    const navigate = useNavigate();

    const { user, loading } = useUserAuth();
    const { cartCount } = useCart();
    const { wishlistCount } = useWishlist();

    const [categories, setCategories] = useState([]);
    const [activeMenu, setActiveMenu] = useState(null);


    useEffect(() => {

        const fetchCategories = async () => {

            try {

                const response = await fetch(
                    API.categories
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Failed to fetch categories"
                    );
                }

                setCategories(
                    (data.categories || []).filter(
                        (category) =>
                            category.isActive
                    )
                );

            } catch (error) {

                console.error(
                    "Navbar categories error:",
                    error
                );

            }

        };

        fetchCategories();

    }, []);


    const getCategoriesByGroup = (group) => {

        return categories.filter(
            (category) =>
                category.group === group
        );

    };


    const handleUserClick = () => {

        if (loading) return;

        if (user) {
            navigate("/account");
        } else {
            navigate("/login");
        }

    };


    const handleWishlistClick = () => {

        if (loading) return;

        if (user) {
            navigate("/wishlist");
        } else {
            navigate("/login");
        }

    };


    const handleCategoryClick = (categoryId) => {

        setActiveMenu(null);

        navigate(
            `/products?category=${categoryId}`
        );

    };


    const handleGroupClick = (group) => {

        setActiveMenu(null);

        navigate(
            `/products?group=${group}`
        );

    };


    const handleNewInClick = () => {

        setActiveMenu(null);

        navigate("/products");

    };


    const handleOffersClick = () => {

        setActiveMenu(null);

        navigate("/offers");

    };


    const renderCategoryMenu = (
        group,
        title
    ) => {

        const groupCategories =
            getCategoriesByGroup(group);

        return (
            <div
                className="navMenu"
                onMouseEnter={() =>
                    setActiveMenu(group)
                }
                onMouseLeave={() =>
                    setActiveMenu(null)
                }
            >

                <button
                    className="navLink"
                    onClick={() =>
                        handleGroupClick(group)
                    }
                >
                    {title}
                </button>


                {activeMenu === group && (

                    <div className="megaMenu">

                        <div className="megaMenuContent">

                            <div className="megaMenuColumn">

                                <h4>
                                    SHOP {title}
                                </h4>

                                <button
                                    className="shopAllButton"
                                    onClick={() =>
                                        handleGroupClick(
                                            group
                                        )
                                    }
                                >
                                    Shop All
                                </button>

                                {groupCategories.map(
                                    (category) => (

                                        <button
                                            key={
                                                category._id
                                            }
                                            onClick={() =>
                                                handleCategoryClick(
                                                    category._id
                                                )
                                            }
                                        >
                                            {
                                                category.name
                                            }
                                        </button>

                                    )
                                )}

                            </div>

                        </div>

                    </div>

                )}

            </div>
        );

    };


    return (

        <header className="nav">

            {/* BRAND */}

            <div
                className="brand"
                onClick={() =>
                    navigate("/")
                }
            >
                <h2>GWears</h2>
            </div>


            {/* MAIN NAVIGATION */}

            <nav className="mainNavigation">

                {/* NEW IN */}

                <button
                    className="navLink"
                    onClick={handleNewInClick}
                >
                    NEW IN
                </button>


                {/* CLOTHING */}

                {renderCategoryMenu(
                    "clothing",
                    "CLOTHING"
                )}


                {/* FOOTWEAR */}

                {renderCategoryMenu(
                    "footwear",
                    "FOOTWEAR"
                )}


                {/* ACCESSORIES */}

                {renderCategoryMenu(
                    "accessories",
                    "ACCESSORIES"
                )}


                {/* OFFERS */}

                <button
                    className="navLink"
                    onClick={handleOffersClick}
                >
                    OFFERS
                </button>

            </nav>


            {/* RIGHT ACTIONS */}

            <div className="navOptions">

                {/* SEARCH */}

                <button
                    className="navIconButton"
                    title="Search"
                    onClick={() =>
                        navigate("/products")
                    }
                >
                    <i className="fa-solid fa-magnifying-glass"></i>
                </button>


                {/* WISHLIST */}

                <button
                    className="navIconButton navBadgeWrapper"
                    title={
                        user
                            ? "Wishlist"
                            : "Login to view wishlist"
                    }
                    onClick={
                        handleWishlistClick
                    }
                >

                    <i className="fa-regular fa-heart"></i>

                    {user &&
                        wishlistCount > 0 && (
                            <span className="navCount">
                                {wishlistCount}
                            </span>
                        )}

                </button>


                {/* ACCOUNT */}

                <button
                    className="navIconButton"
                    title={
                        user
                            ? "My Account"
                            : "Login"
                    }
                    onClick={handleUserClick}
                >
                    <i className="fa-regular fa-user"></i>
                </button>


                {/* CART */}

                <button
                    className="navIconButton navBadgeWrapper"
                    title="Cart"
                    onClick={() =>
                        navigate("/cart")
                    }
                >

                    <i className="fa-solid fa-bag-shopping"></i>

                    {cartCount > 0 && (

                        <span className="navCount">
                            {cartCount}
                        </span>

                    )}

                </button>

            </div>

        </header>
    );
}