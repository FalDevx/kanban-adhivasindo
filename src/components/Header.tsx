import { IonIcon } from '@ionic/react';
import {
  filterOutline,
  chevronDownOutline,
  personAddOutline,
  downloadOutline,
  cloudUploadOutline,
  searchOutline,
  closeCircleOutline,
  checkmarkOutline,
  closeOutline,
  mailOutline,
  copyOutline,
  lockClosedOutline,
} from 'ionicons/icons';
import { useTaskStore } from '../store/taskStore';
import { useRef, useState } from 'react';

const TEAM_MEMBERS = [
  { id: 'jd', initials: 'JD', name: 'John Doe',    color: '#6366f1' },
  { id: 'ms', initials: 'MS', name: 'Mike Smith',  color: '#06b6d4' },
  { id: 'ab', initials: 'AB', name: 'Alex Brown',  color: '#f59e0b' },
  { id: 'cd', initials: 'CD', name: 'Chris Davis', color: '#10b981' },
];

const LABEL_OPTIONS = ['Feature', 'Bug', 'Issue', 'Undefined'];
const LABEL_COLORS: Record<string, string> = {
  Feature: '#3b82f6', Bug: '#ef4444', Issue: '#f59e0b', Undefined: '#94a3b8',
};

export const Header: React.FC = () => {
  const { filter, setSearchQuery, setLabelFilter, setAssigneeFilter, clearFilters, tasks, addTask } = useTaskStore();

  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');
  const [inviteSent, setInviteSent] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>(filter.labels);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(filter.assignees);
  const [dueDateFrom, setDueDateFrom] = useState('');
  const [dueDateTo, setDueDateTo] = useState('');
  const importRef = useRef<HTMLInputElement>(null);

  const activeFilterCount = selectedLabels.length + selectedAssignees.length + (dueDateFrom ? 1 : 0);

  const toggleLabel = (label: string) => {
    const updated = selectedLabels.includes(label)
      ? selectedLabels.filter((l) => l !== label)
      : [...selectedLabels, label];
    setSelectedLabels(updated);
    setLabelFilter(updated);
  };

  const toggleAssignee = (id: string) => {
    const updated = selectedAssignees.includes(id)
      ? selectedAssignees.filter((a) => a !== id)
      : [...selectedAssignees, id];
    setSelectedAssignees(updated);
    setAssigneeFilter(updated);
  };

  const handleClearAll = () => {
    setSelectedLabels([]);
    setSelectedAssignees([]);
    setDueDateFrom('');
    setDueDateTo('');
    clearFilters();
    setFilterOpen(false);
  };

  // Export tasks as JSON
  const handleExportJSON = () => {
    const data = JSON.stringify(Object.values(tasks), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kanban-tasks.json';
    a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  // Export tasks as CSV
  const handleExportCSV = () => {
    const rows = [['ID', 'Title', 'Description', 'Column', 'Label', 'Priority', 'Due Date', 'Assignees', 'Subtasks', 'Comments']];
    Object.values(tasks).forEach((t) => {
      rows.push([
        t.id, t.title, t.description, t.columnId, t.label, t.priority,
        t.dueDate, t.assignees.map((a) => a.name).join('; '),
        `${t.subtasks.filter((s) => s.completed).length}/${t.subtasks.length}`,
        String(t.comments),
      ]);
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kanban-tasks.csv';
    a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  // Import tasks from JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        const arr = Array.isArray(imported) ? imported : Object.values(imported);
        arr.forEach((t: any) => addTask(t));
        alert(`✅ ${arr.length} task berhasil diimport!`);
      } catch {
        alert('❌ Format file tidak valid. Gunakan file JSON yang diekspor dari aplikasi ini.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div style={{
      background: '#fff', borderBottom: '1px solid #e2e8f0',
      padding: '0 24px', height: '56px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0, zIndex: 40, position: 'sticky', top: 0,
    }}>

      {/* LEFT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Board name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <div style={{
            width: '22px', height: '22px', borderRadius: '5px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <IonIcon icon={lockClosedOutline} style={{ fontSize: '13px', color: '#fff' }} />
          </div>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Adhivasindo</span>
          <IonIcon icon={chevronDownOutline} style={{ fontSize: '13px', color: '#64748b' }} />
        </div>

        {/* Team avatars — clickable for assignee filter */}
        <div className="header-team-avatars" style={{ display: 'flex', alignItems: 'center' }}>
          {TEAM_MEMBERS.map((m, i) => {
            const active = selectedAssignees.includes(m.id);
            return (
              <div key={m.id} title={`Filter: ${m.name}`}
                onClick={() => toggleAssignee(m.id)}
                style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  backgroundColor: m.color,
                  border: active ? `2.5px solid #1e293b` : '2px solid #fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 700, color: '#fff',
                  marginLeft: i === 0 ? 0 : '-8px',
                  zIndex: 10 - i, position: 'relative', cursor: 'pointer',
                  boxShadow: active ? '0 0 0 2px #6366f1' : 'none',
                  transition: 'all 0.15s',
                  opacity: selectedAssignees.length > 0 && !active ? 0.5 : 1,
                }}>
                {m.initials}
              </div>
            );
          })}
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%',
            backgroundColor: '#e2e8f0', border: '2px solid #fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', fontWeight: 700, color: '#64748b',
            marginLeft: '-8px', position: 'relative', zIndex: 5,
          }}>+2</div>
        </div>

        {/* Invite */}
        <button
          className="header-invite-btn"
          onClick={() => { setInviteOpen(true); }}
          style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 14px', borderRadius: '8px',
          border: '1px solid #e2e8f0', background: '#fff',
          fontSize: '13px', fontWeight: 600, color: '#374151', cursor: 'pointer',
        }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}>
          <IonIcon icon={personAddOutline} style={{ fontSize: '14px' }} />
          Invite
        </button>
      </div>

      {/* RIGHT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>

        {/* Filter button */}
        <button
          onClick={() => { setFilterOpen(!filterOpen); setExportOpen(false); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '8px',
            border: `1px solid ${filterOpen || activeFilterCount > 0 ? '#6366f1' : '#e2e8f0'}`,
            background: filterOpen || activeFilterCount > 0 ? '#eef2ff' : '#fff',
            fontSize: '13px', fontWeight: 600,
            color: activeFilterCount > 0 ? '#6366f1' : '#374151', cursor: 'pointer',
            position: 'relative',
          }}>
          <IonIcon icon={filterOutline} style={{ fontSize: '14px' }} />
          Filter
          {activeFilterCount > 0 && (
            <span style={{
              position: 'absolute', top: '-6px', right: '-6px',
              width: '16px', height: '16px', borderRadius: '50%',
              background: '#6366f1', color: '#fff',
              fontSize: '10px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{activeFilterCount}</span>
          )}
        </button>

        {/* Export / Import button */}
        <button
          onClick={() => { setExportOpen(!exportOpen); setFilterOpen(false); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '8px',
            border: `1px solid ${exportOpen ? '#6366f1' : '#e2e8f0'}`,
            background: exportOpen ? '#eef2ff' : '#fff',
            fontSize: '13px', fontWeight: 600, color: '#374151', cursor: 'pointer',
          }}
          onMouseEnter={(e) => { if (!exportOpen) e.currentTarget.style.background = '#f8fafc'; }}
          onMouseLeave={(e) => { if (!exportOpen) e.currentTarget.style.background = '#fff'; }}>
          <IonIcon icon={downloadOutline} style={{ fontSize: '14px' }} />
          Export / Import
        </button>

        {/* Search */}
        <div className="header-right-search" style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '6px 14px', borderRadius: '8px',
          border: '1px solid #e2e8f0', background: '#fff', minWidth: '200px',
        }}>
          <IonIcon icon={searchOutline} style={{ fontSize: '14px', color: '#94a3b8', flexShrink: 0 }} />
          <input type="text" value={filter.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Tasks"
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: '#374151', width: '100%', fontFamily: 'inherit' }} />
          {filter.searchQuery && (
            <button onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 0 }}>
              <IonIcon icon={closeCircleOutline} style={{ fontSize: '16px' }} />
            </button>
          )}
        </div>

        {/* ── FILTER DROPDOWN ── */}
        {filterOpen && (
          <div style={{
            position: 'absolute', top: '44px', right: '220px',
            background: '#fff', borderRadius: '12px',
            border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 100, minWidth: '280px', padding: '16px',
          }}>
            {/* Label filter */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', marginBottom: '10px' }}>
                FILTER BY LABEL
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {LABEL_OPTIONS.map((label) => {
                  const active = selectedLabels.includes(label);
                  return (
                    <button key={label} onClick={() => toggleLabel(label)} style={{
                      padding: '5px 12px', borderRadius: '999px', cursor: 'pointer',
                      border: `1.5px solid ${active ? LABEL_COLORS[label] : '#e2e8f0'}`,
                      background: active ? LABEL_COLORS[label] + '18' : '#fff',
                      color: active ? LABEL_COLORS[label] : '#64748b',
                      fontSize: '12px', fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: '5px',
                    }}>
                      {active && <IonIcon icon={checkmarkOutline} style={{ fontSize: '11px' }} />}
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Assignee filter */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', marginBottom: '10px' }}>
                FILTER BY ASSIGNEE
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {TEAM_MEMBERS.map((m) => {
                  const active = selectedAssignees.includes(m.id);
                  return (
                    <button key={m.id} onClick={() => toggleAssignee(m.id)} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '7px 10px', borderRadius: '8px', cursor: 'pointer',
                      border: `1px solid ${active ? '#6366f1' : '#e2e8f0'}`,
                      background: active ? '#eef2ff' : '#fff',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#fff' }}>
                          {m.initials}
                        </div>
                        <span style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>{m.name}</span>
                      </div>
                      {active && <IonIcon icon={checkmarkOutline} style={{ color: '#6366f1', fontSize: '15px' }} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due date filter */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', marginBottom: '10px' }}>
                FILTER BY DUE DATE
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>From</div>
                  <input type="date" value={dueDateFrom} onChange={(e) => setDueDateFrom(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>To</div>
                  <input type="date" value={dueDateTo} onChange={(e) => setDueDateTo(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                {activeFilterCount > 0 ? `${activeFilterCount} filter aktif` : 'Belum ada filter'}
              </span>
              <button onClick={handleClearAll} style={{
                padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0',
                background: '#fff', fontSize: '12px', fontWeight: 600, color: '#64748b', cursor: 'pointer',
              }}>
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* ── EXPORT/IMPORT DROPDOWN ── */}
        {exportOpen && (
          <div style={{
            position: 'absolute', top: '44px', right: '220px',
            background: '#fff', borderRadius: '12px',
            border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 100, minWidth: '220px', padding: '8px',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', padding: '6px 12px 10px' }}>
              EXPORT / IMPORT
            </div>

            <button onClick={handleExportJSON} style={{
              display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
              padding: '10px 12px', background: 'none', border: 'none', borderRadius: '8px',
              cursor: 'pointer', textAlign: 'left',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IonIcon icon={downloadOutline} style={{ color: '#6366f1', fontSize: '16px' }} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>Export JSON</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Download semua task</div>
              </div>
            </button>

            <button onClick={handleExportCSV} style={{
              display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
              padding: '10px 12px', background: 'none', border: 'none', borderRadius: '8px',
              cursor: 'pointer', textAlign: 'left',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IonIcon icon={downloadOutline} style={{ color: '#16a34a', fontSize: '16px' }} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>Export CSV</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Untuk spreadsheet</div>
              </div>
            </button>

            <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 8px' }} />

            <button onClick={() => { importRef.current?.click(); setExportOpen(false); }} style={{
              display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
              padding: '10px 12px', background: 'none', border: 'none', borderRadius: '8px',
              cursor: 'pointer', textAlign: 'left',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IonIcon icon={cloudUploadOutline} style={{ color: '#ea580c', fontSize: '16px' }} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>Import JSON</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Upload file task</div>
              </div>
            </button>
          </div>
        )}

        <input ref={importRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
      </div>

      {/* Backdrop to close dropdowns */}
      {(filterOpen || exportOpen) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => { setFilterOpen(false); setExportOpen(false); }} />
      )}

      {/* ── INVITE MODAL ── */}
      {inviteOpen && (
        <>
          {/* Backdrop */}
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }}
            onClick={() => { setInviteOpen(false); setInviteSent(false); setInviteEmail(''); }} />

          {/* Modal */}
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#fff', borderRadius: '16px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
            zIndex: 201, width: '460px', padding: '28px',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>Invite Team Member</h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>Tambahkan anggota baru ke board Adhivasindo</p>
              </div>
              <button onClick={() => { setInviteOpen(false); setInviteSent(false); setInviteEmail(''); }}
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                <IonIcon icon={closeOutline} style={{ fontSize: '18px' }} />
              </button>
            </div>

            {!inviteSent ? (
              <>
                {/* Current members */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', marginBottom: '10px' }}>ANGGOTA SAAT INI</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {TEAM_MEMBERS.map((m) => (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff' }}>
                            {m.initials}
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>{m.name}</span>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#6366f1', background: '#eef2ff', padding: '3px 10px', borderRadius: '999px' }}>Member</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Invite form */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', marginBottom: '10px' }}>UNDANG ANGGOTA BARU</div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px' }}>
                      <IonIcon icon={mailOutline} style={{ fontSize: '16px', color: '#94a3b8', flexShrink: 0 }} />
                      <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="nama@email.com"
                        style={{ border: 'none', outline: 'none', fontSize: '13px', color: '#374151', width: '100%', fontFamily: 'inherit' }} />
                    </div>
                    <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
                      style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', color: '#374151', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', background: '#fff' }}>
                      <option value="Member">Member</option>
                      <option value="Admin">Admin</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </div>
                </div>

                {/* Share link */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', marginBottom: '8px' }}>ATAU BAGIKAN LINK</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#94a3b8', background: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      https://adhivasindo.app/invite/abc123xyz
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText('https://adhivasindo.app/invite/abc123xyz'); }}
                      style={{ padding: '8px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#374151', flexShrink: 0 }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}>
                      <IonIcon icon={copyOutline} style={{ fontSize: '14px' }} />
                      Copy
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button onClick={() => { setInviteOpen(false); setInviteEmail(''); }}
                    style={{ padding: '9px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '13px', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>
                    Batal
                  </button>
                  <button
                    onClick={() => { if (inviteEmail) setInviteSent(true); }}
                    disabled={!inviteEmail}
                    style={{ padding: '9px 24px', borderRadius: '8px', border: 'none', background: inviteEmail ? '#6366f1' : '#e2e8f0', fontSize: '13px', fontWeight: 600, color: inviteEmail ? '#fff' : '#94a3b8', cursor: inviteEmail ? 'pointer' : 'not-allowed' }}>
                    Kirim Undangan
                  </button>
                </div>
              </>
            ) : (
              /* Success state */
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#f0fdf4', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <IonIcon icon={checkmarkOutline} style={{ fontSize: '28px', color: '#16a34a' }} />
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Undangan Terkirim!</h3>
                <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748b' }}>
                  Undangan telah dikirim ke <strong>{inviteEmail}</strong> sebagai <strong>{inviteRole}</strong>.
                </p>
                <button onClick={() => { setInviteSent(false); setInviteEmail(''); }}
                  style={{ padding: '9px 24px', borderRadius: '8px', border: 'none', background: '#6366f1', fontSize: '13px', fontWeight: 600, color: '#fff', cursor: 'pointer', marginRight: '10px' }}>
                  Undang Lagi
                </button>
                <button onClick={() => { setInviteOpen(false); setInviteSent(false); setInviteEmail(''); }}
                  style={{ padding: '9px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '13px', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>
                  Tutup
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
