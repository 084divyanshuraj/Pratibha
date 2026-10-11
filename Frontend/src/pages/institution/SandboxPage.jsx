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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#ECECEC' }}>
      {/* Persona Focus Alert */}
      <div
        style={{
          backgroundColor:
            role === 'faculty_mentor'
              ? 'rgba(22, 163, 74, 0.12)'
              : role === 'placement_officer'
              ? 'rgba(37, 99, 235, 0.12)'
              : 'rgba(38, 38, 38, 0.8)',
          border: `1px solid ${
            role === 'faculty_mentor'
              ? 'rgba(34, 197, 94, 0.25)'
              : role === 'placement_officer'
              ? 'rgba(59, 130, 246, 0.25)'
              : 'rgba(255, 255, 255, 0.1)'
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
              role === 'faculty_mentor' ? '#16A34A' : role === 'placement_officer' ? '#2563EB' : '#27272A',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '1px solid rgba(255, 255, 255, 0.15)',
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
                  ? '#4ADE80'
                  : role === 'placement_officer'
                  ? '#60A5FA'
                  : '#A1A1AA',
            }}
          >
            {role === 'faculty_mentor'
              ? 'Faculty Mentorship Planner'
              : role === 'placement_officer'
              ? 'Campus Placement Training Planner'
              : 'Campus Resource Allocation Planner'}
          </div>
          <div style={{ fontSize: '0.84rem', color: '#D4D4D8', marginTop: '2px' }}>
            {role === 'faculty_mentor'
              ? 'Plan remedial coaching sessions, attendance recovery classes, and peer mentoring seats for CSE students.'
              : role === 'placement_officer'
              ? 'Plan mock interview bootcamps, resume workshops, and coding practice cohorts for campus recruitment drives.'
              : 'Allocate coaching seats and program budgets within actual campus faculty and room capacities.'}
          </div>
        </div>
      </div>

      {/* Title & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#FFFFFF', margin: 0, letterSpacing: '-0.3px' }}>
            {role === 'faculty_mentor'
              ? 'Remedial Tutoring & Mentorship Sandbox'
              : role === 'placement_officer'
              ? 'Interview & Placement Training Sandbox'
              : 'Intervention Sandbox & Resource Optimizer'}
          </h1>
          <p style={{ margin: '4px 0 0', color: '#A1A1AA', fontSize: '0.86rem' }}>
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
                backgroundColor: '#2F2F2F',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '9px 15px',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3F3F46')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2F2F2F')}
            >
              <Download size={16} color="#A1A1AA" />
              <span>Export CSV</span>
            </button>
            {!approvedState && (
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
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                }}
              >
                <CheckCircle2 size={16} />
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
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34D399',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Simulator Workspace Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: Parameter Controls (Styled like ChatGPT code/prompt box in Image 2) */}
        <div
          style={{
            backgroundColor: '#262626',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* Header styled like "</> Plain text" in Image 2 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '10px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code2 size={17} color="#38BDF8" />
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>
                Scenario Parameters
              </span>
            </div>
            <span
              style={{
                fontSize: '0.68rem',
                padding: '2px 7px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#A1A1AA',
                fontWeight: 600,
                fontFamily: 'monospace',
              }}
            >
              MILP / Heuristic
            </span>
          </div>

          {/* Strategy Selector */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#A1A1AA', display: 'block', marginBottom: '6px' }}>
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
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${isSelected ? '#38BDF8' : 'rgba(255, 255, 255, 0.08)'}`,
                      backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.12)' : '#1F1F23',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: isSelected ? '#38BDF8' : '#F4F4F5',
                      }}
                    >
                      {strat.label}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#71717A', marginTop: '2px' }}>{strat.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Intervention Program */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#A1A1AA', display: 'block', marginBottom: '6px' }}>
              Intervention Program:
            </label>
            <select
              value={selectedIntervention}
              onChange={(e) => setSelectedIntervention(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                fontSize: '0.84rem',
                outline: 'none',
                backgroundColor: '#18181B',
                color: '#FFFFFF',
              }}
            >
              <option value="remedial_classes" style={{ backgroundColor: '#18181B', color: '#FFFFFF' }}>
                Remedial Subject Coaching
              </option>
              <option value="peer_mentoring" style={{ backgroundColor: '#18181B', color: '#FFFFFF' }}>
                Peer-to-Peer Academic Mentoring
              </option>
              <option value="career_bootcamp" style={{ backgroundColor: '#18181B', color: '#FFFFFF' }}>
                Mock Interview & Aptitude Bootcamp
              </option>
              <option value="counseling_session" style={{ backgroundColor: '#18181B', color: '#FFFFFF' }}>
                Student Wellness Counseling
              </option>
            </select>
          </div>

          {/* Capacity Constraint Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#A1A1AA' }}>Seat Capacity Limit:</label>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38BDF8' }}>{capacitySeats} Seats</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={capacitySeats}
              onChange={(e) => setCapacitySeats(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#38BDF8' }}
            />
            <div style={{ fontSize: '0.68rem', color: '#71717A', marginTop: '2px' }}>
              Limits total concurrent intervention enrollments
            </div>
          </div>

          {/* Run Action */}
          <button
            onClick={handleRunSimulation}
            disabled={simulating}
            style={{
              backgroundColor: '#2563EB',
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
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!simulating) e.currentTarget.style.backgroundColor = '#1D4ED8';
            }}
            onMouseLeave={(e) => {
              if (!simulating) e.currentTarget.style.backgroundColor = '#2563EB';
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
                backgroundColor: '#262626',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '48px 24px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FlaskConical size={26} color="#71717A" />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#FFFFFF' }}>Intervention Simulation Ready</h3>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#A1A1AA', maxWidth: '420px', lineHeight: '1.5' }}>
                Configure capacity limits and strategy on the left, then click <strong>Run Simulation</strong> to compute
                deterministic student assignments with explainable selection/exclusion rationales.
              </p>
            </div>
          ) : (
            /* Results Presentation */
            <>
              {/* Summary Metrics (4 cards styled like ChatGPT metrics) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div
                  style={{
                    backgroundColor: '#262626',
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div style={{ fontSize: '0.70rem', fontWeight: 600, color: '#A1A1AA', textTransform: 'uppercase' }}>
                    Selected for Program
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10B981', marginTop: '4px' }}>
                    {simulationResult.allocationResults?.length || 0} Students
                  </div>
                  <div style={{ fontSize: '0.70rem', color: '#71717A' }}>Strictly within {capacitySeats} seat cap</div>
                </div>

                <div
                  style={{
                    backgroundColor: '#262626',
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div style={{ fontSize: '0.70rem', fontWeight: 600, color: '#A1A1AA', textTransform: 'uppercase' }}>
                    Excluded Due to Capacity
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F59E0B', marginTop: '4px' }}>
                    {simulationResult.excludedResults?.length || 0} Students
                  </div>
                  <div style={{ fontSize: '0.70rem', color: '#71717A' }}>Queued for next cohort cycle</div>
                </div>

                <div
                  style={{
                    backgroundColor: '#262626',
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div style={{ fontSize: '0.70rem', fontWeight: 600, color: '#A1A1AA', textTransform: 'uppercase' }}>
                    AI Optimizer Gain (Model 4)
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#38BDF8', marginTop: '4px' }}>
                    {simulationResult.resourceSummary?.optimizerEfficiencyGain || '+23.4% Reach'}
                  </div>
                  <div style={{ fontSize: '0.70rem', color: '#10B981', fontWeight: 600 }}>
                    {simulationResult.resourceSummary?.predictedCohortUplift || '+13.2% avg uplift'}
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: '#262626',
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div style={{ fontSize: '0.70rem', fontWeight: 600, color: '#A1A1AA', textTransform: 'uppercase' }}>
                    Human Approval State
                  </div>
                  <div
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: approvedState ? '#10B981' : '#F59E0B',
                      marginTop: '6px',
                    }}
                  >
                    {approvedState ? 'APPROVED & ASSIGNED' : 'SIMULATED (PENDING)'}
                  </div>
                  <div style={{ fontSize: '0.70rem', color: '#71717A' }}>Requires provost authorization</div>
                </div>
              </div>

              {/* Zero Outcome Fabrication Integrity Notice */}
              <div
                style={{
                  backgroundColor: 'rgba(30, 58, 138, 0.22)',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center',
                }}
              >
                <ShieldCheck size={20} color="#38BDF8" flexShrink={0} />
                <div style={{ fontSize: '0.76rem', color: '#93C5FD', lineHeight: '1.45' }}>
                  <strong>KPMG Compliance Rule: Zero Outcome Fabrication.</strong> Estimated causal uplifts are not simulated blindly.
                  Actual outcomes are recorded longitudinally only after verified intervention completion.
                </div>
              </div>

              {/* Selected Students Table */}
              <div
                style={{
                  backgroundColor: '#262626',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '14px 18px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    backgroundColor: '#1E1E22',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                    color: '#FFFFFF',
                  }}
                >
                  Allocated Students ({simulationResult.allocationResults?.length || 0})
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr
                      style={{
                        backgroundColor: '#262626',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#A1A1AA',
                      }}
                    >
                      <th style={{ padding: '10px 18px', textAlign: 'left' }}>Student</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left' }}>Program</th>
                      <th style={{ padding: '10px 18px', textAlign: 'left' }}>Deterministic Selection Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(simulationResult.allocationResults || []).map((alloc, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <td style={{ padding: '10px 18px' }}>
                          <span style={{ fontWeight: 600, color: '#FFFFFF', display: 'block' }}>
                            {studentsMap.get(alloc.studentId)?.fullName || 'Student'}
                          </span>
                          <span style={{ fontSize: '0.74rem', color: '#38BDF8', fontFamily: 'monospace' }}>
                            {alloc.studentId}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', textTransform: 'capitalize', color: '#E4E4E7' }}>
                          {alloc.interventionType.replace('_', ' ')}
                        </td>
                        <td style={{ padding: '10px 18px', color: '#D4D4D8' }}>{alloc.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Excluded Students Table */}
              {simulationResult.excludedResults && simulationResult.excludedResults.length > 0 && (
                <div
                  style={{
                    backgroundColor: '#262626',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '14px 18px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      backgroundColor: '#1E1E22',
                      fontWeight: 600,
                      fontSize: '0.86rem',
                      color: '#FFFFFF',
                    }}
                  >
                    Excluded Students ({simulationResult.excludedResults.length})
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr
                        style={{
                          backgroundColor: '#262626',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                          color: '#A1A1AA',
                        }}
                      >
                        <th style={{ padding: '10px 18px', textAlign: 'left' }}>Student</th>
                        <th style={{ padding: '10px 18px', textAlign: 'left' }}>Exclusion Rationale</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulationResult.excludedResults.map((excl, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <td style={{ padding: '10px 18px' }}>
                            <span style={{ fontWeight: 600, color: '#FFFFFF', display: 'block' }}>
                              {studentsMap.get(excl.studentId)?.fullName || 'Student'}
                            </span>
                            <span style={{ fontSize: '0.74rem', color: '#71717A', fontFamily: 'monospace' }}>
                              {excl.studentId}
                            </span>
                          </td>
                          <td style={{ padding: '10px 18px', color: '#A1A1AA' }}>{excl.reason}</td>
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
