import React, { useState, useEffect } from 'react';
import { Search, Filter, Upload, BookOpen, Users, FileText, Download, Lock, Eye, Trash2, Check, X, BarChart } from 'lucide-react';

const FILIERES = [
    'Transit consignation et armement',
    'Transport et assurance maritime',
    'Manutention management Logistique',
    'Sécurité et sûreté maritimes'
];

const ADMIN_PASSWORD = 'imm2024admin';

export default function PlatformeMemoiresIMM() {
    const [page, setPage] = useState('accueil');
    const [memoires, setMemoires] = useState([]);
    const [memoiresEnAttente, setMemoiresEnAttente] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filiereFilter, setFiliereFilter] = useState('Toutes');
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const [formData, setFormData] = useState({
        titre: '',
        auteur: '',
        filiere: FILIERES[0],
        annee: '2024',
        resume: '',
        motsCles: '',
        pdfUrl: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const memoiresResult = await window.storage.list('memoire:', false);
            const enAttenteResult = await window.storage.list('attente:', false);

            const memoiresData = [];
            const enAttenteData = [];

            if (memoiresResult?.keys) {
                for (const key of memoiresResult.keys) {
                    try {
                        const result = await window.storage.get(key, false);
                        if (result?.value) {
                            memoiresData.push(JSON.parse(result.value));
                        }
                    } catch (e) {
                        console.log('Mémoire non trouvé:', key);
                    }
                }
            }

            if (enAttenteResult?.keys) {
                for (const key of enAttenteResult.keys) {
                    try {
                        const result = await window.storage.get(key, false);
                        if (result?.value) {
                            enAttenteData.push(JSON.parse(result.value));
                        }
                    } catch (e) {
                        console.log('Mémoire en attente non trouvé:', key);
                    }
                }
            }

            setMemoires(memoiresData.sort((a, b) => b.dateAjout - a.dateAjout));
            setMemoiresEnAttente(enAttenteData.sort((a, b) => b.dateAjout - a.dateAjout));
        } catch (error) {
            console.error('Erreur chargement:', error);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newMemoire = {
            id: Date.now().toString(),
            ...formData,
            motsCles: formData.motsCles.split(',').map(m => m.trim()),
            dateAjout: Date.now(),
            statut: 'en_attente'
        };

        try {
            await window.storage.set(`attente:${newMemoire.id}`, JSON.stringify(newMemoire), false);
            alert('Votre mémoire a été soumis avec succès ! Il sera visible après validation par l\'administration.');
            setFormData({
                titre: '',
                auteur: '',
                filiere: FILIERES[0],
                annee: '2024',
                resume: '',
                motsCles: '',
                pdfUrl: ''
            });
            await loadData();
            setPage('accueil');
        } catch (error) {
            alert('Erreur lors de la soumission. Veuillez réessayer.');
        }
    };

    const approveMemoire = async (memoire) => {
        try {
            const approvedMemoire = { ...memoire, statut: 'approuve' };
            await window.storage.set(`memoire:${memoire.id}`, JSON.stringify(approvedMemoire), false);
            await window.storage.delete(`attente:${memoire.id}`, false);
            await loadData();
        } catch (error) {
            alert('Erreur lors de l\'approbation.');
        }
    };

    const rejectMemoire = async (id) => {
        try {
            await window.storage.delete(`attente:${id}`, false);
            await loadData();
        } catch (error) {
            alert('Erreur lors du rejet.');
        }
    };

    const deleteMemoire = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce mémoire ?')) {
            try {
                await window.storage.delete(`memoire:${id}`, false);
                await loadData();
            } catch (error) {
                alert('Erreur lors de la suppression.');
            }
        }
    };

    const handleAdminLogin = () => {
        if (adminPassword === ADMIN_PASSWORD) {
            setIsAdmin(true);
            setShowPasswordModal(false);
            setPage('admin');
        } else {
            alert('Mot de passe incorrect');
        }
    };

    const filteredMemoires = memoires.filter(m => {
        const matchSearch = m.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.auteur.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.motsCles.some(mc => mc.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchFiliere = filiereFilter === 'Toutes' || m.filiere === filiereFilter;
        return matchSearch && matchFiliere;
    });

    const stats = {
        total: memoires.length,
        parFiliere: FILIERES.map(f => ({
            filiere: f,
            count: memoires.filter(m => m.filiere === f).length
        }))
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(to bottom right, #EFF6FF, #ECFEFF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        border: '4px solid #E5E7EB',
                        borderTopColor: '#2563EB',
                        borderRadius: '50%',
                        width: '64px',
                        height: '64px',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }}></div>
                    <p style={{ marginTop: '16px', color: '#6B7280' }}>Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(to bottom right, #EFF6FF, #ECFEFF)'
        }}>
            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

            {/* Header */}
            <header style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{
                    maxWidth: '1280px',
                    margin: '0 auto',
                    padding: '16px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '16px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                backgroundColor: '#2563EB',
                                padding: '8px',
                                borderRadius: '8px'
                            }}>
                                <BookOpen color="#FFFFFF" size={32} />
                            </div>
                            <div>
                                <h1 style={{
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: '#1F2937',
                                    margin: 0
                                }}>Bibliothèque Numérique</h1>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#6B7280',
                                    margin: 0
                                }}>Institut des Métiers de la Mer - Promotion 2024</p>
                            </div>
                        </div>
                        <nav style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => setPage('accueil')}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    backgroundColor: page === 'accueil' ? '#2563EB' : '#F3F4F6',
                                    color: page === 'accueil' ? '#FFFFFF' : '#374151',
                                    fontWeight: '500'
                                }}
                            >
                                Accueil
                            </button>
                            <button
                                onClick={() => setPage('bibliotheque')}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    backgroundColor: page === 'bibliotheque' ? '#2563EB' : '#F3F4F6',
                                    color: page === 'bibliotheque' ? '#FFFFFF' : '#374151',
                                    fontWeight: '500'
                                }}
                            >
                                Bibliothèque
                            </button>
                            <button
                                onClick={() => setPage('soumettre')}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    backgroundColor: page === 'soumettre' ? '#2563EB' : '#F3F4F6',
                                    color: page === 'soumettre' ? '#FFFFFF' : '#374151',
                                    fontWeight: '500'
                                }}
                            >
                                Soumettre
                            </button>
                            <button
                                onClick={() => {
                                    if (isAdmin) {
                                        setPage('admin');
                                    } else {
                                        setShowPasswordModal(true);
                                    }
                                }}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    backgroundColor: page === 'admin' ? '#2563EB' : '#F3F4F6',
                                    color: page === 'admin' ? '#FFFFFF' : '#374151',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Lock size={16} />
                                <span>Admin</span>
                            </button>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Modal mot de passe admin */}
            {showPasswordModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50
                }}>
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        padding: '24px',
                        maxWidth: '448px',
                        width: '100%',
                        margin: '0 16px'
                    }}>
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: 'bold',
                            marginBottom: '16px',
                            color: '#1F2937'
                        }}>Accès Administration</h3>
                        <input
                            type="password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                            placeholder="Mot de passe"
                            style={{
                                width: '100%',
                                padding: '8px 2px',
                                border: '1px solid #D1D5DB',
                                borderRadius: '8px',
                                marginBottom: '16px',
                                fontSize: '16px'
                            }}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={handleAdminLogin}
                                style={{
                                    flex: 1,
                                    backgroundColor: '#2563EB',
                                    color: '#FFFFFF',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                Connexion
                            </button>
                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setAdminPassword('');
                                }}
                                style={{
                                    flex: 1,
                                    backgroundColor: '#E5E7EB',
                                    color: '#374151',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Contenu principal */}
            <main style={{
                maxWidth: '1280px',
                margin: '0 auto',
                padding: '32px 16px'
            }}>
                {/* PAGE ACCUEIL */}
                {page === 'accueil' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {/* Hero Section */}
                        <div style={{
                            background: 'linear-gradient(to right, #2563EB, #0891B2)',
                            borderRadius: '16px',
                            padding: '32px',
                            color: '#FFFFFF'
                        }}>
                            <h2 style={{
                                fontSize: '36px',
                                fontWeight: 'bold',
                                marginBottom: '16px',
                                margin: 0
                            }}>Bienvenue sur la Bibliothèque Numérique de l'IMM</h2>
                            <p style={{
                                fontSize: '20px',
                                marginBottom: '24px'
                            }}>Première promotion - Une ressource créée par les pionniers, pour les futures générations</p>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '16px'
                            }}>
                                <div style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    borderRadius: '8px',
                                    padding: '16px'
                                }}>
                                    <FileText size={32} style={{ marginBottom: '8px' }} />
                                    <div style={{ fontSize: '30px', fontWeight: 'bold' }}>{stats.total}</div>
                                    <div style={{ fontSize: '14px' }}>Mémoires disponibles</div>
                                </div>
                                <div style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    borderRadius: '8px',
                                    padding: '16px'
                                }}>
                                    <Users size={32} style={{ marginBottom: '8px' }} />
                                    <div style={{ fontSize: '30px', fontWeight: 'bold' }}>4</div>
                                    <div style={{ fontSize: '14px' }}>Filières représentées</div>
                                </div>
                                <div style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    borderRadius: '8px',
                                    padding: '16px'
                                }}>
                                    <BookOpen size={32} style={{ marginBottom: '8px' }} />
                                    <div style={{ fontSize: '30px', fontWeight: 'bold' }}>2024</div>
                                    <div style={{ fontSize: '14px' }}>Promotion pionnière</div>
                                </div>
                            </div>
                        </div>

                        {/* Mission */}
                        <div style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            padding: '24px'
                        }}>
                            <h3 style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: '#1F2937',
                                marginBottom: '16px'
                            }}>Notre Mission</h3>
                            <p style={{
                                color: '#6B7280',
                                marginBottom: '16px',
                                lineHeight: '1.6'
                            }}>
                                Face aux défis d'accès limité aux ressources bibliographiques spécialisées, nous, étudiants de la première promotion de l'Institut des Métiers de la Mer, avons créé cette plateforme pour :
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {[
                                    'Faciliter le travail de recherche des promotions futures',
                                    'Consolider la mémoire académique de notre institut',
                                    'Créer une base de données accessible gratuitement',
                                    'Promouvoir l\'excellence académique dans les métiers de la mer'
                                ].map((text, i) => (
                                    <div key={i} style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '8px'
                                    }}>
                                        <Check color="#16A34A" size={20} style={{ marginTop: '4px', flexShrink: 0 }} />
                                        <span style={{ color: '#6B7280' }}>{text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Statistiques par filière */}
                        <div style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            padding: '24px'
                        }}>
                            <h3 style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: '#1F2937',
                                marginBottom: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <BarChart size={24} />
                                <span>Répartition par Filière</span>
                            </h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '16px'
                            }}>
                                {stats.parFiliere.map((item, index) => (
                                    <div key={index} style={{
                                        borderLeft: '4px solid #2563EB',
                                        paddingLeft: '16px',
                                        paddingTop: '8px',
                                        paddingBottom: '8px'
                                    }}>
                                        <div style={{
                                            fontWeight: '600',
                                            color: '#1F2937',
                                            marginBottom: '4px'
                                        }}>{item.filiere}</div>
                                        <div style={{
                                            fontSize: '24px',
                                            fontWeight: 'bold',
                                            color: '#2563EB'
                                        }}>{item.count} mémoire{item.count > 1 ? 's' : ''}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '16px'
                        }}>
                            <button
                                onClick={() => setPage('bibliotheque')}
                                style={{
                                    backgroundColor: '#2563EB',
                                    color: '#FFFFFF',
                                    padding: '24px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    transition: 'all 0.3s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                            >
                                <Search size={24} />
                                <span>Explorer la bibliothèque</span>
                            </button>
                            <button
                                onClick={() => setPage('soumettre')}
                                style={{
                                    backgroundColor: '#16A34A',
                                    color: '#FFFFFF',
                                    padding: '24px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    transition: 'all 0.3s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#15803D'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#16A34A'}
                            >
                                <Upload size={24} />
                                <span>Soumettre mon mémoire</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* PAGE BIBLIOTHÈQUE */}
                {page === 'bibliotheque' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <h2 style={{
                            fontSize: '30px',
                            fontWeight: 'bold',
                            color: '#1F2937'
                        }}>Bibliothèque des Mémoires</h2>

                        {/* Filtres */}
                        <div style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            padding: '16px'
                        }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '16px'
                            }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '8px'
                                    }}>Rechercher</label>
                                    <div style={{ position: 'relative' }}>
                                        <Search style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#9CA3AF'
                                        }} size={20} />
                                        <input
                                            type="text"
                                            placeholder="Titre, auteur, mots-clés..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{
                                                width: '100%',
                                                paddingLeft: '40px',
                                                paddingRight: '16px',
                                                paddingTop: '8px',
                                                paddingBottom: '8px',
                                                border: '1px solid #D1D5DB',
                                                borderRadius: '8px',
                                                fontSize: '16px'
                                            }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '8px'
                                    }}>Filière</label>
                                    <div style={{ position: 'relative' }}>
                                        <Filter style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#9CA3AF'
                                        }} size={20} />
                                        <select
                                            value={filiereFilter}
                                            onChange={(e) => setFiliereFilter(e.target.value)}
                                            style={{
                                                width: '100%',
                                                paddingLeft: '40px',
                                                paddingRight: '16px',
                                                paddingTop: '8px',
                                                paddingBottom: '8px',
                                                border: '1px solid #D1D5DB',
                                                borderRadius: '8px',
                                                fontSize: '16px',
                                                backgroundColor: '#FFFFFF'
                                            }}
                                        >
                                            <option>Toutes</option>
                                            {FILIERES.map((f, i) => <option key={i}>{f}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Liste des mémoires */}
                        <div style={{
                            fontSize: '14px',
                            color: '#6B7280',
                            marginBottom: '8px'
                        }}>
                            {filteredMemoires.length} mémoire{filteredMemoires.length > 1 ? 's' : ''} trouvé{filteredMemoires.length > 1 ? 's' : ''}
                        </div>

                        {filteredMemoires.length === 0 ? (
                            <div style={{
                                backgroundColor: '#FFFFFF',
                                borderRadius: '12px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                padding: '48px',
                                textAlign: 'center'
                            }}>
                                <BookOpen size={64} style={{ margin: '0 auto 16px', color: '#D1D5DB' }} />
                                <h3 style={{
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    color: '#6B7280',
                                    marginBottom: '8px'
                                }}>Aucun mémoire trouvé</h3>
                                <p style={{ color: '#9CA3AF' }}>Essayez de modifier vos critères de recherche</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {filteredMemoires.map((m) => (
                                    <div key={m.id} style={{
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        padding: '24px',
                                        transition: 'box-shadow 0.3s'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            justifyContent: 'space-between',
                                            marginBottom: '12px',
                                            flexWrap: 'wrap',
                                            gap: '16px'
                                        }}>
                                            <div style={{ flex: 1, minWidth: '250px' }}>
                                                <h3 style={{
                                                    fontSize: '20px',
                                                    fontWeight: 'bold',
                                                    color: '#1F2937',
                                                    marginBottom: '8px'
                                                }}>{m.titre}</h3>
                                                <div style={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    fontSize: '14px',
                                                    color: '#6B7280',
                                                    marginBottom: '12px'
                                                }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Users size={16} />
                                                        <span>{m.auteur}</span>
                                                    </span>
                                                    <span style={{
                                                        backgroundColor: '#DBEAFE',
                                                        color: '#1E40AF',
                                                        padding: '4px 12px',
                                                        borderRadius: '9999px',
                                                        fontSize: '12px',
                                                        fontWeight: '600'
                                                    }}>
                                                        {m.filiere}
                                                    </span>
                                                    <span>{m.annee}</span>
                                                </div>
                                            </div>
                                            <a
                                                href={m.pdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    backgroundColor: '#2563EB',
                                                    color: '#FFFFFF',
                                                    padding: '8px 16px',
                                                    borderRadius: '8px',
                                                    textDecoration: 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    fontWeight: '500',
                                                    transition: 'background-color 0.3s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                                            >
                                                <Download size={16} />
                                                <span>Télécharger</span>
                                            </a>
                                        </div>
                                        <p style={{
                                            color: '#6B7280',
                                            marginBottom: '12px',
                                            lineHeight: '1.6'
                                        }}>{m.resume}</p>
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '8px'
                                        }}>
                                            {m.motsCles.map((mc, i) => (
                                                <span key={i} style={{
                                                    backgroundColor: '#F3F4F6',
                                                    color: '#374151',
                                                    padding: '4px 12px',
                                                    borderRadius: '9999px',
                                                    fontSize: '12px'
                                                }}>
                                                    #{mc}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* PAGE SOUMETTRE */}
                {page === 'soumettre' && (
                    <div style={{ maxWidth: '768px', margin: '0 auto' }}>
                        <div style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            padding: '32px'
                        }}>
                            <h2 style={{
                                fontSize: '30px',
                                fontWeight: 'bold',
                                color: '#1F2937',
                                marginBottom: '8px'
                            }}>Soumettre votre mémoire</h2>
                            <p style={{
                                color: '#6B7280',
                                marginBottom: '24px',
                                lineHeight: '1.6'
                            }}>
                                Votre mémoire sera examiné par l'administration avant d'être publié dans la bibliothèque.
                            </p>

                            <form onSubmit={handleSubmit} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '24px'
                            }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '8px'
                                    }}>Titre du mémoire *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.titre}
                                        onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '8px 8px',
                                            border: '1px solid #D1D5DB',
                                            borderRadius: '8px',
                                            fontSize: '16px'
                                        }}
                                        placeholder="Ex: Analyse des risques maritimes dans le golfe de Guinée"
                                    />
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '8px'
                                    }}>Auteur *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.auteur}
                                        onChange={(e) => setFormData({ ...formData, auteur: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '8px 8px',
                                            border: '1px solid #D1D5DB',
                                            borderRadius: '8px',
                                            fontSize: '16px'
                                        }}
                                        placeholder="Votre nom complet"
                                    />
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '16px'
                                }}>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#374151',
                                            marginBottom: '8px'
                                        }}>Filière *</label>
                                        <select
                                            required
                                            value={formData.filiere}
                                            onChange={(e) => setFormData({ ...formData, filiere: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '8px 8px',
                                                border: '1px solid #D1D5DB',
                                                borderRadius: '8px',
                                                fontSize: '16px',
                                                backgroundColor: '#FFFFFF'
                                            }}
                                        >
                                            {FILIERES.map((f, i) => <option key={i}>{f}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#374151',
                                            marginBottom: '8px'
                                        }}>Année *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.annee}
                                            onChange={(e) => setFormData({ ...formData, annee: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '8px 8px',
                                                border: '1px solid #D1D5DB',
                                                borderRadius: '8px',
                                                fontSize: '16px'
                                            }}
                                            placeholder="2024"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '8px'
                                    }}>Résumé *</label>
                                    <textarea
                                        required
                                        rows={6}
                                        value={formData.resume}
                                        onChange={(e) => setFormData({ ...formData, resume: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '8px 8px',
                                            border: '1px solid #D1D5DB',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            fontFamily: 'inherit'
                                        }}
                                        placeholder="Décrivez brièvement le contenu de votre mémoire, la problématique abordée et les principaux résultats..."
                                    />
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '8px'
                                    }}>Mots-clés *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.motsCles}
                                        onChange={(e) => setFormData({ ...formData, motsCles: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '8px 8px',
                                            border: '1px solid #D1D5DB',
                                            borderRadius: '8px',
                                            fontSize: '16px'
                                        }}
                                        placeholder="sécurité maritime, piraterie, golfe de Guinée (séparez par des virgules)"
                                    />
                                    <p style={{
                                        fontSize: '12px',
                                        color: '#6B7280',
                                        marginTop: '4px'
                                    }}>Séparez les mots-clés par des virgules</p>
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '8px'
                                    }}>Lien PDF *</label>
                                    <input
                                        type="url"
                                        required
                                        value={formData.pdfUrl}
                                        onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '8px 8px',
                                            border: '1px solid #D1D5DB',
                                            borderRadius: '8px',
                                            fontSize: '16px'
                                        }}
                                        placeholder="https://drive.google.com/... ou autre lien de téléchargement"
                                    />
                                    <p style={{
                                        fontSize: '12px',
                                        color: '#6B7280',
                                        marginTop: '4px'
                                    }}>
                                        Hébergez votre PDF sur Google Drive, Dropbox ou un autre service et collez le lien ici
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    style={{
                                        width: '100%',
                                        backgroundColor: '#16A34A',
                                        color: '#FFFFFF',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        transition: 'background-color 0.3s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#15803D'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#16A34A'}
                                >
                                    <Upload size={20} />
                                    <span>Soumettre le mémoire</span>
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* PAGE ADMIN */}
                {page === 'admin' && isAdmin && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <h2 style={{
                            fontSize: '30px',
                            fontWeight: 'bold',
                            color: '#1F2937'
                        }}>Administration</h2>

                        {/* Mémoires en attente */}
                        <div style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            padding: '24px'
                        }}>
                            <h3 style={{
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: '#1F2937',
                                marginBottom: '16px'
                            }}>
                                Mémoires en attente de validation ({memoiresEnAttente.length})
                            </h3>
                            {memoiresEnAttente.length === 0 ? (
                                <p style={{
                                    color: '#9CA3AF',
                                    textAlign: 'center',
                                    padding: '32px 0'
                                }}>Aucun mémoire en attente</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {memoiresEnAttente.map((m) => (
                                        <div key={m.id} style={{
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '8px',
                                            padding: '16px'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                justifyContent: 'space-between',
                                                marginBottom: '8px',
                                                flexWrap: 'wrap',
                                                gap: '12px'
                                            }}>
                                                <div style={{ flex: 1, minWidth: '200px' }}>
                                                    <h4 style={{
                                                        fontWeight: 'bold',
                                                        color: '#1F2937',
                                                        marginBottom: '4px'
                                                    }}>{m.titre}</h4>
                                                    <p style={{
                                                        fontSize: '14px',
                                                        color: '#6B7280'
                                                    }}>{m.auteur} - {m.filiere}</p>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => approveMemoire(m)}
                                                        style={{
                                                            backgroundColor: '#16A34A',
                                                            color: '#FFFFFF',
                                                            padding: '8px',
                                                            borderRadius: '8px',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            transition: 'background-color 0.3s'
                                                        }}
                                                        title="Approuver"
                                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#15803D'}
                                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#16A34A'}
                                                    >
                                                        <Check size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => rejectMemoire(m.id)}
                                                        style={{
                                                            backgroundColor: '#DC2626',
                                                            color: '#FFFFFF',
                                                            padding: '8px',
                                                            borderRadius: '8px',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            transition: 'background-color 0.3s'
                                                        }}
                                                        title="Rejeter"
                                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#B91C1C'}
                                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p style={{
                                                fontSize: '14px',
                                                color: '#6B7280',
                                                marginBottom: '8px'
                                            }}>{m.resume.substring(0, 150)}...</p>
                                            <a
                                                href={m.pdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    color: '#2563EB',
                                                    textDecoration: 'none',
                                                    fontSize: '14px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                            >
                                                <Eye size={16} />
                                                <span>Voir le PDF</span>
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Mémoires publiés */}
                        <div style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            padding: '24px'
                        }}>
                            <h3 style={{
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: '#1F2937',
                                marginBottom: '16px'
                            }}>
                                Mémoires publiés ({memoires.length})
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {memoires.map((m) => (
                                    <div key={m.id} style={{
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                        padding: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        flexWrap: 'wrap',
                                        gap: '12px'
                                    }}>
                                        <div style={{ flex: 1, minWidth: '200px' }}>
                                            <h4 style={{
                                                fontWeight: '600',
                                                color: '#1F2937',
                                                marginBottom: '4px'
                                            }}>{m.titre}</h4>
                                            <p style={{
                                                fontSize: '14px',
                                                color: '#6B7280'
                                            }}>{m.auteur} - {m.filiere} - {m.annee}</p>
                                        </div>
                                        <button
                                            onClick={() => deleteMemoire(m.id)}
                                            style={{
                                                backgroundColor: '#DC2626',
                                                color: '#FFFFFF',
                                                padding: '8px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.3s'
                                            }}
                                            title="Supprimer"
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#B91C1C'}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer style={{
                backgroundColor: '#1F2937',
                color: '#FFFFFF',
                marginTop: '64px'
            }}>
                <div style={{
                    maxWidth: '1280px',
                    margin: '0 auto',
                    padding: '32px 16px'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '32px'
                    }}>
                        <div>
                            <h4 style={{
                                fontWeight: 'bold',
                                fontSize: '18px',
                                marginBottom: '12px'
                            }}>Institut des Métiers de la Mer</h4>
                            <p style={{
                                color: '#D1D5DB',
                                fontSize: '14px',
                                lineHeight: '1.6'
                            }}>
                                Plateforme créée par la première promotion pour faciliter l'accès aux ressources académiques spécialisées.
                            </p>
                        </div>
                        <div>
                            <h4 style={{
                                fontWeight: 'bold',
                                fontSize: '18px',
                                marginBottom: '12px'
                            }}>Filières</h4>
                            <ul style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                            }}>
                                {FILIERES.map((f, i) => (
                                    <li key={i} style={{
                                        fontSize: '14px',
                                        color: '#D1D5DB'
                                    }}>• {f}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 style={{
                                fontWeight: 'bold',
                                fontSize: '18px',
                                marginBottom: '12px'
                            }}>Contact</h4>
                            <p style={{
                                color: '#D1D5DB',
                                fontSize: '14px',
                                lineHeight: '1.6'
                            }}>
                                Pour toute question ou suggestion concernant la plateforme, contactez l'administration.
                            </p>
                        </div>
                    </div>
                    <div style={{
                        borderTop: '1px solid #374151',
                        marginTop: '24px',
                        paddingTop: '24px',
                        textAlign: 'center'
                    }}>
                        <p style={{
                            fontSize: '14px',
                            color: '#9CA3AF',
                            margin: 0
                        }}>© 2024 Institut des Métiers de la Mer - Promotion Pionnière</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}