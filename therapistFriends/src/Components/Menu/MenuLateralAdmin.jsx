// src/Components/Menu/MenuLateralAdmin.jsx

import React, { useState, useEffect } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import styles from './MenuLateralAdmin.module.css';

import { RxBarChart } from "react-icons/rx";
import { FaUsers, FaHandHoldingMedical } from "react-icons/fa";
import { GiMedicalDrip, GiExitDoor } from "react-icons/gi";
import { BsGearWide } from "react-icons/bs";
import { AiOutlineCaretRight, AiOutlineCaretLeft } from "react-icons/ai";

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from '../../contexts/UserContext';
import api from '../../api/apiConfig';

function MenuLateralAdmin() {
    const [menuCollapsed, setMenuCollapsed] = useState(false);
    const [loading, setLoading] = useState(false);
    const location = useLocation();

    const isProfissionalPage = location.pathname === '/profissionais';
    const [redirect, setRedirect] = useState(null);

    const { setUsuario } = useUser();

    const toggleMenu = () => {
        setMenuCollapsed(!menuCollapsed);
    };

    useEffect(() => {
        if (isProfissionalPage) {
            setMenuCollapsed(true);
        }
    }, [isProfissionalPage]);

    async function logout(e) {
        e.preventDefault();

        if (loading) return;

        setLoading(true);

        try {
            await api.post('/auth/logout');

            toast.success('Volte sempre! Saindo...', {
                autoClose: 2000
            });

            setTimeout(() => {
                setRedirect(true);
            }, 2000);

        } catch (error) {
            setRedirect(true);
        } finally {
            setLoading(false);
        }
    }

    if (redirect) {
        setUsuario(null);

        return <Navigate to="/login" replace />;
    }

    return (
        <aside
            className={`${styles.menuAdmin} ${
                menuCollapsed ? styles.collapsed : ''
            }`}
        >
            <h2 className={styles.menuTitulo}>
                {!menuCollapsed && 'Painel Admin'}
            </h2>

            <nav className={styles.nav}>
                <ul className={styles.navList}>

                    <li className={styles.navItem}>
                        <Link to="/admin/dashboard" className={styles.navLink}>
                            <RxBarChart />
                            {!menuCollapsed && <span>Dashboard</span>}
                        </Link>
                    </li>

                    <li className={styles.navItem}>
                        <Link to="/admin/usuarios" className={styles.navLink}>
                            <FaUsers />
                            {!menuCollapsed && <span>Usuários</span>}
                        </Link>
                    </li>

                    <li className={styles.navItem}>
                        <Link to="/admin/profissionais" className={styles.navLink}>
                            <FaHandHoldingMedical />
                            {!menuCollapsed && <span>Profissionais</span>}
                        </Link>
                    </li>

                    <li className={styles.navItem}>
                        <Link to="/admin/pacientes" className={styles.navLink}>
                            <GiMedicalDrip />
                            {!menuCollapsed && <span>Pacientes</span>}
                        </Link>
                    </li>

                    <li className={styles.navItem}>
                        <Link to="" className={styles.navLink}>
                            <BsGearWide />
                            {!menuCollapsed && <span>Configurações</span>}
                        </Link>
                    </li>

                    <li className={styles.navItem}>
                        <Link
                            to=""
                            onClick={logout}
                            className={styles.navLink}
                            aria-disabled={loading}
                        >
                            <GiExitDoor />
                            {!menuCollapsed && (
                                <span>{loading ? 'Saindo...' : 'Sair'}</span>
                            )}
                        </Link>
                    </li>

                </ul>
            </nav>

            <button
                type="button"
                className={styles.toggleButton}
                onClick={toggleMenu}
                aria-label={
                    menuCollapsed
                        ? 'Expandir menu'
                        : 'Recolher menu'
                }
            >
                {menuCollapsed
                    ? <AiOutlineCaretRight />
                    : <AiOutlineCaretLeft />
                }
            </button>
        </aside>
    );
}

export default MenuLateralAdmin;