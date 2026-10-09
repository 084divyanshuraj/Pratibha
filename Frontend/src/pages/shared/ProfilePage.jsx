import React, { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  GraduationCap,
  MapPin,
  Globe,
  Camera,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
  Shield,
  Award,
  BookOpen,
  Calendar,
  X,
  Plus,
  ZoomIn,
  ZoomOut,
  Sliders,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './ProfilePage.css';

// Preset avatar options for quick selection
const PRESET_AVATARS = [
  { label: 'Dr. Sunita Rao (Provost)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80' },
  { label: 'Prof. Rajesh Kumar (Faculty)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80' },
  { label: 'Vikram Malhotra (TPO)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80' },
  { label: 'Aarav Sharma (Student Tech)', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80' },
  { label: 'Scholar / Engineer', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&auto=format&fit=crop&q=80' },
  { label: 'Executive Leader', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80' },
];

export default function ProfilePage() {
  const { currentUser, updateUserProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const isStudent = currentUser?.portal === 'student' || currentUser?.role === 'student';
  const isOnboarding = searchParams.get('onboarding') === 'true' || currentUser?.isNewUser;

  // Form State
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [officeLocation, setOfficeLocation] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [education, setEducation] = useState('');
  const [officeHours, setOfficeHours] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [github, setGithub] = useState('');

  // Student specific
  const [studentId, setStudentId] = useState('');
  const [program, setProgram] = useState('');
  const [semester, setSemester] = useState('1');
  const [careerGoals, setCareerGoals] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Avatar state
  const [avatar, setAvatar] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoZoom, setPhotoZoom] = useState(1);
  const fileInputRef = useRef(null);

  // UI status
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'professional' | 'links'

  // Initialize data from currentUser
  useEffect(() => {
    if (currentUser) {
      const isDemo =
        currentUser.id?.startsWith('admin') ||
        currentUser.id?.startsWith('faculty') ||
        currentUser.id?.startsWith('placement') ||
        currentUser.id?.startsWith('student') ||
        currentUser.email === 'admin@example.edu' ||
        currentUser.email === 'student@example.edu' ||
        currentUser.email === 'faculty@example.edu' ||
        currentUser.email === 'placement@example.edu';

      const isFreshUser = currentUser.isNewUser || (!isDemo && !currentUser.department);

      setDisplayName(currentUser.name || currentUser.displayName || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || (isFreshUser ? '' : '+91 98765 43210'));
      setBio(
        currentUser.bio ||
          (isFreshUser
            ? ''
            : isStudent
            ? 'Passionate 3rd year Computer Science undergraduate focusing on distributed systems, data structures, and modern cloud deployment.'
            : 'Dedicated academic leader steering outcome-based education, predictive institutional analytics, and student mentorship initiatives.')
      );
      setDepartment(currentUser.department || (isFreshUser ? '' : 'Computer Science & Engineering'));
      setDesignation(
        currentUser.designation ||
          currentUser.roleLabel ||
          (isFreshUser ? (isStudent ? 'Enrolled Student' : 'Institutional Staff') : (isStudent ? 'B.Tech Student Candidate' : 'Senior Faculty / Administrator'))
      );
      setOfficeLocation(currentUser.officeLocation || (isFreshUser ? '' : 'Campus Block-B, Room 304'));
      setSpecialization(currentUser.specialization || (isFreshUser ? '' : (isStudent ? 'Algorithms, Web Architecture, Machine Learning' : 'Curriculum Governance & Student Success')));
      setEducation(currentUser.education || (isFreshUser ? '' : (isStudent ? 'B.Tech in Computer Science (2022-2026)' : 'Ph.D. in Computer Engineering')));
      setOfficeHours(currentUser.officeHours || (isFreshUser ? '' : 'Mon–Thu: 3:00 PM – 5:00 PM'));
      setLinkedIn(currentUser.linkedIn || (isFreshUser ? '' : 'https://linkedin.com/in/pratibha-scholar'));
      setGithub(currentUser.github || (isFreshUser ? '' : 'https://github.com/pratibha-edu'));
      setStudentId(currentUser.studentId || (isFreshUser ? '' : (isStudent ? 'STU_0001' : 'FAC-CSE-028')));
      setProgram(currentUser.program || (isFreshUser ? (isStudent ? 'B.Tech' : '') : 'B.Tech CSE'));
      setSemester(currentUser.semester || (isFreshUser ? '1' : '5'));
      setCareerGoals(currentUser.careerGoals || (isFreshUser ? '' : 'Software Development Engineer at Tier-1 Tech Firm'));
      setSkills(currentUser.skills && currentUser.skills.length > 0 ? currentUser.skills : (isFreshUser ? [] : ['React', 'Python', 'Algorithms', 'System Design', 'SQL', 'Git']));
      setAvatar(currentUser.avatar || '');
    }
  }, [currentUser, isStudent]);

  // Handle Photo Upload from Local Disk
  const handlePhotoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (.png, .jpg, .jpeg, .webp).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result);
      setPhotoZoom(1);
    };
    reader.readAsDataURL(file);
  };

  // Apply chosen photo
  const handleApplyPhoto = () => {
    if (photoPreview) {
      setAvatar(photoPreview);
      setShowPhotoModal(false);
      setSuccessMsg('Profile photo updated! Click "Save Changes" to persist in database.');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  // Add a new skill chip
  const handleAddSkill = (e) => {
    if (e) e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkillInput('');
    }
  };

  // Remove a skill chip
  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Save changes to backend MongoDB & AuthContext
  const handleSaveChanges = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      displayName: displayName.trim(),
      name: displayName.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
      department: department.trim(),
      designation: designation.trim(),
      officeLocation: officeLocation.trim(),
      specialization: specialization.trim(),
      education: education.trim(),
      officeHours: officeHours.trim(),
      linkedIn: linkedIn.trim(),
      github: github.trim(),
      avatar: avatar || null,
      skills,
      studentId: studentId.trim(),
      program: program.trim(),
      semester,
      careerGoals: careerGoals.trim(),
    };

    try {
      await updateUserProfile(payload);
      setSuccessMsg('✓ Profile and professional details updated successfully in database!');
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form to active currentUser values
  const handleResetForm = () => {
    if (currentUser) {
      setDisplayName(currentUser.name || currentUser.displayName || '');
      setPhone(currentUser.phone || '');
      setBio(currentUser.bio || '');
      setDepartment(currentUser.department || '');
      setAvatar(currentUser.avatar || '');
      setSuccessMsg('Changes reverted.');
      setTimeout(() => setSuccessMsg(''), 2500);
    }
  };

  return (
    <div className="pratibha-profile-page">
      {/* 1. HERO PROFILE BANNER */}
      <div className="profile-hero-card">
        <div className="profile-hero-backdrop" />
        <div className="profile-hero-content">
          <div className="profile-avatar-wrapper">
            {avatar ? (
              <img
                src={avatar}
                alt={displayName}
                className="profile-avatar-img"
                style={{ transform: `scale(${photoZoom})` }}
              />
            ) : (
              <div className="profile-avatar-fallback">
                {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <button
              type="button"
              className="profile-avatar-edit-btn"
              onClick={() => {
                setPhotoPreview(avatar || PRESET_AVATARS[0].url);
                setShowPhotoModal(true);
              }}
              title="Upload & Adjust Profile Photo"
              aria-label="Upload photo"
            >
              <Camera size={16} />
            </button>
          </div>

          <div className="profile-hero-info">
            <div className="profile-hero-badge-row">
              <span className="profile-role-pill">
                {isStudent ? <GraduationCap size={13} /> : <Shield size={13} />}
                <span>{currentUser?.roleLabel || (isStudent ? 'Registered Student' : 'Institutional Staff')}</span>
              </span>
              <span className="profile-status-pill">
                <CheckCircle2 size={13} />
                <span>Verified Account</span>
              </span>
              <span className="profile-id-pill">
                <span>ID: {studentId || currentUser?.studentId || (isStudent ? 'STU_NEW' : 'USR_001')}</span>
              </span>
            </div>

            <h1 className="profile-name-title">{displayName || 'User Profile'}</h1>
            <p className="profile-headline-text">
              {designation} • {department}
            </p>
          </div>

          <div className="profile-hero-actions">
            <button
              type="button"
              className="profile-save-top-btn"
              onClick={handleSaveChanges}
              disabled={isSaving}
            >
              <Save size={15} />
              <span>{isSaving ? 'Saving to Database...' : 'Save Profile'}</span>
            </button>
            <Link
              to={isStudent ? '/student/portal' : '/institution/overview'}
              className="profile-dash-link-btn"
              title="Navigate to Dashboard"
            >
              <span>{isStudent ? 'Go to Student Dashboard' : 'Go to Overview'}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. ALERTS */}
      {successMsg && (
        <div className="profile-alert success" role="alert">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="profile-alert error" role="alert">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ONBOARDING WELCOME BANNER FOR NEW USERS */}
      {isOnboarding && (
        <div className="profile-onboarding-banner" role="region" aria-label="Onboarding Instructions">
          <div className="onboarding-banner-icon">
            <Sparkles size={24} />
          </div>
          <div className="onboarding-banner-content">
            <h3 className="onboarding-banner-title">
              Welcome to Pratibha! Complete Your Academic Profile
            </h3>
            <p className="onboarding-banner-desc">
              Please enter your <strong>Branch / Department</strong>, <strong>Degree Program</strong>, <strong>Current Semester</strong>, and <strong>Student Roll Number</strong> below. Once saved, your personalized success radar and predictive risk analytics will activate automatically.
            </p>
          </div>
        </div>
      )}

      {/* 3. NAVIGATION TABS */}
      <div className="profile-tabs-bar" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'basic'}
          className={`profile-tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          <User size={15} />
          <span>Basic Information</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'professional'}
          className={`profile-tab-btn ${activeTab === 'professional' ? 'active' : ''}`}
          onClick={() => setActiveTab('professional')}
        >
          {isStudent ? <GraduationCap size={15} /> : <Briefcase size={15} />}
          <span>{isStudent ? 'Academic & Career Readiness' : 'Institutional & Faculty Scope'}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'links'}
          className={`profile-tab-btn ${activeTab === 'links' ? 'active' : ''}`}
          onClick={() => setActiveTab('links')}
        >
          <Globe size={15} />
          <span>Online Presence & Links</span>
        </button>
      </div>

      {/* 4. MAIN FORM BODY */}
      <form onSubmit={handleSaveChanges} className="profile-form-body">
        {/* TAB 1: BASIC INFORMATION */}
        {activeTab === 'basic' && (
          <div className="profile-section-card">
            <div className="profile-section-header">
              <User size={18} className="profile-section-icon" />
              <div>
                <h3 className="profile-section-title">Personal & Contact Details</h3>
                <p className="profile-section-subtitle">Manage your public display name, email, and campus contact details.</p>
              </div>
            </div>

            <div className="profile-fields-grid">
              <div className="profile-input-group">
                <label htmlFor="pfDisplayName">Full Display Name *</label>
                <div className="profile-input-box">
                  <User size={16} className="profile-field-icon" />
                  <input
                    type="text"
                    id="pfDisplayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              <div className="profile-input-group">
                <label htmlFor="pfEmail">Institutional Email (Verified)</label>
                <div className="profile-input-box disabled">
                  <Mail size={16} className="profile-field-icon" />
                  <input
                    type="email"
                    id="pfEmail"
                    value={email}
                    disabled
                    title="Institutional email cannot be altered directly"
                  />
                </div>
              </div>

              <div className="profile-input-group">
                <label htmlFor="pfPhone">Contact Phone Number</label>
                <div className="profile-input-box">
                  <Phone size={16} className="profile-field-icon" />
                  <input
                    type="tel"
                    id="pfPhone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>
              </div>

              <div className="profile-input-group">
                <label htmlFor="pfDept">
                  {isStudent ? 'Branch / Engineering Department *' : 'Primary Department / Division *'}
                </label>
                <div className="profile-input-box">
                  <Building2 size={16} className="profile-field-icon" />
                  <input
                    type="text"
                    id="pfDept"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                    placeholder={
                      isStudent
                        ? 'e.g. Computer Science, Information Technology, ECE'
                        : 'e.g. Computer Science & Engineering'
                    }
                  />
                </div>
              </div>

              {isStudent && (
                <div className="profile-input-group">
                  <label htmlFor="pfStudentId">Student Roll No. / Institutional ID *</label>
                  <div className="profile-input-box">
                    <Shield size={16} className="profile-field-icon" />
                    <input
                      type="text"
                      id="pfStudentId"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g. 2024CS104 / STU-0042"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="profile-input-group full-width" style={{ marginTop: '1rem' }}>
              <label htmlFor="pfBio">Professional Bio & Statement</label>
              <textarea
                id="pfBio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your academic mission, mentorship philosophy, or technical interests..."
                className="profile-textarea"
              />
            </div>
          </div>
        )}

        {/* TAB 2: PROFESSIONAL / INSTITUTIONAL SCOPE */}
        {activeTab === 'professional' && (
          <div className="profile-section-card">
            <div className="profile-section-header">
              {isStudent ? (
                <GraduationCap size={18} className="profile-section-icon" />
              ) : (
                <Briefcase size={18} className="profile-section-icon" />
              )}
              <div>
                <h3 className="profile-section-title">
                  {isStudent ? 'Academic Standing & Career Goals' : 'Institutional Credentials & Office Scope'}
                </h3>
                <p className="profile-section-subtitle">
                  {isStudent
                    ? 'Track your degree, technical specializations, and career objectives.'
                    : 'Designate your office cabin, academic qualification, and consultation schedule.'}
                </p>
              </div>
            </div>

            <div className="profile-fields-grid">
              {/* Common Designation / Program */}
              <div className="profile-input-group">
                <label htmlFor="pfDesignation">
                  {isStudent ? 'Enrolled Degree Program' : 'Institutional Designation / Title'}
                </label>
                <div className="profile-input-box">
                  <Briefcase size={16} className="profile-field-icon" />
                  <input
                    type="text"
                    id="pfDesignation"
                    value={isStudent ? (program || designation) : designation}
                    onChange={(e) => {
                      if (isStudent) {
                        setProgram(e.target.value);
                        setDesignation(e.target.value);
                      } else {
                        setDesignation(e.target.value);
                      }
                    }}
                    placeholder={isStudent ? 'e.g. B.Tech Computer Science / BCA / MCA' : 'Associate Professor & HOD'}
                  />
                </div>
              </div>

              <div className="profile-input-group">
                <label htmlFor="pfSpecialization">
                  {isStudent ? 'Academic Track / Specialization' : 'Research Area / Domain Specialization'}
                </label>
                <div className="profile-input-box">
                  <Award size={16} className="profile-field-icon" />
                  <input
                    type="text"
                    id="pfSpecialization"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Distributed Cloud & AI Systems"
                  />
                </div>
              </div>

              <div className="profile-input-group">
                <label htmlFor="pfEducation">
                  {isStudent ? 'Expected Graduation Year' : 'Highest Academic Qualification'}
                </label>
                <div className="profile-input-box">
                  <GraduationCap size={16} className="profile-field-icon" />
                  <input
                    type="text"
                    id="pfEducation"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder={isStudent ? 'Class of 2026' : 'Ph.D. in Computer Science'}
                  />
                </div>
              </div>

              {!isStudent ? (
                <>
                  <div className="profile-input-group">
                    <label htmlFor="pfOffice">Office / Cabin Location</label>
                    <div className="profile-input-box">
                      <MapPin size={16} className="profile-field-icon" />
                      <input
                        type="text"
                        id="pfOffice"
                        value={officeLocation}
                        onChange={(e) => setOfficeLocation(e.target.value)}
                        placeholder="Block A, Room 304"
                      />
                    </div>
                  </div>

                  <div className="profile-input-group">
                    <label htmlFor="pfHours">Mentorship & Consultation Hours</label>
                    <div className="profile-input-box">
                      <Calendar size={16} className="profile-field-icon" />
                      <input
                        type="text"
                        id="pfHours"
                        value={officeHours}
                        onChange={(e) => setOfficeHours(e.target.value)}
                        placeholder="Tue & Thu: 3:00 PM – 5:00 PM"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="profile-input-group">
                    <label htmlFor="pfCareer">Career Objective / Target Role</label>
                    <div className="profile-input-box">
                      <Briefcase size={16} className="profile-field-icon" />
                      <input
                        type="text"
                        id="pfCareer"
                        value={careerGoals}
                        onChange={(e) => setCareerGoals(e.target.value)}
                        placeholder="e.g. Software Engineer (Full Stack / Systems)"
                      />
                    </div>
                  </div>

                  <div className="profile-input-group">
                    <label htmlFor="pfSemester">Current Semester</label>
                    <div className="profile-input-box">
                      <BookOpen size={16} className="profile-field-icon" />
                      <select
                        id="pfSemester"
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="profile-select"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <option key={s} value={s}>
                            Semester {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Student Skills Tag List */}
            {isStudent && (
              <div style={{ marginTop: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Technical Skills & Competencies (Shown on Profile & Placement Matrix)
                </label>
                <div className="profile-skills-tags-wrap">
                  {skills.map((skill) => (
                    <span key={skill} className="profile-skill-chip">
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="profile-skill-remove-btn"
                        title="Remove skill"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="profile-add-skill-row">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    placeholder="Add a new skill (e.g. Next.js, Docker, Java)..."
                    className="profile-add-skill-input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="profile-add-skill-btn"
                  >
                    <Plus size={14} />
                    <span>Add Skill</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ONLINE PRESENCE & LINKS */}
        {activeTab === 'links' && (
          <div className="profile-section-card">
            <div className="profile-section-header">
              <Globe size={18} className="profile-section-icon" />
              <div>
                <h3 className="profile-section-title">Online Profiles & External Portfolios</h3>
                <p className="profile-section-subtitle">Link your verified professional profiles for academic accreditation or recruitment drives.</p>
              </div>
            </div>

            <div className="profile-fields-grid">
              <div className="profile-input-group">
                <label htmlFor="pfLinkedIn">LinkedIn Profile URL</label>
                <div className="profile-input-box">
                  <Globe size={16} className="profile-field-icon" />
                  <input
                    type="url"
                    id="pfLinkedIn"
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                {linkedIn && (
                  <a
                    href={linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-link-preview"
                  >
                    ↗ Verify LinkedIn Link
                  </a>
                )}
              </div>

              <div className="profile-input-group">
                <label htmlFor="pfGithub">GitHub / Code Portfolio URL</label>
                <div className="profile-input-box">
                  <Globe size={16} className="profile-field-icon" />
                  <input
                    type="url"
                    id="pfGithub"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/username"
                  />
                </div>
                {github && (
                  <a
                    href={github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-link-preview"
                  >
                    ↗ Verify GitHub Repository
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FORM BOTTOM ACTION BAR */}
        <div className="profile-form-footer">
          <button
            type="button"
            className="profile-btn secondary"
            onClick={handleResetForm}
            disabled={isSaving}
          >
            <RotateCcw size={15} />
            <span>Reset Form</span>
          </button>

          <button
            type="submit"
            className="profile-btn primary"
            disabled={isSaving}
          >
            <Save size={15} />
            <span>{isSaving ? 'Updating MongoDB...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>

      {/* DIRECT DASHBOARD NAVIGATION ACTION BAR */}
      <div className="profile-dashboard-action-bar">
        <Link
          to={isStudent ? '/student/portal' : '/institution/overview'}
          className="profile-goto-dashboard-btn"
        >
          <span>Proceed to {isStudent ? 'Student Success Radar Dashboard' : 'Institution Overview Dashboard'}</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* =========================================================================
          PHOTO UPLOAD & ADJUSTMENT MODAL
          ========================================================================= */}
      {showPhotoModal && (
        <div className="profile-photo-modal-overlay" role="dialog" aria-modal="true">
          <div className="profile-photo-modal-card">
            <div className="profile-photo-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={18} color="#1A73E8" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0F172A', fontWeight: 700 }}>
                  Upload & Adjust Profile Photo
                </h3>
              </div>
              <button
                type="button"
                className="profile-modal-close-btn"
                onClick={() => setShowPhotoModal(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="profile-photo-modal-body">
              {/* Preview Canvas with Zoom */}
              <div className="profile-crop-preview-box">
                <div className="profile-crop-circular-frame">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Crop Preview"
                      style={{
                        transform: `scale(${photoZoom})`,
                        transition: 'transform 0.15s ease-out',
                      }}
                    />
                  ) : (
                    <div className="profile-crop-empty">Upload an image</div>
                  )}
                </div>
              </div>

              {/* Zoom Scale Slider */}
              <div className="profile-zoom-controls">
                <ZoomOut size={16} color="#64748B" />
                <input
                  type="range"
                  min="0.8"
                  max="2.2"
                  step="0.05"
                  value={photoZoom}
                  onChange={(e) => setPhotoZoom(parseFloat(e.target.value))}
                  className="profile-zoom-slider"
                  aria-label="Adjust photo scale"
                />
                <ZoomIn size={16} color="#64748B" />
                <span style={{ fontSize: '0.78rem', color: '#64748B', minWidth: '42px', fontWeight: 600 }}>
                  {Math.round(photoZoom * 100)}%
                </span>
              </div>

              {/* Upload from Local Device */}
              <div className="profile-upload-action-row">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  style={{ display: 'none' }}
                  onChange={handlePhotoFileChange}
                />
                <button
                  type="button"
                  className="profile-modal-btn outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={14} />
                  <span>Choose Image File from PC</span>
                </button>
              </div>

              {/* Quick Preset Avatars */}
              <div className="profile-presets-section">
                <div className="profile-presets-title">Or choose from curated platform presets:</div>
                <div className="profile-presets-grid">
                  {PRESET_AVATARS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      className={`profile-preset-thumb-btn ${photoPreview === preset.url ? 'active' : ''}`}
                      onClick={() => {
                        setPhotoPreview(preset.url);
                        setPhotoZoom(1);
                      }}
                      title={preset.label}
                    >
                      <img src={preset.url} alt={preset.label} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="profile-photo-modal-footer">
              <button
                type="button"
                className="profile-modal-btn outline"
                onClick={() => setShowPhotoModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="profile-modal-btn primary"
                onClick={handleApplyPhoto}
                disabled={!photoPreview}
              >
                <CheckCircle2 size={15} />
                <span>Apply Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
