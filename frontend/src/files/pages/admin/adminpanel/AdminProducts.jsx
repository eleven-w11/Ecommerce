import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../../styles/admin/adminpanel/AdminProducts.css';

const AdminProducts = () => {
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formData, setFormData] = useState({
        product_name: '',
        product_price: '',
        dis_product_price: '',
        p_type: 'top',
        p_des: '',
        id: '',
        images: [{ pi_1: '', color_code: '#000000', color: 'black' }]
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navItems = [
        { path: '/AdminPanel', label: 'Dashboard' },
        { path: '/AdminProducts', label: 'Products' },
        { path: '/AdminOrders', label: 'Orders' },
        { path: '/AdminUsers', label: 'Users' },
        { path: '/AdminVisitors', label: 'Analytics' },
        { path: '/UserList', label: 'Messages' }
    ];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/api/products`,
                { withCredentials: true }
            );
            setProducts(response.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (index, field, value) => {
        const newImages = [...formData.images];
        newImages[index] = { ...newImages[index], [field]: value };
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const addImageSlot = () => {
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, { pi_1: '', color_code: '#000000', color: 'black' }]
        }));
    };

    const removeImageSlot = (index) => {
        if (formData.images.length > 1) {
            setFormData(prev => ({
                ...prev,
                images: prev.images.filter((_, i) => i !== index)
            }));
        }
    };

    const openAddModal = () => {
        setModalMode('add');
        setSelectedProduct(null);
        setFormData({
            product_name: '',
            product_price: '',
            dis_product_price: '',
            p_type: 'top',
            p_des: '',
            id: `P-${Date.now()}`,
            images: [{ pi_1: '', color_code: '#000000', color: 'black' }]
        });
        setShowModal(true);
        setError('');
        setSuccess('');
    };

    const openEditModal = (product) => {
        setModalMode('edit');
        setSelectedProduct(product);
        setFormData({
            product_name: product.product_name || '',
            product_price: product.product_price || '',
            dis_product_price: product.dis_product_price || '',
            p_type: product.p_type || 'top',
            p_des: product.p_des || '',
            id: product.id || '',
            images: product.images?.length > 0 
                ? product.images 
                : [{ pi_1: '', color_code: '#000000', color: 'black' }]
        });
        setShowModal(true);
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.product_name || !formData.product_price) {
            setError('Product name and price are required');
            return;
        }

        try {
            const productData = {
                ...formData,
                product_price: parseFloat(formData.product_price),
                dis_product_price: formData.dis_product_price ? parseFloat(formData.dis_product_price) : undefined
            };

            if (modalMode === 'add') {
                await axios.post(
                    `${process.env.REACT_APP_API_BASE_URL}/api/admin/products`,
                    productData,
                    { withCredentials: true }
                );
                setSuccess('Product added successfully!');
            } else {
                await axios.put(
                    `${process.env.REACT_APP_API_BASE_URL}/api/admin/products/${selectedProduct._id}`,
                    productData,
                    { withCredentials: true }
                );
                setSuccess('Product updated successfully!');
            }

            setTimeout(() => {
                setShowModal(false);
                fetchProducts();
            }, 1000);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to save product');
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            await axios.delete(
                `${process.env.REACT_APP_API_BASE_URL}/api/admin/products/${productId}`,
                { withCredentials: true }
            );
            fetchProducts();
        } catch (error) {
            setError('Failed to delete product');
        }
    };

    const filteredProducts = products.filter(product =>
        product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getProductImage = (product) => {
        const firstImage = product.images?.[0]?.pi_1;
        if (firstImage) {
            if (firstImage.startsWith('http')) return firstImage;
            return `${process.env.PUBLIC_URL}/images/${firstImage}`;
        }
        return `${process.env.PUBLIC_URL}/images/default.jpg`;
    };

    return (
        <div className="admin-container">
            {/* Admin Navbar */}
            <nav className="admin-navbar">
                <div className="admin-nav-left">
                    <Link to="/AdminPanel" className="admin-logo">
                        <span className="logo-icon">W</span>
                        <span className="logo-text">Admin Panel</span>
                    </Link>
                </div>
                <div className="admin-nav-center">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`admin-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
                <div className="admin-nav-right">
                    <Link to="/" className="back-to-store">Back to Store</Link>
                </div>
            </nav>

            {/* Main Content */}
            <main className="admin-content">
                <div className="page-header-row">
                    <div className="admin-page-header">
                        <h1>Products</h1>
                        <p>{products.length} products in your catalog</p>
                    </div>
                    <button className="btn-add" onClick={openAddModal}>+ Add Product</button>
                </div>

                {/* Search */}
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {error && <div className="alert error">{error}</div>}
                {success && <div className="alert success">{success}</div>}

                {/* Products Grid */}
                {loading ? (
                    <div className="admin-loading"><div className="spinner"></div></div>
                ) : filteredProducts.length === 0 ? (
                    <div className="empty-state">
                        <p>No products found</p>
                        <button className="btn-add" onClick={openAddModal}>Add your first product</button>
                    </div>
                ) : (
                    <div className="products-grid">
                        {filteredProducts.map((product) => (
                            <div key={product._id} className="product-card">
                                <div className="product-image">
                                    <img 
                                        src={getProductImage(product)} 
                                        alt={product.product_name}
                                        onError={(e) => { e.target.src = `${process.env.PUBLIC_URL}/images/default.jpg`; }}
                                    />
                                    <span className="product-badge">{product.p_type}</span>
                                </div>
                                <div className="product-info">
                                    <h3>{product.product_name}</h3>
                                    <p className="product-id">ID: {product.id || product._id}</p>
                                    <div className="product-price">
                                        {product.dis_product_price ? (
                                            <>
                                                <span className="old-price">${product.product_price}</span>
                                                <span className="new-price">${product.dis_product_price}</span>
                                            </>
                                        ) : (
                                            <span className="new-price">${product.product_price}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="product-actions">
                                    <button className="btn-edit" onClick={() => openEditModal(product)}>Edit</button>
                                    <button className="btn-delete" onClick={() => handleDelete(product._id)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{modalMode === 'add' ? 'Add Product' : 'Edit Product'}</h2>
                                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    {error && <div className="alert error">{error}</div>}
                                    {success && <div className="alert success">{success}</div>}

                                    <div className="form-group">
                                        <label>Product Name *</label>
                                        <input type="text" name="product_name" value={formData.product_name} onChange={handleInputChange} required />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Price ($) *</label>
                                            <input type="number" name="product_price" value={formData.product_price} onChange={handleInputChange} step="0.01" min="0" required />
                                        </div>
                                        <div className="form-group">
                                            <label>Discount Price ($)</label>
                                            <input type="number" name="dis_product_price" value={formData.dis_product_price} onChange={handleInputChange} step="0.01" min="0" />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Category</label>
                                            <select name="p_type" value={formData.p_type} onChange={handleInputChange}>
                                                <option value="top">Top</option>
                                                <option value="bottom">Bottom</option>
                                                <option value="shoes">Shoes</option>
                                                <option value="accessories">Accessories</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Product ID</label>
                                            <input type="text" name="id" value={formData.id} onChange={handleInputChange} />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea name="p_des" value={formData.p_des} onChange={handleInputChange} rows="3" />
                                    </div>

                                    <div className="form-group">
                                        <label>Images</label>
                                        {formData.images.map((img, index) => (
                                            <div key={index} className="image-row">
                                                <input type="text" value={img.pi_1} onChange={(e) => handleImageChange(index, 'pi_1', e.target.value)} placeholder="Image filename" />
                                                <input type="color" value={img.color_code} onChange={(e) => handleImageChange(index, 'color_code', e.target.value)} />
                                                <input type="text" value={img.color} onChange={(e) => handleImageChange(index, 'color', e.target.value)} placeholder="Color" />
                                                {formData.images.length > 1 && (
                                                    <button type="button" className="btn-remove-img" onClick={() => removeImageSlot(index)}>×</button>
                                                )}
                                            </div>
                                        ))}
                                        <button type="button" className="btn-add-img" onClick={addImageSlot}>+ Add Image</button>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-save">{modalMode === 'add' ? 'Add Product' : 'Save Changes'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminProducts;
