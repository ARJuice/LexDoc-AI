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
        .or('expiry_date.is.null,expiry_date.gt.' + new Date().toISOString())
        .order('uploaded_at', { ascending: false });
    if (error) { console.error('fetchDocuments:', error); return []; }
    if (!data || data.length === 0) return [];

    // Batch fetch all tag and dept associations (avoids N+1)
    const docIds = data.map(d => d.id);
    const [tagRes, deptRes] = await Promise.all([
        supabase.from('document_tags').select('doc_id, tag_id').in('doc_id', docIds),
        supabase.from('document_departments').select('doc_id, dept_id').in('doc_id', docIds),
    ]);

    // Build lookup maps
    const tagMap = {};
    const deptMap = {};
    (tagRes.data || []).forEach(r => {
        if (!tagMap[r.doc_id]) tagMap[r.doc_id] = [];
        tagMap[r.doc_id].push(r.tag_id);
    });
    (deptRes.data || []).forEach(r => {
        if (!deptMap[r.doc_id]) deptMap[r.doc_id] = [];
        deptMap[r.doc_id].push(r.dept_id);
    });

    return data.map(doc => ({
        ...doc,
        tag_ids: tagMap[doc.id] || [],
        dept_ids: deptMap[doc.id] || [],
    }));
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

export async function uploadDocument(file, { title, deptId, tagIds, customTags = [], isGeneral, uploaderId, accessLevel = 'PUBLIC', expiryDate = null }) {
    // 1. Upload file to Supabase Storage
    const filePath = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const { error: storageError } = await supabase.storage
        .from('docs')
        .upload(filePath, file);
    if (storageError) {
        console.error('Storage upload error:', storageError);
        throw storageError;
    }

    // STAFF-level docs are also general (visible to all staff, no dept restriction)
    const effectiveIsGeneral = isGeneral || accessLevel === 'PUBLIC' || accessLevel === 'STAFF';

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
            is_general: effectiveIsGeneral,
            access_level: accessLevel,
            expiry_date: expiryDate,
            uploader_id: uploaderId,
        })
        .select()
        .single();
    if (docError) { console.error('Document insert error:', docError); throw docError; }

    // 3. Insert department access (if not general and not private)
    if (!effectiveIsGeneral && accessLevel !== 'PRIVATE' && deptId) {
        await supabase.from('document_departments').insert({ doc_id: doc.id, dept_id: Number(deptId) });
    }

    // 4. Insert existing tags
    if (tagIds && tagIds.length > 0) {
        const tagRows = tagIds.map(tag_id => ({ doc_id: doc.id, tag_id }));
        await supabase.from('document_tags').insert(tagRows);
    }

    // 5. Insert custom tags (case-insensitive upsert)
    if (customTags && customTags.length > 0) {
        for (const tagName of customTags) {
            const normalized = tagName.trim().toLowerCase();
            if (!normalized) continue;

            // Check if tag already exists (case-insensitive)
            const { data: existing } = await supabase
                .from('tags')
                .select('id')
                .ilike('name', normalized)
                .maybeSingle();

            let tagId;
            if (existing) {
                tagId = existing.id;
            } else {
                // Create new label tag with lowercase name
                const { data: newTag, error: tagErr } = await supabase
                    .from('tags')
                    .insert({ name: normalized, type: 'CUSTOM', weight: 1, color: '#6B7280' })
                    .select('id')
                    .single();
                if (tagErr) { console.error('Custom tag insert error:', tagErr); continue; }
                tagId = newTag.id;
            }

            // Link tag to document
            await supabase.from('document_tags').insert({ doc_id: doc.id, tag_id: tagId }).onConflict('doc_id,tag_id').ignore();
        }
    }

    // 6. Log the upload in audit_logs
    await supabase.from('audit_logs').insert({
        user_id: uploaderId,
        doc_id: doc.id,
        action: 'UPLOAD',
        details: `Uploaded ${title} [${accessLevel}]`,
    });

    return doc;
}

// ---- Role-Based Access Helpers ----

// Returns the allowed document access levels for a given role access_level
export const getAllowedAccessLevels = (roleAccessLevel) => {
    if (roleAccessLevel >= 10) return ['PUBLIC', 'STUDENT', 'STAFF', 'CONFIDENTIAL', 'PRIVATE']; // Admin
    if (roleAccessLevel >= 7) return ['PUBLIC', 'STUDENT', 'STAFF', 'CONFIDENTIAL']; // HOD
    if (roleAccessLevel >= 5) return ['PUBLIC', 'STUDENT', 'STAFF']; // Teacher
    return ['PUBLIC', 'STUDENT']; // Student
};

