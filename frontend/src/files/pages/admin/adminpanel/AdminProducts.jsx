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
        product_name: '', product_price: '', dis_product_price: '', p_type: 'top', p_des: '', id: '',
        images: [{ pi_1: '', color_code: '#000000', color: 'black' }]
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    const navItems = [
        { path: '/AdminPanel', label: 'Dashboard' },
        { path: '/AdminProducts', label: 'Products' },
        { path: '/AdminOrders', label: 'Orders' },
        { path: '/AdminUsers', label: 'Users' },
        { path: '/UserList', label: 'Messages' }
    ];

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/products`, { withCredentials: true });
            setProducts(res.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleImageChange = (i, field, val) => {
        const imgs = [...formData.images];
        imgs[i] = { ...imgs[i], [field]: val };
        setFormData({ ...formData, images: imgs });
    };

    const openAdd = () => {
        setModalMode('add');
        setSelectedProduct(null);
        setFormData({ product_name: '', product_price: '', dis_product_price: '', p_type: 'top', p_des: '', id: `P-${Date.now()}`, images: [{ pi_1: '', color_code: '#000000', color: 'black' }] });
        setShowModal(true);
        setMessage({ type: '', text: '' });
    };

    const openEdit = (p) => {
        setModalMode('edit');
        setSelectedProduct(p);
        setFormData({ product_name: p.product_name || '', product_price: p.product_price || '', dis_product_price: p.dis_product_price || '', p_type: p.p_type || 'top', p_des: p.p_des || '', id: p.id || '', images: p.images?.length ? p.images : [{ pi_1: '', color_code: '#000000', color: 'black' }] });
        setShowModal(true);
        setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.product_name || !formData.product_price) {
            setMessage({ type: 'error', text: 'Name and price required' });
            return;
        }
        try {
            const data = { ...formData, product_price: parseFloat(formData.product_price), dis_product_price: formData.dis_product_price ? parseFloat(formData.dis_product_price) : undefined };
            if (modalMode === 'add') {
                await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/admin/products`, data, { withCredentials: true });
            } else {
                await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/admin/products/${selectedProduct._id}`, data, { withCredentials: true });
            }
            setShowModal(false);
            fetchProducts();
        } catch (e) {
            setMessage({ type: 'error', text: 'Failed to save' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/admin/products/${id}`, { withCredentials: true });
            fetchProducts();
        } catch (e) {
            console.error(e);
        }
    };

    const filtered = products.filter(p => p.product_name?.toLowerCase().includes(searchTerm.toLowerCase()));

    const getImg = (p) => {
        const img = p.images?.[0]?.pi_1;
        if (img) return img.startsWith('http') ? img : `/images/${img}`;
        return '/images/default.jpg';
    };

    return (
        <div className="admin-page">
            <nav className="admin-nav">
                <Link to="/AdminPanel" className="admin-brand">Admin Panel</Link>
                <div className="admin-links">
                    {navItems.map((item) => (
                        <Link key={item.path} to={item.path} className={location.pathname === item.path ? 'active' : ''}>{item.label}</Link>
                    ))}
                </div>
                <Link to="/" className="back-link">← Back to Store</Link>
            </nav>

            <div className="admin-body">
                <div className="page-top">
                    <h1>Products ({products.length})</h1>
                    <button className="btn-primary" onClick={openAdd}>+ Add Product</button>
                </div>

                <input type="text" className="search-input" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

                {loading ? (
                    <div className="loading">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="empty">No products found</div>
                ) : (
                    <div className="product-grid">
                        {filtered.map((p) => (
                            <div key={p._id} className="product-card">
                                <img src={getImg(p)} alt={p.product_name} onError={(e) => e.target.src = '/images/default.jpg'} />
                                <div className="product-info">
                                    <h3>{p.product_name}</h3>
                                    <p className="price">${p.dis_product_price || p.product_price}</p>
                                </div>
                                <div className="product-btns">
                                    <button onClick={() => openEdit(p)}>Edit</button>
                                    <button className="del" onClick={() => handleDelete(p._id)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-bg" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-head">
                            <h2>{modalMode === 'add' ? 'Add Product' : 'Edit Product'}</h2>
                            <button onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {message.text && <div className={`msg ${message.type}`}>{message.text}</div>}
                                <label>Name *</label>
                                <input type="text" name="product_name" value={formData.product_name} onChange={handleChange} required />
                                <div className="row">
                                    <div><label>Price *</label><input type="number" name="product_price" value={formData.product_price} onChange={handleChange} step="0.01" required /></div>
                                    <div><label>Sale Price</label><input type="number" name="dis_product_price" value={formData.dis_product_price} onChange={handleChange} step="0.01" /></div>
                                </div>
                                <div className="row">
                                    <div><label>Category</label><select name="p_type" value={formData.p_type} onChange={handleChange}><option value="top">Top</option><option value="bottom">Bottom</option><option value="shoes">Shoes</option></select></div>
                                    <div><label>ID</label><input type="text" name="id" value={formData.id} onChange={handleChange} /></div>
                                </div>
                                <label>Description</label>
                                <textarea name="p_des" value={formData.p_des} onChange={handleChange} rows="2" />
                                <label>Image URL</label>
                                <input type="text" value={formData.images[0]?.pi_1 || ''} onChange={(e) => handleImageChange(0, 'pi_1', e.target.value)} placeholder="e.g. product.jpg or https://..." />
                            </div>
                            <div className="modal-foot">
                                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">{modalMode === 'add' ? 'Add' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
