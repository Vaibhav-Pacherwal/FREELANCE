import {
    createContext,
    useContext,
    useState,
} from "react";

import "./Snackbar.css"

const SnackbarContext = createContext(null);

export function SnackbarProvider({ children }) {

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        type: "success",
    });


    const showSnackbar = (
        message,
        type = "success"
    ) => {

        setSnackbar({
            open: true,
            message,
            type,
        });

    };


    const hideSnackbar = () => {

        setSnackbar((prev) => ({
            ...prev,
            open: false,
        }));

    };


    return (
        <SnackbarContext.Provider
            value={{
                snackbar,
                showSnackbar,
                hideSnackbar,
            }}
        >
            {children}

            {snackbar.open && (

                <div
                    className={`snackbar snackbar-${snackbar.type}`}
                    role="alert"
                >

                    <span>
                        {snackbar.message}
                    </span>

                    <button
                        type="button"
                        onClick={hideSnackbar}
                        aria-label="Close notification"
                    >
                        ×
                    </button>

                </div>

            )}

        </SnackbarContext.Provider>
    );
}


export function useSnackbar() {

    const context =
        useContext(SnackbarContext);

    if (!context) {
        throw new Error(
            "useSnackbar must be used inside SnackbarProvider"
        );
    }

    return context;
}