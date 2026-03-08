// =============================================
// LexDoc AI — Supabase Data Layer
// Replaces mockData.js with live Supabase queries
// =============================================
import { supabase } from './supabase';

// ---- Fetch Functions ----

export async function fetchDepartments() {
    const { data, error } = await supabase.from('departments').select('*').order('id');
    if (error) { console.error('fetchDepartments:', error); return []; }
    return data;
}

export async function fetchRoles() {
    const { data, error } = await supabase.from('roles').select('*').order('access_level', { ascending: false });
    if (error) { console.error('fetchRoles:', error); return []; }
    return data;
}

export async function fetchTags() {
    const { data, error } = await supabase.from('tags').select('*').order('weight', { ascending: false });
    if (error) { console.error('fetchTags:', error); return []; }
    return data;
}

export async function fetchDocuments() {
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('uploaded_at', { ascending: false });
    if (error) { console.error('fetchDocuments:', error); return []; }

    // For each document, fetch its tag_ids and dept_ids
    const enriched = await Promise.all(data.map(async (doc) => {
        const [tagRes, deptRes] = await Promise.all([
            supabase.from('document_tags').select('tag_id').eq('doc_id', doc.id),
            supabase.from('document_departments').select('dept_id').eq('doc_id', doc.id),
        ]);
        return {
            ...doc,
            tag_ids: (tagRes.data || []).map(r => r.tag_id),
            dept_ids: (deptRes.data || []).map(r => r.dept_id),
        };
    }));
    return enriched;
}

export async function fetchDocumentById(id) {
    const { data, error } = await supabase.from('documents').select('*').eq('id', id).single();
    if (error) { console.error('fetchDocumentById:', error); return null; }

    const [tagRes, deptRes] = await Promise.all([
        supabase.from('document_tags').select('tag_id').eq('doc_id', id),
        supabase.from('document_departments').select('dept_id').eq('doc_id', id),
    ]);
    return {
        ...data,
        tag_ids: (tagRes.data || []).map(r => r.tag_id),
        dept_ids: (deptRes.data || []).map(r => r.dept_id),
    };
}

export async function fetchSummaries() {
    const { data, error } = await supabase.from('summaries').select('*').order('created_at', { ascending: false });
    if (error) { console.error('fetchSummaries:', error); return []; }
    return data;
}

export async function fetchSummaryByDocId(docId) {
    const { data, error } = await supabase
        .from('summaries')
        .select('*')
        .eq('doc_id', docId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
    if (error) { console.error('fetchSummaryByDocId:', error); return null; }
    return data;
}

export async function fetchEvents() {
    const { data, error } = await supabase.from('events').select('*').order('event_date');
    if (error) { console.error('fetchEvents:', error); return []; }
    return data;
}

export async function fetchEventsByDocId(docId) {
    const { data, error } = await supabase.from('events').select('*').eq('doc_id', docId).order('event_date');
    if (error) { console.error('fetchEventsByDocId:', error); return []; }
    return data;
}

export async function fetchNotifications(userId) {
    const { data, error } = await supabase
        .from('notifications')
        .select('*, events(*)')
        .eq('user_id', userId)
        .order('notify_at', { ascending: false });
    if (error) { console.error('fetchNotifications:', error); return []; }
    return data;
}

export async function fetchUsers() {
    const { data, error } = await supabase.from('users').select('*').order('id');
    if (error) { console.error('fetchUsers:', error); return []; }
    return data;
}

export async function fetchAuditLogs() {
    const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });
    if (error) { console.error('fetchAuditLogs:', error); return []; }
    return data;
}

// ---- Upload Functions ----

export async function uploadDocument(file, { title, deptId, tagIds, isGeneral, uploaderId }) {
    // 1. Upload file to Supabase Storage
    const filePath = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const { error: storageError } = await supabase.storage
        .from('docs')
        .upload(filePath, file);
    if (storageError) {
        console.error('Storage upload error:', storageError);
        throw storageError;
    }

    // 2. Insert document metadata
    const { data: doc, error: docError } = await supabase
        .from('documents')
        .insert({
            title,
            storage_bucket: 'docs',
            storage_path: filePath,
            file_size: file.size,
            mime_type: file.type,
            processing_status: 'uploaded',
            is_general: isGeneral,
            uploader_id: uploaderId,
        })
        .select()
        .single();
    if (docError) { console.error('Document insert error:', docError); throw docError; }

    // 3. Insert department access (if not general)
    if (!isGeneral && deptId) {
        await supabase.from('document_departments').insert({ doc_id: doc.id, dept_id: Number(deptId) });
    }

    // 4. Insert tags
    if (tagIds && tagIds.length > 0) {
        const tagRows = tagIds.map(tag_id => ({ doc_id: doc.id, tag_id }));
        await supabase.from('document_tags').insert(tagRows);
    }

    // 5. Log the upload in audit_logs
    await supabase.from('audit_logs').insert({
        user_id: uploaderId,
        doc_id: doc.id,
        action: 'UPLOAD',
        details: `Uploaded ${title}`,
    });

    return doc;
}

// ---- Helper Functions (kept from mockData.js) ----

export const getTagColor = (tag) => {
    if (tag.type === 'PRIORITY') return tag.color;
    return 'var(--color-text-secondary)';
};

export const sortTagsByPriority = (tagList) => {
    return [...tagList].sort((left, right) => {
        if (left.type === right.type) return right.weight - left.weight;
        return left.type === 'PRIORITY' ? -1 : 1;
    });
};

export const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes >= 1000000) return (bytes / 1000000).toFixed(1) + ' MB';
    if (bytes >= 1000) return (bytes / 1000).toFixed(0) + ' KB';
    return bytes + ' B';
};

export const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
};

export const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

export const getDaysUntil = (dateStr) => {
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
