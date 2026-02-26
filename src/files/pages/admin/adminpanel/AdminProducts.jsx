import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../../styles/admin/adminpanel/AdminProducts.css';

const AdminProducts = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [formData, setFormData] = useState({
        product_name: '',
        product_price: '',
        dis_product_price: '',
        p_type: 'general',
        p_des: '',
        images: ['']
    });

    const API_URL = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/admin/products`, {
                withCredentials: true
            });
            if (response.data.success) {
                setProducts(response.data.products);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (index, value) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const addImageField = () => {
        setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
    };

    const removeImageField = (index) => {
        if (formData.images.length > 1) {
            const newImages = formData.images.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, images: newImages }));
        }
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setFormData({
            product_name: '',
            product_price: '',
            dis_product_price: '',
            p_type: 'general',
            p_des: '',
            images: ['']
        });
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            product_name: product.product_name || '',
            product_price: product.product_price || '',
            dis_product_price: product.dis_product_price || '',
            p_type: product.p_type || 'general',
            p_des: product.p_des || '',
            images: product.images?.length > 0 ? product.images : ['']
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                product_price: parseFloat(formData.product_price),
                dis_product_price: parseFloat(formData.dis_product_price) || parseFloat(formData.product_price),
                images: formData.images.filter(img => img.trim() !== '')
            };

            if (editingProduct) {
                const response = await axios.put(
                    `${API_URL}/api/admin/products/${editingProduct._id}`,
                    payload,
                    { withCredentials: true }
                );
                if (response.data.success) {
                    setProducts(products.map(p => 
                        p._id === editingProduct._id ? response.data.product : p
                    ));
                }
            } else {
                const response = await axios.post(
                    `${API_URL}/api/admin/products`,
                    payload,
                    { withCredentials: true }
                );
                if (response.data.success) {
                    setProducts([response.data.product, ...products]);
                }
            }
            setShowModal(false);
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const handleDelete = async (productId) => {
        try {
            const response = await axios.delete(
                `${API_URL}/api/admin/products/${productId}`,
                { withCredentials: true }
            );
            if (response.data.success) {
                setProducts(products.filter(p => p._id !== productId));
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
        setDeleteConfirm(null);
    };

    const filteredProducts = products.filter(product =>
        product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.p_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="admin-products-page">
                <div className="loading-container">
                    <div className="loader"><span></span><span></span><span></span></div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-products-page">
            <header className="products-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate('/AdminPanel')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                    </button>
                    <h1>Products</h1>
                </div>
                <div className="header-right">
                    <span className="stat-badge">{products.length} Products</span>
                    <button className="add-btn" onClick={openAddModal}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Add Product
                    </button>
                </div>
            </header>

            <div className="search-bar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                </svg>
                <input 
                    type="text" 
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="products-content">
                {filteredProducts.length === 0 ? (
                    <div className="no-products">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                            <line x1="3" y1="6" x2="21" y2="6"/>
                            <path d="M16 10a4 4 0 01-8 0"/>
                        </svg>
                        <p>No products found</p>
                        <button onClick={openAddModal}>Add First Product</button>
                    </div>
                ) : (
                    <div className="products-grid">
                        {filteredProducts.map(product => (
                            <div key={product._id} className="product-card">
                                <div className="product-image">
                                    <img 
                                        src={`/images/${product.images?.[0] || 'default.jpg'}`} 
                                        alt={product.product_name}
                                        onError={(e) => e.target.src = '/images/default.jpg'}
                                    />
                                    <span className="product-type">{product.p_type}</span>
                                </div>
                                <div className="product-info">
                                    <h3>{product.product_name}</h3>
                                    <div className="price-row">
                                        <span className="current-price">${product.dis_product_price}</span>
                                        {product.product_price !== product.dis_product_price && (
                                            <span className="original-price">${product.product_price}</span>
                                        )}
                                    </div>
                                    {product.p_des && (
                                        <p className="product-desc">{product.p_des.substring(0, 60)}...</p>
                                    )}
                                </div>
                                <div className="product-actions">
                                    <button className="edit-btn" onClick={() => openEditModal(product)}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                        Edit
                                    </button>
                                    <button 
                                        className="delete-btn" 
                                        onClick={() => setDeleteConfirm(product._id)}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6"/>
                                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                                            <line x1="10" y1="11" x2="10" y2="17"/>
                                            <line x1="14" y1="11" x2="14" y2="17"/>
                                        </svg>
                                        Delete
                                    </button>
                                </div>

                                {deleteConfirm === product._id && (
                                    <div className="delete-confirm-overlay">
                                        <div className="delete-confirm-box">
                                            <p>Delete this product?</p>
                                            <div className="confirm-actions">
                                                <button onClick={() => setDeleteConfirm(null)}>Cancel</button>
                                                <button className="danger" onClick={() => handleDelete(product._id)}>Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Product Name *</label>
                                <input 
                                    type="text" 
                                    name="product_name"
                                    value={formData.product_name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price *</label>
                                    <input 
                                        type="number" 
                                        name="product_price"
                                        value={formData.product_price}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Discounted Price</label>
                                    <input 
                                        type="number" 
                                        name="dis_product_price"
                                        value={formData.dis_product_price}
                                        onChange={handleInputChange}
                                        step="0.01"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select name="p_type" value={formData.p_type} onChange={handleInputChange}>
                                    <option value="general">General</option>
                                    <option value="top">Top</option>
                                    <option value="bottom">Bottom</option>
                                    <option value="shoes">Shoes</option>
                                    <option value="accessories">Accessories</option>
                                    <option value="bags">Bags</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea 
                                    name="p_des"
                                    value={formData.p_des}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>
                            <div className="form-group">
                                <label>Images</label>
                                {formData.images.map((img, idx) => (
                                    <div key={idx} className="image-input-row">
                                        <input 
                                            type="text" 
                                            value={img}
                                            onChange={(e) => handleImageChange(idx, e.target.value)}
                                            placeholder="Image filename (e.g., product1.jpg)"
                                        />
                                        {formData.images.length > 1 && (
                                            <button type="button" className="remove-img-btn" onClick={() => removeImageField(idx)}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" className="add-img-btn" onClick={addImageField}>
                                    + Add Image
                                </button>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn">
                                    {editingProduct ? 'Update Product' : 'Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
