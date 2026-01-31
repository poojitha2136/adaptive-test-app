import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, LayoutDashboard, User, Timer, 
  ChevronRight, ChevronLeft, AlertCircle, CheckCircle2, 
  XCircle, BarChart3, Settings, RefreshCw, LogOut, ShieldCheck, Mail, Lock
} from 'lucide-react';

const App = () => {
  // --- Navigation & Auth States ---
  const [view, setView] = useState('login'); 
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Form & Data States ---
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [adminConfig, setAdminConfig] = useState({ skills: 'Python', difficulty: 'Medium', numQuestions: 5, timeLimit: 10 });
  const [generatedTestId, setGeneratedTestId] = useState('');
  const [submissions, setSubmissions] = useState([]);
  
  // --- Test Execution States ---
  const [currentTest, setCurrentTest] = useState(null);
  const [candidateName, setCandidateName] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testResult, setTestResult] = useState(null);

  // Change this to your actual Render Backend URL
  const API_URL = "https://adaptive-test-app-6.onrender.com/api";

  // --- Handlers ---
  const handleLoginSubmit = (e, role) => {
    e.preventDefault();
    if (!formData.email || !formData.password || (role === 'candidate' && !formData.name)) {
      setError("Please fill in all fields.");
      return;
    }
    setUserRole(role);
    setCandidateName(formData.name);
    setView(role === 'admin' ? 'admin' : 'candidate-entry');
    setError(null);
  };

  const handleLogout = () => {
    setUserRole(null);
    setView('login');
    setFormData({ name: '', email: '', password: '' });
    setCurrentTest(null);
    setGeneratedTestId('');
  };

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
    } catch (err) { setError("Backend wake-up error. Try again."); }
    finally { setLoading(false); }
  };

  const handleStartTest = async () => {
    if (!generatedTestId) return setError("Enter a Test Code.");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/test/${generatedTestId.trim().toLowerCase()}`);
      if (!res.ok) throw new Error("Test not found. Codes expire if the server restarts.");
      
      const data = await res.json();
      
      if (data && data.questions && data.questions.length > 0) {
        // Critical: Update all state before changing view
        setCurrentTest(data);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setTimeLeft(data.timeLimit * 60);
        setView('test'); 
      } else {
        throw new Error("Test data is empty or invalid.");
      }
    } catch (err) { 
      setError(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSubmitTest = async () => {
    if (!currentTest) return;
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
    } catch (err) { setError("Submission failed."); }
    finally { setLoading(false); }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/submissions`);
      const data = await res.json();
      setSubmissions(data);
    } catch (err) { console.error(err); }
  };

  // --- Effects ---
  useEffect(() => {
    let timer;
    if (view === 'test' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (view === 'test' && timeLeft === 0) {
      handleSubmitTest();
    }
    return () => clearInterval(timer);
  }, [view, timeLeft]);

  useEffect(() => {
    if (view === 'admin') fetchSubmissions();
  }, [view]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        {view !== 'login' && (
          <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogout}>
              <div className="bg-indigo-600 p-2 rounded-lg text-white"><ClipboardCheck size={20} /></div>
              <h1 className="text-lg font-bold">SkillAssess <span className="text-indigo-600">AI</span></h1>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition">
              <LogOut size={16} /> Logout
            </button>
          </header>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-red-700">
            <div className="flex items-center gap-3"><AlertCircle size={20} /><p className="text-sm font-medium">{error}</p></div>
            <XCircle size={18} className="cursor-pointer" onClick={() => setError(null)} />
          </div>
        )}

        {/* --- LOGIN VIEW --- */}
        {view === 'login' && (
          <div className="max-w-4xl mx-auto py-12">
            <div className="text-center mb-12"><h2 className="text-4xl font-black mb-2">Portal Login</h2></div>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                <h3 className="text-xl font-bold mb-6">Recruiter Portal</h3>
                <form onSubmit={(e) => handleLoginSubmit(e, 'admin')} className="space-y-4">
                  <input type="email" placeholder="Admin Email" className="w-full p-4 rounded-2xl border bg-slate-50" onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  <input type="password" placeholder="Password" className="w-full p-4 rounded-2xl border bg-slate-50" onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black">Admin Sign In</button>
                </form>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                <h3 className="text-xl font-bold mb-6">Candidate Portal</h3>
                <form onSubmit={(e) => handleLoginSubmit(e, 'candidate')} className="space-y-4">
                  <input type="text" placeholder="Full Name" className="w-full p-4 rounded-2xl border bg-slate-50" onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  <input type="email" placeholder="Email Address" className="w-full p-4 rounded-2xl border bg-slate-50" onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  <input type="password" placeholder="Password" className="w-full p-4 rounded-2xl border bg-slate-50" onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  <button type="submit" className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black">Join Test</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* --- ADMIN DASHBOARD --- */}
        {view === 'admin' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm h-fit">
              <h3 className="font-bold mb-6">Create New Assessment</h3>
              <div className="space-y-4">
                <input className="w-full border rounded-lg p-3" placeholder="Skills" value={adminConfig.skills} onChange={e => setAdminConfig({...adminConfig, skills: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" className="border rounded-lg p-3" value={adminConfig.numQuestions} onChange={e => setAdminConfig({...adminConfig, numQuestions: e.target.value})} />
                  <input type="number" className="border rounded-lg p-3" value={adminConfig.timeLimit} onChange={e => setAdminConfig({...adminConfig, timeLimit: e.target.value})} />
                </div>
                <button onClick={handleCreateTest} disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">
                  {loading ? 'Generating...' : 'Get Code'}
                </button>
                {generatedTestId && <div className="mt-4 p-4 bg-indigo-50 border rounded-xl text-center font-mono font-bold text-indigo-900 uppercase tracking-widest">{generatedTestId}</div>}
              </div>
            </div>
            <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="font-bold mb-6">Recent Submissions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead><tr className="border-b"><th className="pb-3">Candidate</th><th className="pb-3">Score</th><th className="pb-3">Status</th></tr></thead>
                  <tbody>
                    {submissions.map((sub, i) => (
                      <tr key={i} className="border-b"><td className="py-4">{sub.candidateName}</td><td className="py-4">{sub.score}/{sub.total}</td><td>{sub.status}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- CANDIDATE ENTRY --- */}
        {view === 'candidate-entry' && (
          <div className="max-w-md mx-auto py-12">
            <div className="bg-white p-10 rounded-3xl shadow-xl text-center">
              <h3 className="text-2xl font-bold mb-6">Ready to start?</h3>
              <input className="w-full border rounded-xl p-4 mb-4 text-center font-mono uppercase tracking-widest" placeholder="ENTER CODE" value={generatedTestId} onChange={e => setGeneratedTestId(e.target.value)} />
              <button onClick={handleStartTest} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold">Launch Assessment</button>
            </div>
          </div>
        )}

        {/* --- ACTIVE TEST VIEW --- */}
        {view === 'test' && (
          !currentTest || !currentTest.questions ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="animate-spin text-indigo-600 mb-4" size={48} />
              <p className="font-bold text-slate-500">Loading Assessment...</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex justify-between items-center bg-indigo-600 text-white p-6 rounded-2xl shadow-lg">
                <span className="text-2xl font-mono font-black">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
                <button onClick={handleSubmitTest} className="bg-white text-indigo-600 px-6 py-2 rounded-xl font-bold">Submit</button>
              </div>
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <div className="mb-8 flex justify-between">
                  <span className="font-black text-slate-400 uppercase tracking-widest text-xs">
                    Question {currentQuestionIndex + 1} / {currentTest.questions.length}
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-10">{currentTest.questions[currentQuestionIndex]?.question}</h2>
                <div className="space-y-3">
                  {currentTest.questions[currentQuestionIndex]?.options.map((opt, i) => (
                    <label key={i} className={`flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all ${answers[currentTest.questions[currentQuestionIndex].id] === opt ? 'border-indigo-600 bg-indigo-50' : 'border-slate-50'}`}>
                      <input type="radio" className="hidden" checked={answers[currentTest.questions[currentQuestionIndex].id] === opt} onChange={() => setAnswers({...answers, [currentTest.questions[currentQuestionIndex].id]: opt})} />
                      <span className="font-bold text-slate-700">{opt}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-between mt-12">
                  <button disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(prev => prev - 1)} className="font-bold text-slate-400 disabled:opacity-0">Back</button>
                  <button disabled={currentQuestionIndex === currentTest.questions.length - 1} onClick={() => setCurrentQuestionIndex(prev => prev + 1)} className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-xl font-bold">Next</button>
                </div>
              </div>
            </div>
          )
        )}

        {/* --- RESULTS VIEW --- */}
        {view === 'results' && testResult && (
          <div className="max-w-lg mx-auto py-12">
            <div className="bg-white p-12 rounded-[3rem] shadow-2xl text-center">
              <CheckCircle2 size={60} className="text-green-500 mx-auto mb-6" />
              <h2 className="text-4xl font-black mb-4">Done!</h2>
              <div className="bg-slate-50 p-6 rounded-3xl mb-8">
                <p className="text-4xl font-black text-indigo-600">{testResult.result.percentage}%</p>
                <p className="text-sm font-bold text-slate-400">Final Score</p>
              </div>
              <button onClick={handleLogout} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black">Finish</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;