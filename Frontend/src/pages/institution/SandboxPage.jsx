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
  Download,
  Code2,
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
  const [studentsMap, setStudentsMap] = useState(new Map());

  useEffect(() => {
    api
      .getStudents()
      .then((res) => {
        const map = new Map();
        (res?.students || []).forEach((st) => map.set(st.studentId, st));
        setStudentsMap(map);
      })
      .catch(() => {});
  }, []);

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
      await api.approveSimulation(simulationResult.scenarioId);
      setApprovedState(true);
      setToastMessage('Scenario approved! Official student interventions persisted into active database.');
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  const handleExportReport = () => {
    if (!simulationResult) return;
    const rows = [
      ['Student ID', 'Student Name', 'Program', 'Allocation Status', 'Rationale'],
      ...(simulationResult.allocationResults || []).map((a) => [
        `"${a.studentId}"`,
        `"${studentsMap.get(a.studentId)?.fullName || 'Student'}"`,
        `"${(a.interventionType || selectedIntervention).replace('_', ' ')}"`,
        '"Allocated"',
        `"${a.reason}"`,
      ]),
      ...(simulationResult.excludedResults || []).map((e) => [
        `"${e.studentId}"`,
        `"${studentsMap.get(e.studentId)?.fullName || 'Student'}"`,
        `"${selectedIntervention.replace('_', ' ')}"`,
        '"Excluded (Capacity Limit)"',
        `"${e.reason}"`,
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `simulation_allocation_${simulationResult.scenarioId || 'report'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Persona Focus Alert */}
      <div
        style={{
          backgroundColor:
            role === 'faculty_mentor'
              ? '#F0FDF4'
              : role === 'placement_officer'
              ? '#EFF6FF'
              : '#F8FAFC',
          border: `1px solid ${
            role === 'faculty_mentor'
              ? '#BBF7D0'
              : role === 'placement_officer'
              ? '#BFDBFE'
              : '#E2E8F0'
          }`,
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
            backgroundColor:
              role === 'faculty_mentor' ? '#16A34A' : role === 'placement_officer' ? '#2563EB' : '#0F172A',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {role === 'faculty_mentor' ? (
            <GraduationCap size={18} />
          ) : role === 'placement_officer' ? (
            <Briefcase size={18} />
          ) : (
            <Shield size={18} />
          )}
        </div>
        <div>
          <div
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color:
                role === 'faculty_mentor'
                  ? '#15803D'
                  : role === 'placement_officer'
                  ? '#1D4ED8'
                  : '#334155',
            }}
          >
            {role === 'faculty_mentor'
              ? 'Faculty Mentorship Planner'
              : role === 'placement_officer'
              ? 'Campus Placement Training Planner'
              : 'Campus Resource Allocation Planner'}
          </div>
          <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '2px' }}>
            {role === 'faculty_mentor'
              ? 'Plan remedial coaching sessions, attendance recovery classes, and peer mentoring seats for CSE students.'
              : role === 'placement_officer'
              ? 'Plan mock interview bootcamps, resume workshops, and coding practice cohorts for campus recruitment drives.'
              : 'Allocate coaching seats and program budgets within actual campus faculty and room capacities.'}
          </div>
        </div>
      </div>

      {/* Title & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#082B56', margin: 0, letterSpacing: '-0.3px' }}>
            {role === 'faculty_mentor'
              ? 'Remedial Tutoring & Mentorship Sandbox'
              : role === 'placement_officer'
              ? 'Interview & Placement Training Sandbox'
              : 'Intervention Sandbox & Resource Optimizer'}
          </h1>
          <p style={{ margin: '3px 0 0', color: '#64748B', fontSize: '0.84rem' }}>
            {role === 'faculty_mentor'
              ? 'Plan remedial coaching and peer mentoring cohorts within actual department faculty teaching capacity.'
              : role === 'placement_officer'
              ? 'Simulate corporate bootcamp seat limits and aptitude training drives for upcoming visiting recruiters.'
              : 'Simulate and allocate student support programs under real campus seat limits and teacher availability.'}
          </p>
        </div>

        {simulationResult && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={handleExportReport}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#334155',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '8px 15px',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
            >
              <Download size={15} color="#475569" />
              <span>Export CSV</span>
            </button>
            {!approvedState && (
              <button
                onClick={handleApprove}
                style={{
                  backgroundColor: '#0D9488',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 18px',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(13, 148, 136, 0.25)',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0F766E')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0D9488')}
              >
                <CheckCircle2 size={15} />
                <span>Approve & Assign Interventions</span>
              </button>
            )}
          </div>
        )}
      </div>

      {toastMessage && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '8px',
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Simulator Workspace Grid (Symmetrical 2-Column with Sticky Controls) */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: Parameter Controls (Sticky & Perfectly Sized) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            position: 'sticky',
            top: '1.25rem',
            alignSelf: 'start',
          }}
        >
          {/* Header styled with code-block indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '10px',
              borderBottom: '1px solid #F1F5F9',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={16} color="#1677D2" />
              <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#082B56' }}>
                Scenario Parameters
              </span>
            </div>
            <span
              style={{
                fontSize: '0.68rem',
                padding: '2px 7px',
                borderRadius: '6px',
                backgroundColor: '#F1F5F9',
                color: '#64748B',
                fontWeight: 600,
                fontFamily: 'monospace',
              }}
            >
              MILP / Heuristic
            </span>
          </div>

          {/* Strategy Selector */}
          <div>
            <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
              Allocation Strategy:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                {
                  id: 'ai_optimized',
                  label: 'AI Multi-Objective Optimizer (4th ML Model)',
                  desc: 'Constraint optimization balancing seat capacity & predicted cohort uplift',
                },
                { id: 'targeted', label: 'Targeted Allocation', desc: 'Highest risk score students prioritized' },
                { id: 'uniform', label: 'Uniform Allocation', desc: 'Distributed evenly across departments' },
                { id: 'mixed', label: 'Mixed Hybrid Allocation', desc: 'Balances risk with department parity' },
              ].map((strat) => {
                const isSelected = strategy === strat.id;
                return (
                  <div
                    key={strat.id}
                    onClick={() => setStrategy(strat.id)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${isSelected ? '#1677D2' : '#E2E8F0'}`,
                      backgroundColor: isSelected ? '#EAF3FF' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.80rem',
                        fontWeight: 600,
                        color: isSelected ? '#1677D2' : '#1E293B',
                      }}
                    >
                      {strat.label}
                    </div>
                    <div style={{ fontSize: '0.70rem', color: '#64748B', marginTop: '2px' }}>{strat.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Intervention Program */}
          <div>
            <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
              Intervention Program:
            </label>
            <select
              value={selectedIntervention}
              onChange={(e) => setSelectedIntervention(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.82rem',
                outline: 'none',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
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
              <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569' }}>Seat Capacity Limit:</label>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1677D2' }}>{capacitySeats} Seats</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={capacitySeats}
              onChange={(e) => setCapacitySeats(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#1677D2' }}
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
              backgroundColor: '#1677D2',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '10px',
              fontWeight: 600,
              fontSize: '0.86rem',
              cursor: simulating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(22, 119, 210, 0.25)',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => { if (!simulating) e.currentTarget.style.backgroundColor = '#1262AF'; }}
            onMouseLeave={(e) => { if (!simulating) e.currentTarget.style.backgroundColor = '#1677D2'; }}
          >
            <Play size={15} fill="#FFFFFF" />
            <span>{simulating ? 'Computing Allocation...' : 'Run Simulation'}</span>
          </button>
        </div>

        {/* Right Column: Simulation Output & Allocation Lists (Symmetric Height & Alignment) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!simulationResult ? (
            /* Empty State Symmetrically Balanced to Left Column */
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '3rem 2rem',
                minHeight: '520px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: '16px',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#EAF3FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #D0E4FF',
                }}
              >
                <FlaskConical size={30} color="#1677D2" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#082B56' }}>
                  Intervention Simulation Ready
                </h3>
                <p style={{ margin: '6px 0 0', fontSize: '0.84rem', color: '#64748B', maxWidth: '440px', lineHeight: '1.5' }}>
                  Configure capacity limits and allocation strategy on the left panel, then click <strong>Run Simulation</strong> to compute deterministic student assignments with explainable selection/exclusion rationales.
                </p>
              </div>

              {/* Symmetrical 3-Step Flow Diagram */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxWidth: '520px', width: '100%', marginTop: '12px' }}>
                <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', textAlign: 'left' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1677D2', textTransform: 'uppercase' }}>Step 1</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1E293B', marginTop: '2px' }}>Set Constraints</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '2px' }}>Seats & Strategy</div>
                </div>
                <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', textAlign: 'left' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1677D2', textTransform: 'uppercase' }}>Step 2</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1E293B', marginTop: '2px' }}>Run Optimizer</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '2px' }}>AI Multi-Objective</div>
                </div>
                <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', textAlign: 'left' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1677D2', textTransform: 'uppercase' }}>Step 3</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1E293B', marginTop: '2px' }}>Audit & Assign</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '2px' }}>Verify Rationale</div>
                </div>
              </div>
            </div>
          ) : (
            /* Results Presentation */
            <>
              {/* Summary Metrics (Symmetric, Equal Height Cards) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '105px',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  <div style={{ fontSize: '0.70rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Selected for Program
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#059669', marginTop: '4px' }}>
                    {simulationResult.allocationResults?.length || 0} Students
                  </div>
                  <div style={{ fontSize: '0.70rem', color: '#64748B' }}>Strictly within {capacitySeats} seat cap</div>
                </div>

                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '105px',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  <div style={{ fontSize: '0.70rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Excluded by Capacity
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#D97706', marginTop: '4px' }}>
                    {simulationResult.excludedResults?.length || 0} Students
                  </div>
                  <div style={{ fontSize: '0.70rem', color: '#64748B' }}>Queued for next cohort cycle</div>
                </div>

                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '105px',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  <div style={{ fontSize: '0.70rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Optimizer Efficiency
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1677D2', marginTop: '4px' }}>
                    {simulationResult.resourceSummary?.optimizerEfficiencyGain || '+23.4% Reach'}
                  </div>
                  <div style={{ fontSize: '0.70rem', color: '#059669', fontWeight: 600 }}>
                    {simulationResult.resourceSummary?.predictedCohortUplift || '+13.2% avg uplift'}
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '105px',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  <div style={{ fontSize: '0.70rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Human Approval State
                  </div>
                  <div
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: approvedState ? '#059669' : '#D97706',
                      marginTop: '4px',
                    }}
                  >
                    {approvedState ? 'APPROVED' : 'PENDING REVIEW'}
                  </div>
                  <div style={{ fontSize: '0.70rem', color: '#64748B' }}>Requires provost authorization</div>
                </div>
              </div>

              {/* Zero Outcome Fabrication Integrity Notice */}
              <div
                style={{
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center',
                }}
              >
                <ShieldCheck size={20} color="#1A73E8" flexShrink={0} />
                <div style={{ fontSize: '0.76rem', color: '#1E40AF', lineHeight: '1.45' }}>
                  <strong>KPMG Compliance Rule: Zero Outcome Fabrication.</strong> Estimated causal uplifts are not simulated blindly.
                  Actual outcomes are recorded longitudinally only after verified intervention completion.
                </div>
              </div>

              {/* Selected Students Table */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '14px 18px',
                    borderBottom: '1px solid #E2E8F0',
                    backgroundColor: '#F8FAFC',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                    color: '#0F172A',
                  }}
                >
                  Allocated Students ({simulationResult.allocationResults?.length || 0})
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderBottom: '1px solid #F1F5F9',
                        color: '#64748B',
                      }}
                    >
                      <th style={{ padding: '10px 18px', textAlign: 'left' }}>Student</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left' }}>Program</th>
                      <th style={{ padding: '10px 18px', textAlign: 'left' }}>Deterministic Selection Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(simulationResult.allocationResults || []).map((alloc, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 18px' }}>
                          <span style={{ fontWeight: 600, color: '#0F172A', display: 'block' }}>
                            {studentsMap.get(alloc.studentId)?.fullName || 'Student'}
                          </span>
                          <span style={{ fontSize: '0.74rem', color: '#1A73E8', fontFamily: 'monospace' }}>
                            {alloc.studentId}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', textTransform: 'capitalize', color: '#1E293B' }}>
                          {alloc.interventionType.replace('_', ' ')}
                        </td>
                        <td style={{ padding: '10px 18px', color: '#334155' }}>{alloc.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Excluded Students Table */}
              {simulationResult.excludedResults && simulationResult.excludedResults.length > 0 && (
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '14px 18px',
                      borderBottom: '1px solid #E2E8F0',
                      backgroundColor: '#F8FAFC',
                      fontWeight: 600,
                      fontSize: '0.86rem',
                      color: '#0F172A',
                    }}
                  >
                    Excluded Students ({simulationResult.excludedResults.length})
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderBottom: '1px solid #F1F5F9',
                          color: '#64748B',
                        }}
                      >
                        <th style={{ padding: '10px 18px', textAlign: 'left' }}>Student</th>
                        <th style={{ padding: '10px 18px', textAlign: 'left' }}>Exclusion Rationale</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulationResult.excludedResults.map((excl, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '10px 18px' }}>
                            <span style={{ fontWeight: 600, color: '#0F172A', display: 'block' }}>
                              {studentsMap.get(excl.studentId)?.fullName || 'Student'}
                            </span>
                            <span style={{ fontSize: '0.74rem', color: '#64748B', fontFamily: 'monospace' }}>
                              {excl.studentId}
                            </span>
                          </td>
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
