import { useAuth } from "../../utils/AuthContext.jsx"

export default function Dashboard() {
    
    const { user } = useAuth();

    return (
        <>
          <h1>Welcome back, {user?.name.split(" ")[0]}!</h1>
        </>
    )
}