// Check if a user can view a specific document
export const canUserViewDocument = (doc, profile) => {
    if (!profile) return false;
    const roleLevel = profile.roles?.access_level || 0;

    // Admin can see everything
    if (roleLevel >= 10) return true;

    // Uploader can always see their own docs
    if (doc.uploader_id === profile.id) return true;

    // PRIVATE docs: only uploader + admin
    if (doc.access_level === 'PRIVATE') return false;

    // Check access level
    const allowed = getAllowedAccessLevels(roleLevel);
    if (!allowed.includes(doc.access_level)) return false;

    // Check department isolation (if not general)
    if (!doc.is_general && doc.dept_ids && doc.dept_ids.length > 0) {
        return doc.dept_ids.includes(profile.dept_id);
    }

    return true;
};

// Filter a list of documents by user access
export const filterDocumentsByAccess = (docs, profile) => {
    if (!profile) return [];
    return docs.filter(doc => canUserViewDocument(doc, profile));
};

// Access level display info
export const ACCESS_LEVEL_INFO = {
    PUBLIC: { label: 'Public (Everyone)', color: '#22c55e', description: 'All users can view' },
    STUDENT: { label: 'Student', color: '#3b82f6', description: 'Students + Teachers + HOD' },
    STAFF: { label: 'Staff Only (General)', color: '#D4A017', description: 'Teachers + HOD + Admin only' },
    CONFIDENTIAL: { label: 'Confidential', color: '#ef4444', description: 'HOD + Admin only' },
    PRIVATE: { label: 'Private', color: '#6b7280', description: 'Only you + Admin' },
};

// Expiry options for the upload form
export const EXPIRY_OPTIONS = [
    { value: '', label: 'Permanent (no expiry)' },
    { value: '7', label: '1 week' },
    { value: '14', label: '2 weeks' },
    { value: '30', label: '1 month' },
    { value: '60', label: '2 months' },
    { value: '90', label: '3 months' },
    { value: '180', label: '6 months' },
];

export const calculateExpiryDate = (daysStr) => {
    if (!daysStr) return null;
    const d = new Date();
    d.setDate(d.getDate() + Number(daysStr));
    return d.toISOString();
};

// ---- Helper Functions ----

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

// ---- Delete Functions ----

/**
 * Delete a single document by ID (enforced by DB RLS).
 */
export async function deleteDocument(docId) {
    const { error } = await supabase.from('documents').delete().eq('id', docId);
    if (error) { console.error('deleteDocument:', error); throw error; }

    // Log deletion
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        await supabase.from('audit_logs').insert({
            user_id: (await supabase.from('users').select('id').eq('google_id', user.id).maybeSingle()).data?.id,
            doc_id: docId,
            action: 'DELETE',
            details: `Document ${docId} deleted`,
        });
    }
}

/**
 * Bulk delete documents (RLS-enforced per document).
 */
export async function bulkDeleteDocuments(docIds) {
    const { error } = await supabase.from('documents').delete().in('id', docIds);
    if (error) { console.error('bulkDeleteDocuments:', error); throw error; }
}

/**
 * Check if the current profile can delete a given doc right now.
 */
export const canUserDeleteDocument = (doc, profile) => {
    if (!profile) return false;
    const roleLevel = profile.roles?.access_level || 0;

    // Admin: always
    if (roleLevel >= 10) return true;

    // HOD: docs in their own department (or general docs)
    if (roleLevel >= 7) {
        if (doc.is_general) return true;
        if (doc.dept_ids && doc.dept_ids.includes(profile.dept_id)) return true;
    }

    // Uploader: within 1 hour
    if (doc.uploader_id === profile.id) {
        const uploadedAt = new Date(doc.uploaded_at);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return uploadedAt >= oneHourAgo;
    }

    return false;
};

/**
 * Check if the current profile has bulk-delete enabled (admin-granted permission).
 */
export const canUserBulkDelete = (profile) => {
    if (!profile) return false;
    const roleLevel = profile.roles?.access_level || 0;
    // Admin always can
    if (roleLevel >= 10) return true;
    // Others only if admin has enabled it for them
    return profile.bulk_delete_enabled === true;
};

// ---- Admin: User Management ----

export async function fetchUsersAdmin() {
    const { data, error } = await supabase
        .from('users')
        .select('*, roles(name, access_level), departments(name)')
        .order('id');
    if (error) { console.error('fetchUsersAdmin:', error); return []; }
    return data;
}

export async function updateUserBulkDelete(userId, enabled) {
    const { error } = await supabase
        .from('users')
        .update({ bulk_delete_enabled: enabled })
        .eq('id', userId);
    if (error) { console.error('updateUserBulkDelete:', error); throw error; }
}

