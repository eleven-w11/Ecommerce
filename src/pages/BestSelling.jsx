import { useEffect, useState } from "react";
import axios from "axios";
import "./styles/BestSelling.css";
import { Link } from "react-router-dom";
import addTocart from "./images/add-to-cart.png";

const BestSellingProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading delay (you can replace this with actual API loading)
    const timer = setTimeout(() => setLoading(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const addToCart = (product) => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const timeStamp = Date.now(); // ✅ millisecond-based timestamp
    const uniqueId = `${product._id}-${timeStamp}`; // ✅ create composite id + time

    const index = storedCart.findIndex(item => item.id === product._id);
    if (index !== -1) {
      storedCart[index].quantity = (storedCart[index].quantity || 1) + 1;
      storedCart[index].addedAt = new Date().toISOString();

      localStorage.setItem("cart", JSON.stringify(storedCart));
      window.dispatchEvent(new Event("storage"));
      // alert("Quantity increased!");
      return;
    }

    const newCartItem = {
      uniqueId: uniqueId, // ✅ store combined id
      id: product._id,     // original MongoDB ID
      quantity: 1,
      addedAt: new Date().toISOString()
    };

    const updatedCart = [...storedCart, newCartItem];
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("storage"));
    // alert("Product added to cart!");
  };

  useEffect(() => {

    console.log("🌐 API best selling Base URL:", process.env.REACT_APP_API_BASE_URL);

    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/products`) // ✅ Backend se sab products fetch karo
      .then(response => {
        console.log("📢 All Products Fetched:", response.data);

        // ✅ MongoDB se ana wala `id` extract karke usko number format me convert karo
        const filteredProducts = response.data
          .filter(product => product.id && product.id.startsWith("bsp-"))
          .map(product => ({
            ...product,
            numericId: parseInt(product.id.replace("bsp-", ""), 10) // `ap-1` ➝ `1`
          }))
          .sort((a, b) => a.numericId - b.numericId); // ✅ Ascending order me sort karo

        setProducts(filteredProducts);
      })
      .catch(error => console.error("❌ Error fetching products:", error));
  }, []);

  return (
    <div className="best-selling-section">
      <div className="product-container">
        <h2>Best Selling</h2>
        <div className={products.length > 0 ? "products-grid" : "products-flex"}>

          {products.length > 0 ? (
            products.map(product => {
              const hasDiscount = product.dis_product_price !== undefined;
              const firstImage = product.images?.[0]?.pi_1 || "default.jpg";

              return (
                <div key={product._id} className="product-card">
                  <div className="product-image-wrapper">
                    <img src={`/images/${firstImage}`}
                      className="bsp-img"
                      {...(product.width ? { style: { width: product.width } } : {})}
                      alt={product.product_name} />
                    <img
                      src={addTocart}
                      className="add-to-cart-icon"
                      alt="Add to Cart"
                      onClick={() => addToCart(product)}
                    />
                  </div>
                  <div className="product-details">
                    <h3>{product.product_name}</h3>
                    {hasDiscount ? (
                      <p className="product-price dual-price">
                        <span className="original-price">${product.product_price}</span>
                        <span className="discount-price">${product.dis_product_price}</span>
                      </p>
                    ) : (
                      <p className="product-price">${product.product_price}</p>
                    )}
                    {/* <p>{product.id}</p> */}
                    <Link to={`/product/${product._id}`}>
                      Shop Now
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="fp-loader-container">
              <div className="loader">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BestSellingProducts;