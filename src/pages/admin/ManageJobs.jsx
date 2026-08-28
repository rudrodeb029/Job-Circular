import React, { useState, useMemo, useEffect } from 'react';
import { useAdminContext } from '../../context/AdminContext';
import { categories } from '../../data/categories';
import { triggerLocalNotification } from '../../utils/notifications';
import { CLOUDINARY_CONFIG } from '../../cloudinary';
import { optimizeCloudinaryUrl } from '../../utils/cloudinaryUtils';
import { normalizeMediaUrl, getGoogleDriveFileId } from '../../utils/mediaUtils';

export default function ManageJobs() {
  const { state, dispatch } = useAdminContext();
  const jobs = state.jobs || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const [showForm, setShowForm] = useState(false);
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
    images: '',
    examDate: '',
    examResult: '',
    showInExamDate: false,
    showInResult: false,
    linkedCircularId: '',
    shouldNotify: true
  };

  const [formData, setFormData] = useState(initialFormState);

  const [uploadProgress, setUploadProgress] = useState('');
  const [resultUploadProgress, setResultUploadProgress] = useState('');

  const handleResultCloudinaryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const cloudName = CLOUDINARY_CONFIG.cloudName;
    const uploadPreset = CLOUDINARY_CONFIG.uploadPreset;

    if (!cloudName || !uploadPreset || cloudName === 'dqy39gghx') {
      showToast('Cloudinary is not connected yet!', 'error');
      return;
    }

    const uploadedUrls = [];
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setResultUploadProgress(files.length === 1 ? 'Uploading...' : `Uploading ${i + 1} of ${files.length}...`);

      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', uploadPreset);

      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
          method: 'POST',
          body: data
        });
        const fileData = await res.json();
        if (fileData.secure_url) {
          const optimizedUrl = optimizeCloudinaryUrl(fileData.secure_url);
          uploadedUrls.push(optimizedUrl);
          successCount++;
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (uploadedUrls.length > 0) {
      setFormData(prev => {
        const currentUrls = prev.examResult ? prev.examResult.split(',').map(url => url.trim()).filter(url => url) : [];
        const mergedUrls = Array.from(new Set([...currentUrls, ...uploadedUrls]));
        return {
          ...prev,
          examResult: mergedUrls.join(', ')
        };
      });
      showToast(`Successfully uploaded ${successCount} result notice file(s)!`);
    }

    setResultUploadProgress('');
    e.target.value = '';
  };

  const handleCloudinaryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const cloudName = CLOUDINARY_CONFIG.cloudName;
    const uploadPreset = CLOUDINARY_CONFIG.uploadPreset;

    if (!cloudName || !uploadPreset || cloudName === 'dqy39gghx') {
      showToast('Cloudinary is not connected yet!', 'error');
      return;
    }

    const uploadedUrls = [];
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(files.length === 1 ? 'Uploading...' : `Uploading ${i + 1} of ${files.length}...`);

      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', uploadPreset);

      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
          method: 'POST',
          body: data
        });
        const fileData = await res.json();
        if (fileData.secure_url) {
          const optimizedUrl = optimizeCloudinaryUrl(fileData.secure_url);
          uploadedUrls.push(optimizedUrl);
          successCount++;
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (uploadedUrls.length > 0) {
      setFormData(prev => {
        const currentImages = prev.images ? prev.images.split(',').map(img => img.trim()).filter(img => img) : [];
        const mergedImages = Array.from(new Set([...currentImages, ...uploadedUrls]));
        return {
          ...prev,
          images: mergedImages.join(', ')
        };
      });
      showToast(`Successfully uploaded ${successCount} file(s)!`);
    }

    setUploadProgress('');
    e.target.value = '';
  };

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

  const handleOpenForm = (job = null) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        ...job,
        showInExamDate: job.showInExamDate ?? !!job.examDate,
        showInResult: job.showInResult ?? !!job.examResult,
        linkedCircularId: job.linkedCircularId || '',
        requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : (job.requirements || ''),
        images: Array.isArray(job.images) ? job.images.join(', ') : (job.images || '')
      });
    } else {
      setEditingJob(null);
      setFormData(initialFormState);
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
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
      
    const finalExamDate = formData.showInExamDate ? formData.examDate : '';
    const finalExamResult = formData.showInResult ? (formData.examResult || (imgArray.length > 0 ? imgArray[0] : '')) : '';

    const targetId = editingJob 
      ? editingJob.id 
      : (formData.linkedCircularId ? formData.linkedCircularId : `job_${Date.now()}`);

    const jobTitle = formData.organization || 'নিয়োগ বিজ্ঞপ্তি';
    const jobData = {
      ...formData,
      id: targetId,
      title: jobTitle,
      titleEn: formData.organizationEn || jobTitle,
      examDate: finalExamDate,
      examResult: finalExamResult,
      requirements: reqArray,
      images: imgArray,
      createdAt: editingJob ? (editingJob.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      postedAt: editingJob
        ? editingJob.postedAt 
        : (jobs.find(j => j.id === formData.linkedCircularId)?.postedAt || new Date().toISOString().split('T')[0])
    };

    if (editingJob || formData.linkedCircularId) {
      dispatch({ type: 'UPDATE_JOB', payload: jobData });
      dispatch({ 
        type: 'ADD_ACTIVITY', 
        payload: { id: `act_${Date.now()}`, type: 'update', text: `Updated ${jobData.title}`, time: 'Just now' }
      });
      showToast('Circular updated successfully!');
    } else {
      dispatch({ type: 'ADD_JOB', payload: jobData });
      dispatch({ 
        type: 'ADD_ACTIVITY', 
        payload: { id: `act_${Date.now()}`, type: 'add', text: `Added new circular: ${jobData.title}`, time: 'Just now' }
      });
      showToast('New circular added successfully!');
    }

    // --- AUTO SYNC TO ADMITS COLLECTION ---
    if (formData.showInExamDate) {
      const admitId = `admit-${targetId}`;
      const admitData = {
        id: admitId,
        jobId: targetId,
        examName: `${formData.organization} পরীক্ষার তারিখ`,
        examNameEn: `${formData.organizationEn || formData.organization} Exam Date`,
        organization: formData.organization,
        organizationEn: formData.organizationEn || formData.organization,
        category: formData.categoryId,
        type: 'admit_card',
        status: 'পরীক্ষার তারিখ প্রকাশিত',
        statusEn: 'Exam Date Published',
        date: finalExamDate || 'শীঘ্রই আসছে',
        dateEn: formData.examDateEn || finalExamDate || 'Coming Soon',
        jobType: formData.jobType,
        downloadLink: formData.applyLink || '#',
        createdAt: jobData.createdAt
      };
      dispatch({ type: 'UPDATE_ADMIT', payload: admitData });
    } else {
      dispatch({ type: 'DELETE_ADMIT', payload: `admit-${targetId}` });
    }

    if (formData.showInResult) {
      const resultId = `result-${targetId}`;
      const resultData = {
        id: resultId,
        jobId: targetId,
        examName: `${formData.organization} পরীক্ষার ফলাফল`,
        examNameEn: `${formData.organizationEn || formData.organization} Exam Result`,
        organization: formData.organization,
        organizationEn: formData.organizationEn || formData.organization,
        category: formData.categoryId,
        type: 'result',
        status: 'ফলাফল প্রকাশিত',
        statusEn: 'Result Published',
        date: jobData.postedAt || new Date().toISOString().split('T')[0],
        dateEn: jobData.postedAt || 'Recently',
        jobType: formData.jobType,
        downloadLink: finalExamResult || formData.applyLink || '#',
        createdAt: jobData.createdAt
      };
      dispatch({ type: 'UPDATE_ADMIT', payload: resultData });
    } else {
       dispatch({ type: 'DELETE_ADMIT', payload: `result-${targetId}` });
    }

    handleCloseForm();
  };

  const executeDelete = () => {
    if (deletingJobId) {
      const jobToDelete = jobs.find(j => j.id === deletingJobId);
      dispatch({ type: 'DELETE_JOB', payload: deletingJobId });
      dispatch({ 
        type: 'ADD_ACTIVITY', 
        payload: { id: `act_${Date.now()}`, type: 'delete', text: `Deleted circular: ${jobToDelete?.title}`, time: 'Just now' }
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
    <div className="manage-jobs-page animate-fade-in">
      <style>{`
        .admin-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        .admin-table th {
          background: #f8fafc;
          color: #64748b;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.05em;
          padding: 16px;
        }
        .admin-table td {
          padding: 16px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 14px;
        }
        .status-pill {
          padding: 4px 12px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }
        .action-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          alignItems: center;
          justifyContent: center;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }
        .action-btn:hover {
          transform: translateY(-2px);
        }
        .modal-overlay {
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          position: fixed;
          inset: 0;
          z-index: 3000;
          display: flex;
          alignItems: center;
          justifyContent: center;
        }
        .input-group label { display: block; font-size: 13px; font-weight: 700; color: #475569; marginBottom: 8px; }
        .modern-input { width: 100%; padding: 12px 14px; border: 1.5px solid #e2e8f0; borderRadius: 10px; outline: none; transition: border-color 0.2s; }
        .modern-input:focus { border-color: #2563eb; }
      `}</style>

      {toast.show && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 4000, background: toast.type === 'success' ? '#10b981' : '#ef4444', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', animation: 'slideInRight 0.3s ease' }}>
          {toast.message}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '2.5rem' }}>
        <button
          onClick={() => showForm ? handleCloseForm() : handleOpenForm()}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', background: showForm ? '#f1f5f9' : 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)', color: showForm ? '#475569' : 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: 700, boxShadow: showForm ? 'none' : '0 8px 16px rgba(37, 99, 235, 0.2)', transition: 'all 0.2s ease' }}
        >
          {showForm ? 'View All Circulars' : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add Circular
            </>
          )}
        </button>
      </div>

      {showForm ? (
        <div className="admin-card animate-fade-in" style={{ padding: '40px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{editingJob ? 'Edit Circular' : 'New Circular'}</h2>
          </div>

          <form onSubmit={handleSaveJob} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            <div className="input-group">
               <label>Organization (Bengali)</label>
               <input name="organization" className="modern-input" value={formData.organization} onChange={handleInputChange} required placeholder="যেমন: বাংলাদেশ সেনাবাহিনী" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="input-group">
                 <label>Category</label>
                 <select name="categoryId" className="modern-input" value={formData.categoryId} onChange={handleInputChange} required>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
              </div>
              <div className="input-group">
                 <label>Job Type</label>
                 <input name="jobType" className="modern-input" value={formData.jobType} onChange={handleInputChange} placeholder="e.g. সরকারি, ব্যাংক" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
              <div className="input-group">
                 <label>Location</label>
                 <input name="location" className="modern-input" value={formData.location} onChange={handleInputChange} />
              </div>
              <div className="input-group">
                 <label>Vacancy</label>
                 <input type="number" name="vacancy" className="modern-input" value={formData.vacancy} onChange={handleInputChange} />
              </div>
              <div className="input-group">
                 <label>Deadline</label>
                 <input type="date" name="deadline" className="modern-input" value={formData.deadline} onChange={handleInputChange} required />
              </div>
            </div>

            <div style={{ gridColumn: 'span 2' }} className="input-group">
               <label>Description</label>
               <textarea name="description" rows="4" className="modern-input" value={formData.description} onChange={handleInputChange} style={{ resize: 'vertical' }}></textarea>
            </div>

            <div style={{ gridColumn: 'span 2' }} className="input-group">
               <label>Requirements (One per line)</label>
               <textarea name="requirements" rows="4" className="modern-input" value={formData.requirements} onChange={handleInputChange} style={{ resize: 'vertical' }}></textarea>
            </div>

            <div style={{ gridColumn: 'span 2' }} className="input-group">
               <label>Apply Link</label>
               <input type="url" name="applyLink" className="modern-input" value={formData.applyLink} onChange={handleInputChange} />
            </div>

            <div style={{ gridColumn: 'span 2' }} className="input-group">
              <label>Circular Images / PDF (URLs)</label>
              <input name="images" className="modern-input" value={formData.images} onChange={handleInputChange} style={{ marginBottom: '12px' }} placeholder="Comma-separated image/PDF URLs or upload below" />

              <div style={{ background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <input type="file" multiple accept="image/*,application/pdf" onChange={handleCloudinaryUpload} disabled={!!uploadProgress} style={{ fontSize: '13px' }} />
                {uploadProgress && <span style={{ fontSize: '13px', color: '#1a56db', fontWeight: 'bold' }}>{uploadProgress}</span>}
              </div>

              {formData.images && (
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
                  {Array.from(new Set(formData.images.split(',').map(i => i.trim()).filter(i => i))).map((rawFileUrl, index) => {
                    const displayUrl = normalizeMediaUrl(rawFileUrl);
                    const driveId = getGoogleDriveFileId(rawFileUrl);
                    const isPdf = rawFileUrl.toLowerCase().includes('.pdf');
                    return (
                      <div key={index} style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '12px', border: '1.5px solid #cbd5e1', overflow: 'hidden', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                        {isPdf ? (
                          <a href={displayUrl} target="_blank" rel="noopener noreferrer" style={{ textAlign: 'center', padding: '6px', color: '#ef4444', textDecoration: 'none', fontSize: '11px', fontWeight: 800 }}>
                            📄 PDF Doc
                          </a>
                        ) : (
                          <a href={displayUrl} target="_blank" rel="noopener noreferrer" style={{ width: '100%', height: '100%', display: 'block' }}>
                            <img
                              src={displayUrl}
                              alt="Circular Preview"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                if (driveId && !e.target.dataset.triedFallback) {
                                  e.target.dataset.triedFallback = 'true';
                                  e.target.src = `https://drive.google.com/thumbnail?id=${driveId}&sz=w800`;
                                }
                              }}
                            />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const current = formData.images.split(',').map(i => i.trim()).filter(i => i);
                            current.splice(index, 1);
                            setFormData(prev => ({ ...prev, images: current.join(', ') }));
                          }}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            zIndex: 10
                          }}
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '24px', padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
               <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                 <input type="checkbox" checked={!!formData.showInExamDate} onChange={e => setFormData(prev => ({ ...prev, showInExamDate: e.target.checked }))} style={{ width: '18px', height: '18px' }} />
                 Exam Date
               </label>
               <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                 <input type="checkbox" checked={!!formData.showInResult} onChange={e => setFormData(prev => ({ ...prev, showInResult: e.target.checked }))} style={{ width: '18px', height: '18px' }} />
                 Result
               </label>
               <div style={{ width: '2px', height: '20px', background: '#e2e8f0', margin: '0 8px' }}></div>
               <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, color: '#1a56db', cursor: 'pointer' }}>
                 <input type="checkbox" checked={!!formData.shouldNotify} onChange={e => setFormData(prev => ({ ...prev, shouldNotify: e.target.checked }))} style={{ width: '18px', height: '18px' }} />
                 Send Push Notification
               </label>
            </div>

            {formData.showInExamDate && (
              <div style={{ gridColumn: 'span 2' }} className="input-group">
                 <label>Exam Date Information (পরীক্ষার তারিখ)</label>
                 <input name="examDate" className="modern-input" value={formData.examDate || ''} onChange={handleInputChange} placeholder="e.g. 15 June 2024 / ১৫ জুন ২০২৪" />
              </div>
            )}

            {formData.showInResult && (
              <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="input-group">
                   <label>Exam Date (পরীক্ষার তারিখ)</label>
                   <input name="examDate" className="modern-input" value={formData.examDate || ''} onChange={handleInputChange} placeholder="e.g. 15 June 2024 / ১৫ জুন ২০২৪" />
                </div>

                <div className="input-group">
                  <label>Result Notice Images / PDF (URLs)</label>
                  <input name="examResult" className="modern-input" value={formData.examResult || ''} onChange={handleInputChange} style={{ marginBottom: '12px' }} placeholder="Comma-separated image/PDF URLs or upload below" />

                  <div style={{ background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <input type="file" multiple accept="image/*,application/pdf" onChange={handleResultCloudinaryUpload} disabled={!!resultUploadProgress} style={{ fontSize: '13px' }} />
                    {resultUploadProgress && <span style={{ fontSize: '13px', color: '#1a56db', fontWeight: 'bold' }}>{resultUploadProgress}</span>}
                  </div>

                  {formData.examResult && (
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
                      {Array.from(new Set(formData.examResult.split(',').map(i => i.trim()).filter(i => i))).map((rawFileUrl, index) => {
                        const displayUrl = normalizeMediaUrl(rawFileUrl);
                        const driveId = getGoogleDriveFileId(rawFileUrl);
                        const isPdf = rawFileUrl.toLowerCase().includes('.pdf');
                        return (
                          <div key={index} style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '12px', border: '1.5px solid #cbd5e1', overflow: 'hidden', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                            {isPdf ? (
                              <a href={displayUrl} target="_blank" rel="noopener noreferrer" style={{ textAlign: 'center', padding: '6px', color: '#ef4444', textDecoration: 'none', fontSize: '11px', fontWeight: 800 }}>
                                📄 PDF Doc
                              </a>
                            ) : (
                              <a href={displayUrl} target="_blank" rel="noopener noreferrer" style={{ width: '100%', height: '100%', display: 'block' }}>
                                <img
                                  src={displayUrl}
                                  alt="Result Preview"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => {
                                    if (driveId && !e.target.dataset.triedFallback) {
                                      e.target.dataset.triedFallback = 'true';
                                      e.target.src = `https://drive.google.com/thumbnail?id=${driveId}&sz=w800`;
                                    }
                                  }}
                                />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const current = formData.examResult.split(',').map(i => i.trim()).filter(i => i);
                                current.splice(index, 1);
                                setFormData(prev => ({ ...prev, examResult: current.join(', ') }));
                              }}
                              style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                zIndex: 10
                              }}
                              title="Remove item"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{ gridColumn: 'span 2', marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
              <button type="button" onClick={handleCloseForm} style={{ padding: '14px 32px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 700, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '14px 32px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)', color: 'white', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)' }}>Save Circular</button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="admin-card" style={{ padding: '24px', marginBottom: '2rem', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
              <svg style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input
                type="text"
                placeholder="Search by title or organization..."
                style={{ width: '100%', padding: '14px 14px 14px 48px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', background: '#f8fafc', padding: '6px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              {['all', 'active', 'expired'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{ padding: '8px 20px', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 700, textTransform: 'capitalize', cursor: 'pointer', background: statusFilter === s ? '#ffffff' : 'transparent', color: statusFilter === s ? '#1a56db' : '#64748b', boxShadow: statusFilter === s ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
                >
                  {s}
                </button>
              ))}
            </div>

            <select
              style={{ padding: '14px 20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#1e293b', outline: 'none' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>

          <div className="admin-card" style={{ overflow: 'hidden' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Job Information</th>
                  <th>Category</th>
                  <th>Vacancy</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedJobs.map((job, idx) => {
                  const cat = categories.find(c => c.id === job.categoryId);
                  return (
                    <tr key={job.id}>
                      <td style={{ color: '#94a3b8', fontWeight: 600 }}>{(currentPage-1)*itemsPerPage + idx + 1}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>{job.title}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{job.organization}</div>
                      </td>
                      <td>
                        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: `${cat?.textColor}15`, color: cat?.textColor }}>
                          {cat?.name || 'Unknown'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: '#475569' }}>{job.vacancy || 'N/A'}</td>
                      <td style={{ fontWeight: 600, color: '#475569' }}>{job.deadline}</td>
                      <td>
                        <span className="status-pill" style={{
                          background: job.status === 'Active' ? '#d1fae5' : '#fee2e2',
                          color: job.status === 'Active' ? '#065f46' : '#991b1b'
                        }}>
                          {job.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button className="action-btn" style={{ background: '#eff6ff', color: '#1a56db' }} onClick={() => handleOpenForm(job)} title="Edit">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          </button>
                          <button className="action-btn" style={{ background: '#fef2f2', color: '#ef4444' }} onClick={() => { setDeletingJobId(job.id); setShowDeleteConfirm(true); }} title="Delete">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginatedJobs.length === 0 && (
                  <tr><td colSpan="7" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontSize: '15px' }}>No circulars found matching your criteria.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', padding: '0 24px 24px' }}>
             <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Showing {paginatedJobs.length} of {filteredJobs.length} circulars</p>
             <div style={{ display: 'flex', gap: '10px' }}>
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p-1)} style={{ padding: '10px 20px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}>Previous</button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p+1)} style={{ padding: '10px 20px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}>Next</button>
             </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal (Keep as Modal as it's a small confirmation) */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="admin-card animate-fade-in" style={{ padding: '32px', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', background: '#fee2e2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '24px' }}>🗑️</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Confirm Delete</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>Are you sure you want to permanently delete this circular? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
               <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 700, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
               <button onClick={executeDelete} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
