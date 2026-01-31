import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, LayoutDashboard, User, Timer, 
  ChevronRight, ChevronLeft, AlertCircle, CheckCircle2, 
  XCircle, BarChart3, Settings, RefreshCw, LogOut, ShieldCheck, Mail, Lock
} from 'lucide-react';

const App = () => {
  const [view, setView] = useState('login'); 
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form States
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  // App Logic States
  const [adminConfig, setAdminConfig] = useState({ skills: 'Python, React', difficulty: 'Medium', numQuestions: 5, timeLimit: 10 });
  const [generatedTestId, setGeneratedTestId] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [currentTest, setCurrentTest] = useState(null);
  const [candidateName, setCandidateName] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testResult, setTestResult] = useState(null);

  const API_URL = "https://adaptive-test-app-6.onrender.com/api";

  const handleLoginSubmit = (e, role) => {
    e.preventDefault();
    if (!formData.email || !formData.password || (role === 'candidate' && !formData.name)) {
      setError("Please fill in all fields.");
      return;
    }
    
    setLoading(true);
    // Simulated delay for realism
    setTimeout(() => {
      setUserRole(role);
      setCandidateName(formData.name);
      setView(role === 'admin' ? 'admin' : 'candidate-entry');
      setLoading(false);
      setError(null);
    }, 1000);
  };

  const handleLogout = () => {
    setUserRole(null);
    setView('login');
    setFormData({ name: '', email: '', password: '' });
  };

  // --- API Handlers (Same as before) ---
  const handleCreateTest = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/create-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminConfig)
      });
      const data = await res.json();
      if (data.testId) setGeneratedTestId(data.testId);
    } catch (err) { setError("Server Wake-up error. Try again."); }
    finally { setLoading(false); }
  };

  const handleStartTest = async () => {
    if (!generatedTestId) return setError("Enter Test Code.");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/test/${generatedTestId.toLowerCase()}`);
      if (!res.ok) throw new Error("Invalid Code.");
      const data = await res.json();
      setCurrentTest(data);
      setTimeLeft(data.timeLimit * 60);
      setView('test');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleSubmitTest = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/submit-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId: currentTest.id, candidateName, answers })
      });
      const data = await res.json();
      setTestResult(data);
      setView('results');
    } catch (err) { setError("Submit failed."); }
    finally { setLoading(false); }
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
    } else if (view === 'test' && timeLeft === 0) handleSubmitTest();
  }, [view, timeLeft]);

  useEffect(() => {
    if (view === 'admin') fetchSubmissions();
  }, [view]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {view !== 'login' && (
          <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogout}>
              <div className="bg-indigo-600 p-2 rounded-lg text-white"><ClipboardCheck size={20} /></div>
              <h1 className="text-lg font-bold">SkillAssess <span className="text-indigo-600">AI</span></h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{userRole} Portal</span>
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition">
                <LogOut size={16} /> Logout
              </button>
            </div>
          </header>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-red-700">
            <div className="flex items-center gap-3"><AlertCircle size={20} /><p className="text-sm font-medium">{error}</p></div>
            <XCircle size={18} className="cursor-pointer" onClick={() => setError(null)} />
          </div>
        )}

        {/* --- VIEW: FULL LOGIN PAGE --- */}
        {view === 'login' && (
          <div className="max-w-4xl mx-auto py-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">Access the Portal</h2>
              <p className="text-slate-500 font-medium">Choose your account type to sign in</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Recruiter Login */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 transition hover:shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-indigo-600 p-3 rounded-2xl text-white"><ShieldCheck size={28} /></div>
                  <h3 className="text-xl font-bold">Recruiter Login</h3>
                </div>
                <form onSubmit={(e) => handleLoginSubmit(e, 'admin')} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 text-slate-400" size={20} />
                    <input type="email" placeholder="Email Address" className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-100" 
                      onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
                    <input type="password" placeholder="Password" className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-100" 
                      onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition">
                    {loading ? 'Authenticating...' : 'Sign In as Admin'}
                  </button>
                </form>
              </div>

              {/* Candidate Login */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 transition hover:shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-emerald-500 p-3 rounded-2xl text-white"><User size={28} /></div>
                  <h3 className="text-xl font-bold">Candidate Entry</h3>
                </div>
                <form onSubmit={(e) => handleLoginSubmit(e, 'candidate')} className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-4 top-4 text-slate-400" size={20} />
                    <input type="text" placeholder="Full Name" className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-100" 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 text-slate-400" size={20} />
                    <input type="email" placeholder="Email Address" className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-100" 
                      onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
                    <input type="password" placeholder="Password" className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-100" 
                      onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  </div>
                  <button type="submit" className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition">
                    {loading ? 'Entering Portal...' : 'Join Assessment'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ... (Existing Views for Admin Dashboard, Candidate-Entry, Test, and Results remain the same) ... */}
        
        {view === 'admin' && (
          <div className="grid md:grid-cols-3 gap-8 animate-in slide-in-from-right-4">
            <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Settings size={20} className="text-indigo-600" /> Create Test</h3>
              <div className="space-y-4">
                <input className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-100 border-slate-200" placeholder="Skills (e.g. Java, AWS)" value={adminConfig.skills} onChange={e => setAdminConfig({...adminConfig, skills: e.target.value})} />
                <select className="w-full border rounded-lg p-3 outline-none border-slate-200" value={adminConfig.difficulty} onChange={e => setAdminConfig({...adminConfig, difficulty: e.target.value})}><option>Easy</option><option>Medium</option><option>Hard</option></select>
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" className="border rounded-lg p-3 border-slate-200" value={adminConfig.numQuestions} onChange={e => setAdminConfig({...adminConfig, numQuestions: e.target.value})} />
                  <input type="number" className="border rounded-lg p-3 border-slate-200" value={adminConfig.timeLimit} onChange={e => setAdminConfig({...adminConfig, timeLimit: e.target.value})} />
                </div>
                <button onClick={handleCreateTest} disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg">{loading ? 'Processing...' : 'Generate Code'}</button>
                {generatedTestId && <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-center"><p className="text-[10px] font-black text-indigo-400 uppercase">Access Code</p><code className="text-xl font-mono font-black text-indigo-900 uppercase tracking-widest">{generatedTestId}</code></div>}
              </div>
            </div>
            <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold flex items-center gap-2"><BarChart3 size={20} className="text-indigo-600" /> Results</h3><RefreshCw size={18} className="text-slate-400 cursor-pointer" onClick={fetchSubmissions} /></div><div className="overflow-x-auto"><table className="w-full text-left"><thead className="text-xs font-bold text-slate-400 uppercase"><tr className="border-b"><th className="pb-3">Candidate</th><th className="pb-3">Score</th><th className="pb-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{submissions.map((sub, i) => (<tr key={i} className="text-sm"><td className="py-4 font-semibold">{sub.candidateName}</td><td className="py-4">{sub.score}/{sub.total} ({sub.percentage}%)</td><td className="py-4"><span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${sub.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{sub.status}</span></td></tr>))}</tbody></table></div></div>
          </div>
        )}

        {view === 'candidate-entry' && (
          <div className="max-w-md mx-auto py-12 animate-in slide-in-from-left-4">
            <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl text-center">
              <h3 className="text-2xl font-bold mb-6">Enter Invitation Code</h3>
              <p className="text-slate-500 mb-8">Welcome back, {candidateName}!</p>
              <div className="space-y-4">
                <input className="w-full border rounded-xl p-4 border-slate-200 font-mono text-center tracking-widest uppercase" placeholder="TEST-CODE" value={generatedTestId} onChange={e => setGeneratedTestId(e.target.value)} />
                <button onClick={handleStartTest} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg">Start Assessment</button>
              </div>
            </div>
          </div>
        )}

        {/* ... (Other views remain unchanged) ... */}

      </div>
    </div>
  );
};

export default App;