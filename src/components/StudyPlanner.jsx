import React, { useState } from 'react';
import { Calendar, Plus, CheckCircle2, Sparkles, Trash2 } from 'lucide-react';
import { storageService } from '../services/storageService';
import { gamificationService } from '../services/gamificationService';

export default function StudyPlanner() {
  const [events, setEvents] = useState(storageService.getPlannerEvents());
  const profile = storageService.getProfile();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [date, setDate] = useState('');
  const [type, setType] = useState('exam');
  const [priority, setPriority] = useState('High');
  const [notes, setNotes] = useState('');

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!title || !date) return;

    const newEvent = {
      id: 'plan-' + Date.now(),
      title,
      subject,
      date,
      type,
      priority,
      notes,
      completed: false
    };

    const updated = [newEvent, ...events];
    setEvents(updated);
    storageService.savePlannerEvents(updated);

    setTitle('');
    setDate('');
    setNotes('');
  };

  const toggleComplete = (id) => {
    const updated = events.map(ev => {
      if (ev.id === id) {
        const nextState = !ev.completed;
        if (nextState) {
          gamificationService.addXP(25, 'Completed Study Planner Task');
        }
        return { ...ev, completed: nextState };
      }
      return ev;
    });
    setEvents(updated);
    storageService.savePlannerEvents(updated);
  };

  const handleDelete = (id) => {
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    storageService.savePlannerEvents(updated);
  };

  const getDaysRemaining = (targetDateStr) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const target = new Date(targetDateStr);
    const diffTime = target - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const examsList = events.filter(e => e.type === 'exam');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="saas-card" style={{ padding: '24px' }}>
        <h1 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar color="var(--primary-indigo)" size={28} /> Personalized Study Planner & Exam Schedule
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.9rem' }}>
          Organize your exam dates, daily study goals, and priority topics to structure your revision timeline.
        </p>
      </div>

      {/* Exam Countdowns Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {examsList.map(exam => {
          const daysLeft = getDaysRemaining(exam.date);
          const isUrgent = daysLeft <= 7;
          return (
            <div key={exam.id} className="saas-card" style={{ padding: '20px', borderLeft: `4px solid ${isUrgent ? '#ef4444' : '#6366f1'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-indigo">{exam.subject}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isUrgent ? '#ef4444' : '#10b981' }}>
                  {daysLeft > 0 ? `${daysLeft} Days Left` : daysLeft === 0 ? 'TODAY!' : 'Past Date'}
                </span>
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{exam.title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Target Date: {exam.date}</p>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        {/* Left Column: Tasks & Planner Checklist */}
        <div className="saas-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Study Schedule & Task Checklist</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {events.map(ev => (
              <div
                key={ev.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: ev.completed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  opacity: ev.completed ? 0.7 : 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => toggleComplete(ev.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: ev.completed ? '#10b981' : 'var(--text-muted)' }}
                  >
                    <CheckCircle2 size={22} />
                  </button>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', textDecoration: ev.completed ? 'line-through' : 'none' }}>
                      {ev.title}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {ev.subject} • Due: {ev.date}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className={`badge ${ev.priority === 'High' ? 'badge-rose' : 'badge-amber'}`}>
                    {ev.priority} Priority
                  </span>
                  <button onClick={() => handleDelete(ev.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Add Schedule Event */}
        <div className="saas-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} color="var(--primary-indigo)" /> Add Study Goal / Exam
          </h3>

          <form onSubmit={handleAddEvent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Title</label>
              <input type="text" className="input-field" placeholder="e.g. Biology Final Exam" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Subject</label>
              <select className="input-field" value={subject} onChange={(e) => setSubject(e.target.value)}>
                {profile.subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Target Date</label>
                <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Type</label>
                <select className="input-field" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="exam">Exam</option>
                  <option value="assignment">Assignment</option>
                  <option value="revision">Revision</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Priority Level</label>
              <select className="input-field" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
              <Sparkles size={18} /> Schedule Task
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
