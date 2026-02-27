import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../../../styles/admin/adminpanel/AdminProducts.css';

const AdminProducts = () => {
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

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            // Using the same API endpoint as BestSelling and TopProducts
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/api/products`,
                { withCredentials: true }
            );
            console.log('Products fetched:', response.data);
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
            }, 1500);
        } catch (error) {
            console.error('Error saving product:', error);
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
            setSuccess('Product deleted successfully!');
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            setError('Failed to delete product');
        }
    };

    const filteredProducts = products.filter(product =>
        product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.p_type?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="admin-products" data-testid="admin-products">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">W</div>
                        <div className="sidebar-logo-text">Web<span>Verse</span></div>
                    </div>
                </div>
                
                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <div className="nav-section-title">Main Menu</div>
                        <Link to="/AdminPanel" className="nav-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                            <span>Dashboard</span>
                        </Link>
                        <Link to="/AdminProducts" className="nav-item active">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                            <span>Products</span>
                        </Link>
                        <Link to="/AdminOrders" className="nav-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <span>Orders</span>
                        </Link>
                        <Link to="/AdminUsers" className="nav-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                            </svg>
                            <span>Users</span>
                        </Link>
                        <Link to="/AdminVisitors" className="nav-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                <polyline points="17 6 23 6 23 12"></polyline>
                            </svg>
                            <span>Analytics</span>
                        </Link>
                        <Link to="/UserList" className="nav-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <span>Messages</span>
                        </Link>
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <Link to="/" className="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        <span>Back to Store</span>
                    </Link>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-left">
                        <h1>Products Management</h1>
                        <p className="header-subtitle">{products.length} products in your catalog</p>
                    </div>
                    <div className="header-right">
                        <button className="btn-primary" onClick={openAddModal} data-testid="add-product-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Add Product
                        </button>
                    </div>
                </header>

                {/* Search */}
                <div className="search-section">
                    <div className="search-box">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search products by name, ID, or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            data-testid="search-products-input"
                        />
                    </div>
                </div>

                {/* Messages */}
                {error && <div className="message error">{error}</div>}
                {success && <div className="message success">{success}</div>}

                {/* Products Grid */}
                {loading ? (
                    <div className="admin-loading">
                        <div className="loader"><span></span><span></span><span></span></div>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="empty-state">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        <h3>No products found</h3>
                        <p>{searchTerm ? 'Try a different search term' : 'Add your first product to get started'}</p>
                        {!searchTerm && (
                            <button className="btn-primary" onClick={openAddModal}>Add Product</button>
                        )}
                    </div>
                ) : (
                    <div className="products-grid">
                        {filteredProducts.map((product) => (
                            <div key={product._id} className="product-card" data-testid={`product-card-${product._id}`}>
                                <div className="product-image">
                                    <img 
                                        src={getProductImage(product)} 
                                        alt={product.product_name}
                                        onError={(e) => { e.target.src = `${process.env.PUBLIC_URL}/images/default.jpg`; }}
                                    />
                                    <span className="product-type">{product.p_type || 'general'}</span>
                                </div>
                                <div className="product-info">
                                    <h3>{product.product_name}</h3>
                                    <p className="product-id">ID: {product.id || product._id}</p>
                                    <div className="product-prices">
                                        {product.dis_product_price ? (
                                            <>
                                                <span className="original-price">${product.product_price}</span>
                                                <span className="discount-price">${product.dis_product_price}</span>
                                            </>
                                        ) : (
                                            <span className="price">${product.product_price}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="product-actions">
                                    <button 
                                        className="btn-edit" 
                                        onClick={() => openEditModal(product)}
                                        data-testid={`edit-product-${product._id}`}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                        </svg>
                                        Edit
                                    </button>
                                    <button 
                                        className="btn-delete" 
                                        onClick={() => handleDelete(product._id)}
                                        data-testid={`delete-product-${product._id}`}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                        Delete
                                    </button>
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
                                <h2>{modalMode === 'add' ? 'Add New Product' : 'Edit Product'}</h2>
                                <button className="modal-close" onClick={() => setShowModal(false)}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    {error && <div className="message error">{error}</div>}
                                    {success && <div className="message success">{success}</div>}

                                    <div className="form-group">
                                        <label>Product Name *</label>
                                        <input
                                            type="text"
                                            name="product_name"
                                            value={formData.product_name}
                                            onChange={handleInputChange}
                                            placeholder="Enter product name"
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Price ($) *</label>
                                            <input
                                                type="number"
                                                name="product_price"
                                                value={formData.product_price}
                                                onChange={handleInputChange}
                                                placeholder="0.00"
                                                step="0.01"
                                                min="0"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Discount Price ($)</label>
                                            <input
                                                type="number"
                                                name="dis_product_price"
                                                value={formData.dis_product_price}
                                                onChange={handleInputChange}
                                                placeholder="0.00"
                                                step="0.01"
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Category</label>
                                            <select
                                                name="p_type"
                                                value={formData.p_type}
                                                onChange={handleInputChange}
                                            >
                                                <option value="top">Top</option>
                                                <option value="bottom">Bottom</option>
                                                <option value="shoes">Shoes</option>
                                                <option value="accessories">Accessories</option>
                                                <option value="electronics">Electronics</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Product ID</label>
                                            <input
                                                type="text"
                                                name="id"
                                                value={formData.id}
                                                onChange={handleInputChange}
                                                placeholder="e.g., bsp-1 or tp-1"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            name="p_des"
                                            value={formData.p_des}
                                            onChange={handleInputChange}
                                            placeholder="Enter product description"
                                            rows="3"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Images</label>
                                        {formData.images.map((img, index) => (
                                            <div key={index} className="image-input-row">
                                                <input
                                                    type="text"
                                                    value={img.pi_1}
                                                    onChange={(e) => handleImageChange(index, 'pi_1', e.target.value)}
                                                    placeholder="Image filename (e.g., product.jpg)"
                                                />
                                                <input
                                                    type="color"
                                                    value={img.color_code}
                                                    onChange={(e) => handleImageChange(index, 'color_code', e.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    value={img.color}
                                                    onChange={(e) => handleImageChange(index, 'color', e.target.value)}
                                                    placeholder="Color name"
                                                />
                                                {formData.images.length > 1 && (
                                                    <button type="button" className="btn-remove" onClick={() => removeImageSlot(index)}>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button type="button" className="btn-add-image" onClick={addImageSlot}>
                                            + Add Another Image
                                        </button>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">
                                        {modalMode === 'add' ? 'Add Product' : 'Save Changes'}
                                    </button>
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
