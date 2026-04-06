import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../../config/api.js';

const DoctorVideoUpload = ({ doctorId }) => {
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  
  const fetchVideos = async () => {
    try {
      const res = await fetch(buildApiUrl(`/api/doctors/${doctorId}/videos`));
      const data = await res.json();
      if (data.success) setVideos(data.videos);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { if (doctorId) fetchVideos(); }, [doctorId]);

  const showMsg = (type, msg) => {
    if (type === 'error') setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 4000);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!videoFile || !title.trim()) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('title', title.trim());
      formData.append('description', description);

      const res = await fetch(buildApiUrl('/api/doctors/videos'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setTitle(''); setDescription(''); setVideoFile(null);
        e.target.reset();
        fetchVideos();
        showMsg('success', 'Video uploaded successfully!');
      } else {
        showMsg('error', data.message || 'Upload failed');
      }
    } catch {
      showMsg('error', 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm('Delete this video?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(buildApiUrl(`/api/doctors/videos/${videoId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) { fetchVideos(); showMsg('success', 'Video deleted.'); }
      else showMsg('error', data.message || 'Delete failed');
    } catch { showMsg('error', 'Delete failed.'); }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-[#A3B18A] to-[#8FA076] px-6 py-4">
        <div className="flex items-center space-x-3">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-white">Educational Videos</h3>
        </div>
        <p className="text-white/70 text-sm mt-1">Upload videos explaining symptoms and solutions for patients</p>
      </div>

      <div className="p-6 space-y-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video Title <span className="text-red-500">*</span></label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Understanding Anxiety Symptoms"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              placeholder="Brief description of what this video covers..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video File <span className="text-red-500">*</span></label>
            <input type="file" accept="video/mp4,video/mov,video/avi,video/webm,video/mkv"
              onChange={e => setVideoFile(e.target.files[0])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#DCE4D4] file:text-[#A3B18A] file:font-medium hover:file:bg-[#A3B18A] hover:file:text-white" required />
            <p className="text-xs text-gray-400 mt-1">MP4, MOV, AVI, WebM — max 100MB</p>
          </div>
          <button type="submit" disabled={uploading || !title.trim() || !videoFile}
            className="w-full py-2.5 bg-[#A3B18A] hover:bg-[#8FA076] text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {uploading ? (
              <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Uploading...</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg> Upload Video</>
            )}
          </button>
        </form>

        {videos.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Uploaded Videos ({videos.length})</h4>
            <div className="space-y-3">
              {videos.map(v => (
                <div key={v.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{v.title}</p>
                      {v.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{v.description}</p>}
                      <p className="text-xs text-gray-400 mt-1">{new Date(v.created_at).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => handleDelete(v.id)} className="text-red-500 hover:text-red-700 p-1 flex-shrink-0" title="Delete video">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <video src={`http://localhost:5002/${v.video_path}`} controls className="w-full mt-3 rounded-lg max-h-48 bg-black" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorVideoUpload;
