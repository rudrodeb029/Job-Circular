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

  return (
    <div className="admin-page">
      {toast.show && (
        <div className={`admin-toast admin-toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className="admin-header">
        <h1>Manage Circulars</h1>
        <button className="admin-btn admin-btn-primary" onClick={() => handleOpenModal()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add New Circular
        </button>
      </div>

      <div className="admin-filters">
        <div className="admin-search-wrapper">
          <svg className="admin-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            className="admin-search" 
            placeholder="Search title or organization..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="admin-filter-buttons">
          <button className={`admin-btn-filter ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>All</button>
          <button className={`admin-btn-filter ${statusFilter === 'active' ? 'active' : ''}`} onClick={() => setStatusFilter('active')}>Active</button>
          <button className={`admin-btn-filter ${statusFilter === 'draft' ? 'active' : ''}`} onClick={() => setStatusFilter('draft')}>Draft</button>
          <button className={`admin-btn-filter ${statusFilter === 'expired' ? 'active' : ''}`} onClick={() => setStatusFilter('expired')}>Expired</button>
        </div>

        <select 
          className="admin-select-filter" 
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Organization</th>
              <th>Category</th>
              <th>Vacancy</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedJobs.length > 0 ? (
              paginatedJobs.map((job, index) => {
                const category = categories.find(c => c.id === job.categoryId);
                const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
                return (
                  <tr key={job.id}>
                    <td>{actualIndex}</td>
                    <td>
                      <div className="job-title-bn">{job.title}</div>
                      <div className="job-title-en">{job.titleEn}</div>
                    </td>
                    <td>{job.organization}</td>
                    <td>
                      <span className="admin-badge admin-badge-category" style={{ backgroundColor: category?.color || '#eee', color: '#333' }}>
                        {category ? category.name : 'Unknown'}
                      </span>
                    </td>
                    <td>{job.vacancy}</td>
                    <td>{job.deadline}</td>
                    <td>
                      <span className={`admin-badge admin-badge-${job.status?.toLowerCase() || 'draft'}`}>
                        {job.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-btn-icon" onClick={() => handleToggleStatus(job)} title="Toggle Status">
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
                        <button className="admin-btn-icon" onClick={() => handleOpenModal(job)} title="Edit">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button className="admin-btn-icon admin-btn-danger" onClick={() => handleDeleteConfirm(job.id)} title="Delete">
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
                <td colSpan="8" className="admin-table-empty">No circulars found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination-wrapper">
        <div className="admin-pagination-info">
          Showing {filteredJobs.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredJobs.length)} of {filteredJobs.length} circulars
        </div>
        <div className="admin-pagination-controls">
          <button 
            className="admin-btn-pagination" 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Prev
          </button>
          <span className="admin-pagination-current">Page {currentPage} of {totalPages}</span>
          <button 
            className="admin-btn-pagination" 
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
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>{editingJob ? 'Edit Circular' : 'Add New Circular'}</h2>
              <button className="admin-btn-icon" onClick={handleCloseModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="admin-modal-content">
              <form onSubmit={handleSaveJob}>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Title (Bengali)</label>
                    <input type="text" className="admin-form-input" name="title" value={formData.title} onChange={handleInputChange} required />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Title (English)</label>
                    <input type="text" className="admin-form-input" name="titleEn" value={formData.titleEn} onChange={handleInputChange} required />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Organization (Bengali)</label>
                    <input type="text" className="admin-form-input" name="organization" value={formData.organization} onChange={handleInputChange} required />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Organization (English)</label>
                    <input type="text" className="admin-form-input" name="organizationEn" value={formData.organizationEn} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Category</label>
                    <select className="admin-form-input" name="categoryId" value={formData.categoryId} onChange={handleInputChange} required>
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Job Type</label>
                    <input type="text" className="admin-form-input" name="jobType" value={formData.jobType} onChange={handleInputChange} placeholder="e.g. সরকারি, ব্যাংক" />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Location</label>
                    <input type="text" className="admin-form-input" name="location" value={formData.location} onChange={handleInputChange} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Status</label>
                    <select className="admin-form-input" name="status" value={formData.status} onChange={handleInputChange} required>
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Vacancy</label>
                    <input type="number" className="admin-form-input" name="vacancy" value={formData.vacancy} onChange={handleInputChange} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Salary</label>
                    <input type="text" className="admin-form-input" name="salary" value={formData.salary} onChange={handleInputChange} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Deadline</label>
                    <input type="date" className="admin-form-input" name="deadline" value={formData.deadline} onChange={handleInputChange} required />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Description</label>
                  <textarea className="admin-form-input" name="description" rows="4" value={formData.description} onChange={handleInputChange}></textarea>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Requirements (One per line)</label>
                  <textarea className="admin-form-input" name="requirements" rows="4" value={formData.requirements} onChange={handleInputChange}></textarea>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Apply Link</label>
                  <input type="url" className="admin-form-input" name="applyLink" value={formData.applyLink} onChange={handleInputChange} />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Circular Images (Comma-separated URLs)</label>
                  <input type="text" className="admin-form-input" name="images" value={formData.images} onChange={handleInputChange} />
                </div>

                <div className="admin-modal-footer">
                  <button type="button" className="admin-btn" onClick={handleCloseModal}>Cancel</button>
                  <button type="submit" className="admin-btn admin-btn-primary">Save Circular</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '400px' }}>
            <div className="admin-modal-header">
              <h2>Confirm Delete</h2>
              <button className="admin-btn-icon" onClick={() => setShowDeleteConfirm(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="admin-modal-content">
              <p>Are you sure you want to delete this circular?</p>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="admin-btn admin-btn-danger" onClick={executeDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
