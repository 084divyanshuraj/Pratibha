import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Play,
  CheckCircle2,
  AlertCircle,
  Sliders,
  DollarSign,
  Users,
  Building,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Info,
  GraduationCap,
  Briefcase,
  Shield,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function SandboxPage() {
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'institution_admin';

  const [strategy, setStrategy] = useState('targeted');
  const [selectedIntervention, setSelectedIntervention] = useState(() => {
    if (role === 'placement_officer') return 'career_bootcamp';
    return 'remedial_classes';
  });
  const [capacitySeats, setCapacitySeats] = useState(15);
  const [budgetLimit, setBudgetLimit] = useState(3000);

  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [approvedState, setApprovedState] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (role === 'placement_officer') {
      setSelectedIntervention('career_bootcamp');
    } else if (role === 'faculty_mentor') {
      setSelectedIntervention('remedial_classes');
    }
  }, [role]);

  const handleRunSimulation = async () => {
    setSimulating(true);
    setApprovedState(false);
    setToastMessage(null);

    try {
      const scenario = await api.createSimulation({
        strategy,
        interventionTypes: [selectedIntervention],
        capacityConstraints: { [selectedIntervention]: capacitySeats },
        assumptions: [`Prioritized students based on ${strategy} allocation model.`],
      });

      const result = await api.runSimulation(scenario.scenarioId);
      setSimulationResult(result);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  const handleApprove = async () => {
    if (!simulationResult?.scenarioId) return;
    try {
      const res = await api.approveSimulation(simulationResult.scenarioId);
      setApprovedState(true);
      setToastMessage('Scenario approved! Official student interventions persisted into database.');
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Persona Focus Alert */}
      <div
        style={{
          backgroundColor: role === 'faculty_mentor' ? '#F0FDF4' : role === 'placement_officer' ? '#EFF6FF' : '#F8FAFC',
          border: `1px solid ${role === 'faculty_mentor' ? '#BBF7D0' : role === 'placement_officer' ? '#BFDBFE' : '#E2E8F0'}`,
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: role === 'faculty_mentor' ? '#16A34A' : role === 'placement_officer' ? '#2563EB' : '#0F172A',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {role === 'faculty_mentor' ? <GraduationCap size={18} /> : role === 'placement_officer' ? <Briefcase size={18} /> : <Shield size={18} />}
        </div>
        <div>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: role === 'faculty_mentor' ? '#15803D' : role === 'placement_officer' ? '#1D4ED8' : '#334155' }}>
            {role === 'faculty_mentor' ? 'Faculty Mentorship Sandbox Mode' : role === 'placement_officer' ? 'Corporate Placement Cell Bootcamp Mode' : 'Institutional Optimizer Mode'}
          </div>
          <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '2px' }}>
            {role === 'faculty_mentor'
              ? 'Model remedial subject coaching, attendance recovery clinics, and peer-to-peer mentoring quotas for CSE mentees.'
              : role === 'placement_officer'
              ? 'Model mock interview bootcamps, resume workshops, and technical coding sprints for corporate drive shortlists.'
              : 'Optimize cross-department capacity limits and budget allocation with zero outcome fabrication.'}
          </div>
        </div>
      </div>

      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '999px', backgroundColor: '#EBF3FE', color: '#1A73E8', fontSize: '0.74rem', fontWeight: 600, marginBottom: '6px' }}>
            <FlaskConical size={13} />
            <span>KPMG Sandbox Simulator (Phase 8 Production Engine)</span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
            {role === 'faculty_mentor' ? 'Remedial Tutoring & Mentorship Sandbox' : role === 'placement_officer' ? 'Interview Sprints & Placement Optimizer' : 'Intervention Sandbox & Resource Optimizer'}
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.86rem' }}>
            {role === 'faculty_mentor'
              ? 'Plan remedial coaching and peer mentoring cohorts within actual department faculty teaching capacity.'
              : role === 'placement_officer'
              ? 'Simulate corporate bootcamp seat limits and aptitude training drives for upcoming visiting recruiters.'
              : 'Model and allocate support programs under real faculty capacity constraints with zero outcome fabrication.'}
          </p>
        </div>

        {simulationResult && !approvedState && (
          <button
            onClick={handleApprove}
            style={{
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 18px',
              fontWeight: 600,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
            }}
          >
            <CheckCircle2 size={16} />
            <span>Approve & Assign Interventions</span>
          </button>
        )}
      </div>

      {toastMessage && (
        <div style={{ padding: '12px 18px', borderRadius: '8px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', fontSize: '0.85rem', fontWeight: 600 }}>
          {toastMessage}
        </div>
      )}

      {/* Simulator Workspace Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: Parameter Controls */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '22px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={16} color="#1A73E8" />
            <span>Scenario Parameters</span>
          </h3>

          {/* Strategy Selector */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
              Allocation Strategy:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { id: 'targeted', label: 'Targeted Allocation', desc: 'Highest risk score students prioritized' },
                { id: 'uniform', label: 'Uniform Allocation', desc: 'Distributed evenly across departments' },
                { id: 'mixed', label: 'Mixed Hybrid Allocation', desc: 'Balances risk with department parity' },
              ].map((strat) => (
                <div
                  key={strat.id}
                  onClick={() => setStrategy(strat.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${strategy === strat.id ? '#1A73E8' : '#E2E8F0'}`,
                    backgroundColor: strategy === strat.id ? '#EBF3FE' : '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: strategy === strat.id ? '#1A73E8' : '#1E293B' }}>
                    {strat.label}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{strat.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Intervention Program */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
              Intervention Program:
            </label>
            <select
              value={selectedIntervention}
              onChange={(e) => setSelectedIntervention(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '0.84rem',
                outline: 'none',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="remedial_classes">Remedial Subject Coaching</option>
              <option value="peer_mentoring">Peer-to-Peer Academic Mentoring</option>
              <option value="career_bootcamp">Mock Interview & Aptitude Bootcamp</option>
              <option value="counseling_session">Student Wellness Counseling</option>
            </select>
          </div>

          {/* Capacity Constraint Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>
                Seat Capacity Limit:
              </label>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1A73E8' }}>
                {capacitySeats} Seats
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={capacitySeats}
              onChange={(e) => setCapacitySeats(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
            <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '2px' }}>
              Limits total concurrent intervention enrollments
            </div>
          </div>

          {/* Run Action */}
          <button
            onClick={handleRunSimulation}
            disabled={simulating}
            style={{
              backgroundColor: '#1A73E8',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '11px',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: simulating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(26, 115, 232, 0.25)',
            }}
          >
            <Play size={15} fill="#FFFFFF" />
            <span>{simulating ? 'Computing Allocation...' : 'Run Simulation'}</span>
          </button>
        </div>

        {/* Right Column: Simulation Output & Allocation Lists */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!simulationResult ? (
            /* Empty State */
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '48px 24px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FlaskConical size={26} color="#94A3B8" />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0F172A' }}>
                Intervention Simulation Ready
              </h3>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748B', maxWidth: '420px', lineHeight: '1.5' }}>
                Configure capacity limits and strategy on the left, then click <strong>Run Simulation</strong> to compute deterministic student assignments with explainable selection/exclusion rationales.
              </p>
            </div>
          ) : (
            /* Results Presentation */
            <>
              {/* Summary Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Selected for Program</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10B981', marginTop: '4px' }}>
                    {simulationResult.allocationResults?.length || 0} Students
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Strictly within {capacitySeats} seat cap</div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Excluded Due to Capacity</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F59E0B', marginTop: '4px' }}>
                    {simulationResult.excludedResults?.length || 0} Students
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Queued for next cohort cycle</div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Human Approval State</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: approvedState ? '#10B981' : '#D97706', marginTop: '6px' }}>
                    {approvedState ? 'APPROVED & ASSIGNED' : 'SIMULATED (PENDING)'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Requires human provost authorization</div>
                </div>
              </div>

              {/* Zero Outcome Fabrication Integrity Notice */}
              <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <ShieldCheck size={20} color="#1A73E8" flexShrink={0} />
                <div style={{ fontSize: '0.76rem', color: '#1E40AF', lineHeight: '1.45' }}>
                  <strong>KPMG Compliance Rule: Zero Outcome Fabrication.</strong> Estimated causal uplifts are not simulated blindly. Actual outcomes are recorded longitudinally only after verified intervention completion.
                </div>
              </div>

              {/* Selected Students Table */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontWeight: 600, fontSize: '0.86rem', color: '#0F172A' }}>
                  Allocated Students ({simulationResult.allocationResults?.length || 0})
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #F1F5F9', color: '#64748B' }}>
                      <th style={{ padding: '10px 18px', textAlign: 'left' }}>Student ID</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left' }}>Program</th>
                      <th style={{ padding: '10px 18px', textAlign: 'left' }}>Deterministic Selection Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(simulationResult.allocationResults || []).map((alloc, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 18px', fontWeight: 600, color: '#1A73E8' }}>{alloc.studentId}</td>
                        <td style={{ padding: '10px 14px', textTransform: 'capitalize' }}>{alloc.interventionType.replace('_', ' ')}</td>
                        <td style={{ padding: '10px 18px', color: '#334155' }}>{alloc.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Excluded Students Table */}
              {simulationResult.excludedResults && simulationResult.excludedResults.length > 0 && (
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontWeight: 600, fontSize: '0.86rem', color: '#0F172A' }}>
                    Excluded Students ({simulationResult.excludedResults.length})
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #F1F5F9', color: '#64748B' }}>
                        <th style={{ padding: '10px 18px', textAlign: 'left' }}>Student ID</th>
                        <th style={{ padding: '10px 18px', textAlign: 'left' }}>Exclusion Rationale</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulationResult.excludedResults.map((excl, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '10px 18px', fontWeight: 600, color: '#64748B' }}>{excl.studentId}</td>
                          <td style={{ padding: '10px 18px', color: '#64748B' }}>{excl.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
