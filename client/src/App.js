import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, LayoutDashboard, User, Timer, 
  ChevronRight, ChevronLeft, AlertCircle, CheckCircle2, 
  XCircle, BarChart3, Settings, Send, RefreshCw
} from 'lucide-react';

const App = () => {
  const [view, setView] = useState('landing');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for Admin Settings and Test Flow
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

  // Updated Backend API Base URL for Render
  const API_URL = 'https://adaptive-test-backend.onrender.com/api';

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
      if (data.testId) {
        setGeneratedTestId(data.testId);
      } else {
        throw new Error("Failed to generate test ID");
      }
    } catch (err) {
      setError("Backend unreachable. Please ensure your Render service is live.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async () => {
    if (!candidateName) return setError("Please enter your name.");
    if (!generatedTestId) return setError("Please enter a Test ID.");
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/test/${generatedTestId}`);
      if (!res.ok) throw new Error("Test not found. Please check the ID.");
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
    setError(null);
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
      setError("Submission failed. Check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/submissions`);
      if (!res.ok) throw new Error("Failed to fetch submissions");
      const data = await res.json();
      setSubmissions(data);
    } catch (err) {
      setError("Could not connect to the server.");
    }
  };

  // --- Timers & Lifecycle ---

  useEffect(() => {
    if (view === 'test' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (view === 'test' && timeLeft === 0) {
      handleSubmitTest();
    }
  }, [view, timeLeft]);

  useEffect(() => {
    if (view === 'admin') {
      fetchSubmissions();
    }
  }, [view]);

  // --- Formatters ---

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation Header */}
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <ClipboardCheck size={20} />
            </div>
            <h1 className="text-lg font-bold tracking-tight">SkillAssess <span className="text-indigo-600">AI</span></h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setView('admin')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${view === 'admin' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setView('candidate-entry')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${view === 'candidate-entry' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Take Test
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-red-700 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <XCircle size={18} />
            </button>
          </div>
        )}

        {/* View: Landing */}
        {view === 'landing' && (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              Adaptive <span className="text-indigo-600">Intern Screening</span>
            </h2>
            <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              The easiest way to generate skill-specific tests for your applicants. 
              Our AI engine handles the complexity so you can find the best talent faster.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => setView('admin')}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition"
              >
                Create a Test
              </button>
              <button 
                onClick={() => setView('candidate-entry')}
                className="bg-white border border-slate-200 text-slate-700 px-8 py-3 rounded-xl font-bold hover:bg-slate-50 transition"
              >
                Try Assessment
              </button>
            </div>
          </div>
        )}

        {/* View: Admin Dashboard */}
        {view === 'admin' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Settings size={20} className="text-indigo-600" /> Test Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Required Skills</label>
                  <input 
                    className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-100 border-slate-200"
                    placeholder="Python, React, ML..."
                    value={adminConfig.skills}
                    onChange={e => setAdminConfig({...adminConfig, skills: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Difficulty Level</label>
                  <select 
                    className="w-full border rounded-lg p-2.5 outline-none border-slate-200"
                    value={adminConfig.difficulty}
                    onChange={e => setAdminConfig({...adminConfig, difficulty: e.target.value})}
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Questions</label>
                    <input 
                      type="number"
                      className="w-full border rounded-lg p-2.5 outline-none border-slate-200"
                      value={adminConfig.numQuestions}
                      onChange={e => setAdminConfig({...adminConfig, numQuestions: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Time (Min)</label>
                    <input 
                      type="number"
                      className="w-full border rounded-lg p-2.5 outline-none border-slate-200"
                      value={adminConfig.timeLimit}
                      onChange={e => setAdminConfig({...adminConfig, timeLimit: e.target.value})}
                    />
                  </div>
                </div>
                <button 
                  onClick={handleCreateTest}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition mt-4 shadow-md"
                >
                  {loading ? 'Generating...' : 'Generate Test Code'}
                </button>
                
                {generatedTestId && (
                  <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
                    <p className="text-xs font-bold text-indigo-400 uppercase mb-1">Access Code</p>
                    <code className="text-2xl font-mono font-black text-indigo-900 tracking-widest uppercase">{generatedTestId}</code>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <BarChart3 size={20} className="text-indigo-600" /> Applicant Analytics
                  </h3>
                  <button onClick={fetchSubmissions} className="p-2 text-slate-400 hover:text-indigo-600 transition">
                    <RefreshCw size={18} />
                  </button>
                </div>
                {submissions.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 italic">No submissions yet. Results will appear here once candidates finish.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="text-xs font-bold text-slate-400 uppercase">
                        <tr className="border-b">
                          <th className="pb-3 px-2">Candidate</th>
                          <th className="pb-3 px-2">Score</th>
                          <th className="pb-3 px-2">Percentage</th>
                          <th className="pb-3 px-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {submissions.map((sub, i) => (
                          <tr key={i} className="text-sm hover:bg-slate-50 transition">
                            <td className="py-4 px-2 font-semibold">{sub.candidateName}</td>
                            <td className="py-4 px-2">{sub.score} / {sub.total}</td>
                            <td className="py-4 px-2 font-mono font-bold text-indigo-600">{sub.percentage.toFixed(0)}%</td>
                            <td className="py-4 px-2">
                              <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                sub.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {sub.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* View: Candidate Entry */}
        {view === 'candidate-entry' && (
          <div className="max-w-md mx-auto py-12">
            <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl text-center">
              <div className="bg-indigo-100 w-20 h-20 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto mb-6 shadow-inner">
                <User size={36} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Start Assessment</h3>
              <p className="text-slate-500 text-sm mb-8">Enter your full name and the code shared with you.</p>
              <div className="space-y-4">
                <input 
                  className="w-full border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-100 border-slate-200"
                  placeholder="Full Name"
                  value={candidateName}
                  onChange={e => setCandidateName(e.target.value)}
                />
                <input 
                  className="w-full border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-100 border-slate-200 font-mono text-center text-xl tracking-widest uppercase"
                  placeholder="TEST-CODE"
                  value={generatedTestId}
                  onChange={e => setGeneratedTestId(e.target.value)}
                />
                <button 
                  onClick={handleStartTest}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition mt-4 shadow-lg shadow-indigo-100"
                >
                  {loading ? 'Validating...' : 'Launch Test'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View: Active Test */}
        {view === 'test' && currentTest && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-indigo-600 text-white p-6 rounded-2xl shadow-lg sticky top-4 z-10">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Remaining Time</span>
                <span className="text-2xl font-mono font-black">{formatTime(timeLeft)}</span>
              </div>
              <button 
                onClick={handleSubmitTest}
                className="bg-white text-indigo-600 px-6 py-2 rounded-xl font-black uppercase text-sm hover:bg-slate-100 transition shadow-md"
              >
                Final Submit
              </button>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm min-h-[450px] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-10">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Question {currentQuestionIndex + 1} / {currentTest.questions.length}
                  </span>
                  <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {currentTest.questions[currentQuestionIndex].skill}
                  </span>
                </div>

                <h2 className="text-2xl font-bold mb-10 text-slate-800 leading-tight">
                  {currentTest.questions[currentQuestionIndex].question}
                </h2>

                <div className="space-y-3">
                  {currentTest.questions[currentQuestionIndex].options.map((opt, i) => (
                    <label 
                      key={i} 
                      className={`flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all ${
                        answers[currentTest.questions[currentQuestionIndex].id] === opt 
                        ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-50' 
                        : 'border-slate-50 hover:bg-slate-50'
                      }`}
                    >
                      <input 
                        type="radio" 
                        className="w-5 h-5 accent-indigo-600"
                        checked={answers[currentTest.questions[currentQuestionIndex].id] === opt}
                        onChange={() => setAnswers({...answers, [currentTest.questions[currentQuestionIndex].id]: opt})}
                      />
                      <span className="font-bold text-slate-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-between mt-12 pt-8 border-t border-slate-50">
                <button 
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  className="flex items-center gap-2 px-4 py-2 text-slate-400 font-bold disabled:opacity-0 hover:text-indigo-600 transition"
                >
                  <ChevronLeft size={20} /> Back
                </button>
                <button 
                  disabled={currentQuestionIndex === currentTest.questions.length - 1}
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  className="flex items-center gap-2 px-8 py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-bold disabled:opacity-0 hover:bg-indigo-100 transition"
                >
                  Next Question <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View: Results */}
        {/*added div tags*/}
        {view === 'results' && testResult && (
          <div className="max-w-lg mx-auto py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-2xl text-center">
              <div className="bg-green-100 text-green-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-4xl font-black mb-2 text-slate-800 tracking-tight">Well Done!</h2>
              <p className="text-slate-400 font-medium mb-10">We've shared your results with the recruiter.</p>
              
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-slate-50 p-6 rounded-3xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Points Earned</p>
                  <p className="text-4xl font-black text-slate-800">{testResult.result.score}/{testResult.result.total}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Final Grade</p>
                  <p className="text-4xl font-black text-indigo-600">{testResult.result.percentage.toFixed(0)}%</p>
                </div>
              </div>

              <div className={`inline-block px-12 py-3 rounded-full text-sm font-black uppercase tracking-widest shadow-sm mb-12 ${
                testResult.result.status === 'Pass' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
              }`}>
                {testResult.result.status}
              </div>

              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-black transition shadow-xl"
              >
                Return Home
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;