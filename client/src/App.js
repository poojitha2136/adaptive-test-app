import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, LayoutDashboard, User, Timer, 
  ChevronRight, ChevronLeft, AlertCircle, CheckCircle2, 
  XCircle, BarChart3, Settings, RefreshCw, LogOut, ShieldCheck
} from 'lucide-react';

const App = () => {
  // Navigation & Auth State
  const [view, setView] = useState('login'); 
  const [userRole, setUserRole] = useState(null); // 'admin' or 'candidate'
  
  // App Logic State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [adminConfig, setAdminConfig] = useState({ 
    skills: 'Python, React', 
    difficulty: 'Medium', 
    numQuestions: 5, 
    timeLimit: 10 
  });
  const [generatedTestId, setGeneratedTestId] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [currentTest, setCurrentTest] = useState(null);
  const [candidateName, setCandidateName] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testResult, setTestResult] = useState(null);

  // YOUR RENDER BACKEND URL
  const API_URL = "https://adaptive-test-app-6.onrender.com/api";

  // --- Auth Handlers ---
  const handlePortalSelect = (role) => {
    setUserRole(role);
    setView(role === 'admin' ? 'admin' : 'candidate-entry');
  };

  const handleLogout = () => {
    setUserRole(null);
    setView('login');
    setGeneratedTestId('');
    setCandidateName('');
    setTestResult(null);
  };

  // --- API Interaction Handlers ---
  const handleCreateTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/create-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminConfig)
      });
      const data = await res.json();
      if (data.testId) setGeneratedTestId(data.testId);
    } catch (err) {
      setError("Backend unreachable. Please wait for server wake-up.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async () => {
    if (!candidateName || !generatedTestId) return setError("Fill in all fields.");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/test/${generatedTestId.toLowerCase()}`);
      if (!res.ok) throw new Error("Invalid Test Code.");
      const data = await res.json();
      setCurrentTest(data);
      setTimeLeft(data.timeLimit * 60);
      setView('test');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTest = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/submit-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: currentTest.id,
          candidateName,
          answers
        })
      });
      const data = await res.json();
      setTestResult(data);
      setView('results');
    } catch (err) {
      setError("Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/submissions`);
      const data = await res.json();
      setSubmissions(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (view === 'test' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (view === 'test' && timeLeft === 0) {
      handleSubmitTest();
    }
  }, [view, timeLeft]);

  useEffect(() => {
    if (view === 'admin') fetchSubmissions();
  }, [view]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header (Hidden on Login) */}
        {view !== 'login' && (
          <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogout}>
              <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <ClipboardCheck size={20} />
              </div>
              <h1 className="text-lg font-bold">SkillAssess <span className="text-indigo-600">AI</span></h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden md:inline text-xs font-black text-slate-400 uppercase tracking-widest">
                {userRole} Portal
              </span>
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition">
                <LogOut size={16} /> Logout
              </button>
            </div>
          </header>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-red-700">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <XCircle size={18} className="cursor-pointer" onClick={() => setError(null)} />
          </div>
        )}

        {/* --- VIEW: LOGIN / PORTAL SELECTION --- */}
        {view === 'login' && (
          <div className="py-20 animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-slate-800 mb-4">Welcome to SkillAssess</h2>
              <p className="text-slate-500">Please select your destination to continue</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div 
                onClick={() => handlePortalSelect('admin')}
                className="bg-white p-10 rounded-[2.5rem] border-2 border-transparent hover:border-indigo-600 cursor-pointer transition-all shadow-xl hover:shadow-2xl group text-center"
              >
                <div className="bg-indigo-100 w-20 h-20 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto mb-6 group-hover:bg-indigo-600 group-hover:text-white transition">
                  <ShieldCheck size={40} />
                </div>
                <h3 className="text-2xl font-bold mb-3">Recruiter</h3>
                <p className="text-slate-500 text-sm">Create assessments and monitor candidate performance in real-time.</p>
              </div>

              <div 
                onClick={() => handlePortalSelect('candidate')}
                className="bg-white p-10 rounded-[2.5rem] border-2 border-transparent hover:border-emerald-500 cursor-pointer transition-all shadow-xl hover:shadow-2xl group text-center"
              >
                <div className="bg-emerald-100 w-20 h-20 rounded-3xl flex items-center justify-center text-emerald-600 mx-auto mb-6 group-hover:bg-emerald-500 group-hover:text-white transition">
                  <User size={40} />
                </div>
                <h3 className="text-2xl font-bold mb-3">Candidate</h3>
                <p className="text-slate-500 text-sm">Enter your invitation code to start your technical assessment.</p>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW: ADMIN DASHBOARD --- */}
        {view === 'admin' && (
          <div className="grid md:grid-cols-3 gap-8 animate-in slide-in-from-right-4 duration-500">
            <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Settings size={20} className="text-indigo-600" /> Create Test
              </h3>
              <div className="space-y-4">
                <input 
                  className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-100 border-slate-200"
                  placeholder="Skills (e.g. Java, AWS)"
                  value={adminConfig.skills}
                  onChange={e => setAdminConfig({...adminConfig, skills: e.target.value})}
                />
                <select 
                  className="w-full border rounded-lg p-3 outline-none border-slate-200"
                  value={adminConfig.difficulty}
                  onChange={e => setAdminConfig({...adminConfig, difficulty: e.target.value})}
                >
                  <option>Easy</option><option>Medium</option><option>Hard</option>
                </select>
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" className="border rounded-lg p-3 border-slate-200" value={adminConfig.numQuestions} onChange={e => setAdminConfig({...adminConfig, numQuestions: e.target.value})} />
                  <input type="number" className="border rounded-lg p-3 border-slate-200" value={adminConfig.timeLimit} onChange={e => setAdminConfig({...adminConfig, timeLimit: e.target.value})} />
                </div>
                <button 
                  onClick={handleCreateTest}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg"
                >
                  {loading ? 'Processing...' : 'Generate Code'}
                </button>
                {generatedTestId && (
                  <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
                    <p className="text-[10px] font-black text-indigo-400 uppercase">Access Code</p>
                    <code className="text-xl font-mono font-black text-indigo-900 uppercase tracking-widest">{generatedTestId}</code>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <BarChart3 size={20} className="text-indigo-600" /> Results
                </h3>
                <RefreshCw size={18} className="text-slate-400 cursor-pointer" onClick={fetchSubmissions} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-xs font-bold text-slate-400 uppercase">
                    <tr className="border-b"><th className="pb-3">Candidate</th><th className="pb-3">Score</th><th className="pb-3">Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {submissions.map((sub, i) => (
                      <tr key={i} className="text-sm">
                        <td className="py-4 font-semibold">{sub.candidateName}</td>
                        <td className="py-4">{sub.score}/{sub.total} ({sub.percentage}%)</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${sub.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{sub.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW: CANDIDATE ENTRY --- */}
        {view === 'candidate-entry' && (
          <div className="max-w-md mx-auto py-12 animate-in slide-in-from-left-4 duration-500">
            <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl text-center">
              <h3 className="text-2xl font-bold mb-6">Enter Test</h3>
              <div className="space-y-4">
                <input className="w-full border rounded-xl p-4 border-slate-200" placeholder="Your Name" value={candidateName} onChange={e => setCandidateName(e.target.value)} />
                <input className="w-full border rounded-xl p-4 border-slate-200 font-mono text-center tracking-widest uppercase" placeholder="TEST-CODE" value={generatedTestId} onChange={e => setGeneratedTestId(e.target.value)} />
                <button onClick={handleStartTest} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg">Start Assessment</button>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW: TEST INTERFACE --- */}
        {view === 'test' && currentTest && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-indigo-600 text-white p-6 rounded-2xl shadow-lg sticky top-4 z-10">
              <span className="text-2xl font-mono font-black">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
              <button onClick={handleSubmitTest} className="bg-white text-indigo-600 px-6 py-2 rounded-xl font-black text-sm uppercase">Submit</button>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm min-h-[400px]">
              <div className="flex justify-between mb-8">
                <span className="text-xs font-black text-slate-400 uppercase">Question {currentQuestionIndex + 1} / {currentTest.questions.length}</span>
                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">{currentTest.questions[currentQuestionIndex].skill}</span>
              </div>
              <h2 className="text-2xl font-bold mb-10">{currentTest.questions[currentQuestionIndex].question}</h2>
              <div className="space-y-3">
                {currentTest.questions[currentQuestionIndex].options.map((opt, i) => (
                  <label key={i} className={`flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all ${answers[currentTest.questions[currentQuestionIndex].id] === opt ? 'border-indigo-600 bg-indigo-50' : 'border-slate-50'}`}>
                    <input type="radio" className="hidden" checked={answers[currentTest.questions[currentQuestionIndex].id] === opt} onChange={() => setAnswers({...answers, [currentTest.questions[currentQuestionIndex].id]: opt})} />
                    <span className="font-bold text-slate-700">{opt}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-between mt-12 pt-8 border-t border-slate-50">
                <button disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(prev => prev - 1)} className="font-bold text-slate-400 disabled:opacity-0">Back</button>
                <button disabled={currentQuestionIndex === currentTest.questions.length - 1} onClick={() => setCurrentQuestionIndex(prev => prev + 1)} className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-xl font-bold">Next</button>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW: RESULTS --- */}
        {view === 'results' && testResult && (
          <div className="max-w-lg mx-auto py-12">
            <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-2xl text-center">
              <CheckCircle2 size={60} className="text-green-500 mx-auto mb-6" />
              <h2 className="text-4xl font-black mb-4">Completed!</h2>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-6 rounded-3xl">
                  <p className="text-xs font-black text-slate-400 uppercase">Score</p>
                  <p className="text-4xl font-black">{testResult.result.score}/{testResult.result.total}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl">
                  <p className="text-xs font-black text-slate-400 uppercase">Grade</p>
                  <p className="text-4xl font-black text-indigo-600">{testResult.result.percentage}%</p>
                </div>
              </div>
              <button onClick={handleLogout} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black">Exit Portal</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;