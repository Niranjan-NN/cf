import React from 'react';
import { FaSearch, FaSignOutAlt } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import styles from './AdminViewDetails.module.css';

const AdminViewDetails = () => {
    const navigate = useNavigate();
   
    const handleLogout = () => {
        navigate("/adminloginpage"); // Navigate to the signup page on logout
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                {/* Navbar */}
                <nav className={styles.navbar}>
                    <div className={styles.navbarBrand}>CORE FOUR / Admin</div>
                    <div className={styles.navbarSearch}>
                        <input type="text" placeholder="Search for products, orders, users..." className={styles.searchInput} />
                        <FaSearch className={styles.searchIcon} />
                    </div>
                    <div className={styles.navbarIcons}>
                        <FaSignOutAlt onClick={handleLogout} className={styles.logoutIcon} title="Logout" />
                    </div>
                </nav>
            </header>
            <main className={styles.main}>
                <div className={styles.sidebar}>
                    <ul>
                        <li><Link to="/adminview">View Products</Link></li>
                        <li><Link to="/admindetials">View Orders</Link></li>
                        <li><Link to="/adminusers">View Users</Link></li>
                        <li><a href="#">Sales Report</a></li>
                    </ul>
                </div>
                <section className={styles.bookingSection}>
                    <h2>Latest Orders</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Order No.</th>
                                <th>Customer Name</th>
                                <th>Order Date</th>
                                <th>Product ID</th>
                                <th>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>02DFG5</td>
                                <td><img src="profile-pic.jpg" alt="Profile Picture" /> Jane Cooper</td>
                                <td>7/27/13</td>
                                <td>EK802</td>
                                <td><span className={`${styles.status} ${styles.booked}`}>Delivered</span></td>
                            </tr>
                            <tr>
                                <td>02DFG6</td>
                                <td><img src="profile-pic.jpg" alt="Profile Picture" /> Jenny Wilson</td>
                                <td>7/27/13</td>
                                <td>GF802</td>
                                <td><span className={`${styles.status} ${styles.onHold}`}>Pending</span></td>
                            </tr>
                            <tr>
                                <td>02DFG7</td>
                                <td><img src="profile-pic.jpg" alt="Profile Picture" /> Robert Fox</td>
                                <td>7/27/13</td>
                                <td>-</td>
                                <td><span className={`${styles.status} ${styles.booked}`}>Shipped</span></td>
                            </tr>
                            <tr>
                                <td>02DFG8</td>
                                <td><img src="profile-pic.jpg" alt="Profile Picture" /> Jerome Bell</td>
                                <td>7/27/13</td>
                                <td>EK802</td>
                                <td><span className={`${styles.status} ${styles.booked}`}>Returned</span></td>
                            </tr>
                            <tr>
                                <td>02DFG9</td>
                                <td><img src="profile-pic.jpg" alt="Profile Picture" /> Devon Lane</td>
                                <td>6/27/13</td>
                                <td>-</td>
                                <td><span className={`${styles.status} ${styles.booked}`}>Cancelled</span></td>
                            </tr>
                            <tr>
                                <td>02DFG10</td>
                                <td><img src="profile-pic.jpg" alt="Profile Picture" /> Arlene McCoy</td>
                                <td>6/27/13</td>
                                <td>EK802</td>
                                <td><span className={`${styles.status} ${styles.booked}`}>Delivered</span></td>
                            </tr>
                        </tbody>
                    </table>
                </section>
                <aside className={styles.invoiceSection}>
                    <h2>Order Details</h2>
                    <div className={styles.invoiceDetails}>
                        <img src="profile-pic.jpg" alt="Profile Picture" />
                        <div className={styles.invoiceInfo}>
                            <h3>Jerome Bell</h3>
                            <p>JeromeBell@gmail.com</p>
                        </div>
                        <p className={styles.description}>
                            Order ID: 02DFG8<br />
                            Product: Smartphone<br />
                            Quantity: 1<br />
                            Total Amount: $599.99<br />
                            Payment Status: Paid<br />
                            Shipping Status: Delivered
                        </p>
                        <p className={styles.invoiceUpdate}>Order status updated on 7/27/13</p>
                        <div className={styles.invoiceActions}>
                            <button className={styles.accept}>Accept</button>
                            <button className={styles.saveSend}>Save & Send</button>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default AdminViewDetails;
