import { useLocation } from 'react-router-dom';

const Products = () => {
    const location = useLocation();
    const { state } = location;  

    if (state) {
        const { category1, category2 } = state;
        console.log("Category 1:", category1); 
        console.log("Category 2:", category2); 
    } else {
        console.log("No state passed.");
    }

    return (
        <div>
            <h1>Products</h1>
            <p>Category 1: {state?.category1 || "No category"}</p>
            <p>Category 2: {state?.category2 || "No category"}</p>
        </div>
    );
};

export default Products;