import React, { useState, useMemo, useEffect } from 'react';
import { useAdminContext } from '../../context/AdminContext';
import { categories } from '../../data/categories';

export default function ManageJobs() {
  const { state, dispatch } = useAdminContext();
  const jobs = state.jobs || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState(null);
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const initialFormState = {
    title: '',
    titleEn: '',
    organization: '',
    organizationEn: '',
    categoryId: '',
    jobType: '',
    location: '',
    vacancy: '',
    salary: '',
    deadline: '',
    description: '',
    requirements: '',
    applyLink: '',
    status: 'Active',
    images: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const filteredJobs = useMemo(() => {
    let result = jobs;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(job => 
        (job.title && job.title.toLowerCase().includes(q)) ||
        (job.titleEn && job.titleEn.toLowerCase().includes(q)) ||
        (job.organization && job.organization.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(job => job.status?.toLowerCase() === statusFilter);
    }

    if (categoryFilter !== 'all') {
      result = result.filter(job => job.categoryId === categoryFilter);
    }

    return result;
  }, [jobs, searchQuery, statusFilter, categoryFilter]);

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage) || 1;
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, categoryFilter]);

  const handleOpenModal = (job = null) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        ...job,
        requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : (job.requirements || ''),
        images: Array.isArray(job.images) ? job.images.join(', ') : (job.images || '')
      });
    } else {
      setEditingJob(null);
      setFormData(initialFormState);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingJob(null);
    setFormData(initialFormState);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveJob = (e) => {
    e.preventDefault();
    
    const reqArray = formData.requirements
      ? formData.requirements.split('\n').map(r => r.trim()).filter(r => r)
      : [];
    const imgArray = formData.images
      ? formData.images.split(',').map(i => i.trim()).filter(i => i)
      : [];
      
    const jobData = {
      ...formData,
      requirements: reqArray,
      images: imgArray,
      id: editingJob ? editingJob.id : `job_${Date.now()}`,
      postedAt: editingJob ? editingJob.postedAt : new Date().toISOString().split('T')[0]
    };

    if (editingJob) {
      dispatch({ type: 'UPDATE_JOB', payload: jobData });
      dispatch({ 
        type: 'ADD_ACTIVITY', 
        payload: { id: `act_${Date.now()}`, action: 'Updated circular', target: jobData.title, time: 'Just now' } 
      });
      showToast('Circular updated successfully!');
    } else {
      dispatch({ type: 'ADD_JOB', payload: jobData });
      dispatch({ 
        type: 'ADD_ACTIVITY', 
        payload: { id: `act_${Date.now()}`, action: 'Added new circular', target: jobData.title, time: 'Just now' } 
      });
      showToast('New circular added successfully!');
    }
    handleCloseModal();
  };

  const handleDeleteConfirm = (id) => {
    setDeletingJobId(id);
    setShowDeleteConfirm(true);
  };

  const executeDelete = () => {
    if (deletingJobId) {
      const jobToDelete = jobs.find(j => j.id === deletingJobId);
      dispatch({ type: 'DELETE_JOB', payload: deletingJobId });
      dispatch({ 
        type: 'ADD_ACTIVITY', 
        payload: { id: `act_${Date.now()}`, action: 'Deleted circular', target: jobToDelete ? jobToDelete.title : 'Unknown', time: 'Just now' } 
      });
      showToast('Circular deleted successfully!');
      setShowDeleteConfirm(false);
      setDeletingJobId(null);
    }
  };

  const handleToggleStatus = (job) => {
    const newStatus = job.status === 'Active' ? 'Draft' : 'Active';
    const updatedJob = { ...job, status: newStatus };
    dispatch({ type: 'UPDATE_JOB', payload: updatedJob });
    showToast(`Circular status changed to ${newStatus}`);
  };

  const filterBtnStyle = (isActive) => ({
    backgroundColor: isActive ? '#1a56db' : '#f1f5f9',
    color: isActive ? '#ffffff' : '#64748b',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    marginRight: '8px',
    fontWeight: '500'
  });

  return (
    <div className="admin-page" style={{ color: '#1e293b', backgroundColor: '#f8fafc', minHeight: '100vh', padding: '20px' }}>
      {toast.show && (
        <div className={`admin-toast admin-toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#1e293b', margin: 0 }}>Manage Circulars</h1>
        <button className="admin-btn admin-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#1a56db', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }} onClick={() => handleOpenModal()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add New Circular
        </button>
      </div>

      <div className="admin-filters" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="admin-search-wrapper" style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
          <svg className="admin-search-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            className="admin-search" 
            style={{ width: '100%', padding: '10px 10px 10px 40px', backgroundColor: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '6px', outline: 'none' }}
            placeholder="Search title or organization..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="admin-filter-buttons" style={{ display: 'flex' }}>
          <button style={filterBtnStyle(statusFilter === 'all')} onClick={() => setStatusFilter('all')}>All</button>
          <button style={filterBtnStyle(statusFilter === 'active')} onClick={() => setStatusFilter('active')}>Active</button>
          <button style={filterBtnStyle(statusFilter === 'draft')} onClick={() => setStatusFilter('draft')}>Draft</button>
          <button style={filterBtnStyle(statusFilter === 'expired')} onClick={() => setStatusFilter('expired')}>Expired</button>
        </div>

        <select 
          className="admin-select-filter" 
          style={{ padding: '10px', backgroundColor: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '6px', outline: 'none' }}
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="admin-table-wrapper" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#334155', fontWeight: '600' }}>#</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#334155', fontWeight: '600' }}>Title</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#334155', fontWeight: '600' }}>Organization</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#334155', fontWeight: '600' }}>Category</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#334155', fontWeight: '600' }}>Vacancy</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#334155', fontWeight: '600' }}>Deadline</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#334155', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', color: '#334155', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedJobs.length > 0 ? (
              paginatedJobs.map((job, index) => {
                const category = categories.find(c => c.id === job.categoryId);
                const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
                return (
                  <tr key={job.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 16px', color: '#1e293b' }}>{actualIndex}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div className="job-title-bn" style={{ color: '#1e293b', fontWeight: '600', marginBottom: '4px' }}>{job.title}</div>
                      <div className="job-title-en" style={{ color: '#64748b', fontSize: '0.875rem' }}>{job.titleEn}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#1e293b' }}>{job.organization}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="admin-badge admin-badge-category" style={{ backgroundColor: category?.color || '#eee', color: '#333', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                        {category ? category.name : 'Unknown'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#1e293b' }}>{job.vacancy}</td>
                    <td style={{ padding: '12px 16px', color: '#1e293b' }}>{job.deadline}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`admin-badge admin-badge-${job.status?.toLowerCase() || 'draft'}`}>
                        {job.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div className="admin-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button className="admin-btn-icon" style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }} onClick={() => handleToggleStatus(job)} title="Toggle Status">
                          {job.status === 'Active' ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                              <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                          )}
                        </button>
                        <button className="admin-btn-icon" style={{ background: 'transparent', border: 'none', color: '#1a56db', cursor: 'pointer' }} onClick={() => handleOpenModal(job)} title="Edit">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button className="admin-btn-icon admin-btn-danger" style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }} onClick={() => handleDeleteConfirm(job.id)} title="Delete">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="admin-table-empty" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No circulars found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', color: '#64748b' }}>
        <div className="admin-pagination-info">
          Showing {filteredJobs.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredJobs.length)} of {filteredJobs.length} circulars
        </div>
        <div className="admin-pagination-controls" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            className="admin-btn-pagination" 
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: currentPage === 1 ? '#cbd5e1' : '#1e293b', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: '500' }}
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Prev
          </button>
          <span className="admin-pagination-current" style={{ color: '#1e293b', fontWeight: '500' }}>Page {currentPage} of {totalPages}</span>
          <button 
            className="admin-btn-pagination" 
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: (currentPage === totalPages || totalPages === 0) ? '#cbd5e1' : '#1e293b', cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer', fontWeight: '500' }}
            disabled={currentPage === totalPages || totalPages === 0} 
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>

      {showModal && (
        <div className="admin-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
          <div className="admin-modal" style={{ backgroundColor: '#ffffff', borderRadius: '8px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div className="admin-modal-header" style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ color: '#1e293b', margin: 0, fontSize: '1.25rem' }}>{editingJob ? 'Edit Circular' : 'Add New Circular'}</h2>
              <button className="admin-btn-icon" style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }} onClick={handleCloseModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="admin-modal-content" style={{ padding: '20px' }}>
              <form onSubmit={handleSaveJob}>
                <div className="admin-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ display: 'block', marginBottom: '8px', color: '#334155', fontWeight: '500', fontSize: '0.875rem' }}>Title (Bengali)</label>
                    <input type="text" className="admin-form-input" style={{ width: '100%', padding: '10px', backgroundColor: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '6px', outline: 'none' }} name="title" value={formData.title} onChange={handleInputChange} required />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ display: 'block', marginBottom: '8px', color: '#334155', fontWeight: '500', fontSize: '0.875rem' }}>Title (English)</label>
                    <input type="text" className="admin-form-input" style={{ width: '100%', padding: '10px', backgroundColor: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '6px', outline: 'none' }} name="titleEn" value={formData.titleEn} onChange={handleInputChange} required />
                  </div>
                </div>

                <div className="admin-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ display: 'block', marginBottom: '8px', color: '#334155', fontWeight: '500', fontSize: '0.875rem' }}>Organization (Bengali)</label>
                    <input type="text" className="admin-form-input" style={{ width: '100%', padding: '10px', backgroundColor: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '6px', outline: 'none' }} name="organization" value={formData.organization} onChange={handleInputChange} required />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ display: 'block', marginBottom: '8px', color: '#334155', fontWeight: '500', fontSize: '0.875rem' }}>Organization (English)</label>
                    <input type="text" className="admin-form-input" style={{ width: '100%', padding: '10px', backgroundColor: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '6px', outline: 'none' }} name="organizationEn" value={formData.organizationEn} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="admin-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ display: 'block', marginBottom: '8px', color: '#334155', fontWeight: '500', fontSize: '0.875rem' }}>Category</label>
                    <select className="admin-form-input" style={{ width: '100%', padding: '10px', backgroundColor: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '6px', outline: 'none' }} name="categoryId" value={formData.categoryId} onChange={handleInputChange} required>
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ display: 'block', marginBottom: '8px', color: '#334155', fontWeight: '500', fontSize: '0.875rem' }}>Job Type</label>
                    <input type="text" className="admin-form-input" style={{ width: '100%', padding: '10px', backgroundColor: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '6px', outline: 'none' }} name="jobType" value={formData.jobType} onChange={handleInputChange} placeholder="e.g. সরকারি, ব্যাংক" />
                  </div>
                </div>

                <div className="admin-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ display: 'block', marginBottom: '8px', color: '#334155', fontWeight: '500', fontSize: '0.875rem' }}>Location</label>
                    <input type="text" className="admin-form-input" style={{ width: '100%', padding: '10px', backgroundColor: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '6px', outline: 'none' }} name="location" value={formData.location} onChange={handleInputChange} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ display: 'block', marginBottom: '8px', color: '#334155', fontWeight: '500', fontSize: '0.875rem' }}>Status</label>
                    <select className="admin-form-input" style={{ width: '100%', padding: '10px', backgroundColor: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '6px', outline: 'none' }} name="status" value={formData.status} onChange={handleInputChange} required>
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ display: 'block', marginBottom: '8px', color: '#334155', fontWeight: '500', fontSize: '0.875rem' }}>Vacancy</label>
                    <input type="number" className="admin-form-input" style={{ width: '100%', padding: '10px', backgroundColor: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '6px', outline: 'none' }} name="vacancy" value={formData.vacancy} onChange={handleInputChange} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ display: 'block', marginBottom: '8px', color: '#334155', fontWeight: '500', fontSize: '0.875rem' }}>Salary</label>
                    <input type="text" className="admin-form-input" style={{ width: '100%', padding: '10px', backgroundColor: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '6px', outline: 'none' }} name="salary" value={formData.salary} onChange={handleInputChange} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ display: 'block', marginBottom: '8px', color: '#334155', fontWeight: '500', fontSize: '0.875rem' }}>Deadline</label>
                    <input type="date" className="admin-form-input" style={{ width: '100%', padding: '10px', backgroundColor: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '6px', outline: 'none' }} name="deadline" value={formData.deadline} onChange={handleInputChange} required />
                  </div>
                </div>

                <div className="admin-form-group" style={{ marginBottom: '16px' }}>
                  <label className="admin-form-label" style={{ display: 'block', marginBottom: '8px', color: '#334155', fontWeight: '500', fontSize: '0.875rem' }}>Description</label>
                  <textarea className="admin-form-input" style={{ width: '100%', padding: '10px', backgroundColor: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '6px', resize: 'vertical', outline: 'none' }} name="description" rows="4" value={formData.description} onChange={handleInputChange}></textarea>
                </div>

                <div className="admin-form-group" style={{ marginBottom: '16px' }}>
                  <label className="admin-form-label" style={{ display: 'block', marginBottom: '8px', color: '#334155', fontWeight: '500', fontSize: '0.875rem' }}>Requirements (One per line)</label>
                  <textarea className="admin-form-input" style={{ width: '100%', padding: '10px', backgroundColor: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '6px', resize: 'vertical', outline: 'none' }} name="requirements" rows="4" value={formData.requirements} onChange={handleInputChange}></textarea>
                </div>

                <div className="admin-form-group" style={{ marginBottom: '16px' }}>
                  <label className="admin-form-label" style={{ display: 'block', marginBottom: '8px', color: '#334155', fontWeight: '500', fontSize: '0.875rem' }}>Apply Link</label>
                  <input type="url" className="admin-form-input" style={{ width: '100%', padding: '10px', backgroundColor: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '6px', outline: 'none' }} name="applyLink" value={formData.applyLink} onChange={handleInputChange} />
                </div>

                <div className="admin-form-group" style={{ marginBottom: '24px' }}>
                  <label className="admin-form-label" style={{ display: 'block', marginBottom: '8px', color: '#334155', fontWeight: '500', fontSize: '0.875rem' }}>Circular Images (Comma-separated URLs)</label>
                  <input type="text" className="admin-form-input" style={{ width: '100%', padding: '10px', backgroundColor: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '6px', outline: 'none' }} name="images" value={formData.images} onChange={handleInputChange} />
                </div>

                <div className="admin-modal-footer" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" className="admin-btn" style={{ padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }} onClick={handleCloseModal}>Cancel</button>
                  <button type="submit" className="admin-btn admin-btn-primary" style={{ padding: '10px 20px', backgroundColor: '#1a56db', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Save Circular</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="admin-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
          <div className="admin-modal" style={{ maxWidth: '400px', width: '100%', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div className="admin-modal-header" style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ color: '#1e293b', margin: 0, fontSize: '1.25rem' }}>Confirm Delete</h2>
              <button className="admin-btn-icon" style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }} onClick={() => setShowDeleteConfirm(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="admin-modal-content" style={{ padding: '20px', color: '#334155' }}>
              <p>Are you sure you want to delete this circular?</p>
            </div>
            <div className="admin-modal-footer" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="admin-btn" style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="admin-btn admin-btn-danger" style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }} onClick={executeDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
