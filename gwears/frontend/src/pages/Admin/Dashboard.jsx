import { useAuth } from "../../utils/AuthContext.jsx"

export default function Dashboard() {

    const { user, products, offers, activeProds, recentProducts } = useAuth();

    const getTimeAgo = (date) => {
        const now = new Date();
        const createdDate = new Date(date);

        const difference = now - createdDate;

        const days = Math.floor(
            difference / (1000 * 60 * 60 * 24)
        );

        if (days === 0) return "Today";
        if (days === 1) return "1 day ago";

        return `${days} days ago`;
    };

    return (
        <>
          <h1>Welcome back, {user?.name.split(" ")[0]}!</h1>
          <h3>Products: {products?.length}</h3>
          <h3>Offers: {offers?.length}</h3>
          <h3>Active Products: {activeProds?.length}</h3>

          <hr />

          <h2>Recent Products</h2>

          <div className="recent-products">
          {recentProducts?.map((product) => (
              <div key={product._id} className="recent-product">
              <div>
                  <h4>{product.name}</h4>
                  <p>{product.description}</p>
              </div>  
              <span className="time-flag">
                  {getTimeAgo(product.createdAt)}
              </span>
              </div>
          ))}
            </div>
        </>
    )
}