'use client';
import { useState, useEffect } from 'react';
import { DollarSign, FileText, Building2, TrendingUp, Clock, Bot, Send, Loader2, LogOut, User, MapPin } from 'lucide-react';

const LOCATIONS = ['Pearl City', 'OS', 'Ortho', 'Lihue', 'Kapolei', 'Kailua', 'Honolulu', 'HHDS'];

export default function ClinicDataSystem() {
  const [user, setUser] = useState(null);
  const [tempName, setTempName] = useState('');
  const [tempLocation, setTempLocation] = useState('Kailua');
  const [view, setView] = useState('input');
  const [allEntries, setAllEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: "Hi! I can help you with data summaries and weekly reports. Try asking:\n\n• \"Weekly summary for Kailua\"\n• \"Show all variances\"\n• \"Compare all locations\"" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    date: today, cash: '', creditCard: '', checksOTC: '', insuranceChecks: '',
    careCredit: '', vcc: '', efts: '', depositCash: '', depositCreditCard: '',
    depositChecks: '', depositInsurance: '', depositCareCredit: '', depositVCC: '', notes: ''
  });

  useEffect(() => { if (user) loadAllEntries(); }, [user]);

  const loadAllEntries = async () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem('clinic-entries');
      if (stored) setAllEntries(JSON.parse(stored));
    } catch (e) { setAllEntries([]); }
    setLoading(false);
  };

  const handleLogin = () => {
    if (!tempName.trim()) return;
    setUser({ name: tempName.trim(), location: tempLocation });
  };

  const handleLogout = () => { setUser(null); setTempName(''); setView('input'); };

  const saveEntry = async () => {
    if (!user) return;
    setSaving(true);
    const total = ['cash', 'creditCard', 'checksOTC', 'insuranceChecks', 'careCredit', 'vcc', 'efts']
      .reduce((sum, f) => sum + (parseFloat(formData[f]) || 0), 0);
    const depositTotal = ['depositCash', 'depositCreditCard', 'depositChecks', 'depositInsurance', 'depositCareCredit', 'depositVCC']
      .reduce((sum, f) => sum + (parseFloat(formData[f]) || 0), 0);

    const entry = { ...formData, total, depositTotal, location: user.location,
      enteredBy: user.name, timestamp: new Date().toISOString(), id: `${Date.now()}` };

    const updated = [...allEntries.filter(e => !(e.date === formData.date && e.location === user.location)), entry]
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    try {
      localStorage.setItem('clinic-entries', JSON.stringify(updated));
      setAllEntries(updated);
      setMessage('✓ Entry saved!');
      setTimeout(() => setMessage(''), 3000);
      setFormData({...formData, cash: '', creditCard: '', checksOTC: '', insuranceChecks: '', 
        careCredit: '', vcc: '', efts: '', depositCash: '', depositCreditCard: '', 
        depositChecks: '', depositInsurance: '', depositCareCredit: '', depositVCC: '', notes: ''});
    } catch (e) { setMessage('Error saving'); }
    setSaving(false);
  };

  const askAI = async () => {
    if (!chatInput.trim()) return;
    const userMessage = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setAiLoading(true);

    const dataSummary = LOCATIONS.map(loc => {
      const locEntries = allEntries.filter(e => e.location === loc).slice(0, 14);
      if (locEntries.length === 0) return `\n${loc}: No entries yet`;
      return `\n${loc}:\n${locEntries.map(e => 
        `  ${e.date}: Collections=$${e.total?.toFixed(2)||0}, Deposit=$${e.depositTotal?.toFixed(2)||0}, Variance=$${((e.total||0)-(e.depositTotal||0)).toFixed(2)}, By: ${e.enteredBy}`
      ).join('\n')}`;
    }).join('\n');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: userMessage }], dataSummary })
      });
      const data = await response.json();
      const aiResponse = data.content?.[0]?.text || 'Sorry, I had trouble with that.';
      setChatMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Error connecting to AI.' }]);
    }
    setAiLoading(false);
  };

  const locationEntries = allEntries.filter(e => e.location === user?.location);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weeklyData = locationEntries.filter(e => new Date(e.date) >= weekAgo);
  const weeklyTotal = weeklyData.reduce((s, e) => s + (e.total || 0), 0);
  const weeklyDeposit = weeklyData.reduce((s, e) => s + (e.depositTotal || 0), 0);

  const InputField = ({ label, field }) => (
    <div className="flex flex-col">
      <label className="text-xs text-gray-500 mb-1">{label}</label>
      <div className="flex items-center border-2 rounded-lg bg-white focus-within:border-blue-400">
        <span className="px-2 text-gray-400">$</span>
        <input type="number" step="0.01" value={formData[field]}
          onChange={e => setFormData({...formData, [field]: e.target.value})}
          className="w-full p-2.5 rounded-r-lg outline-none" placeholder="0.00" />
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Clinic Daily Recon</h1>
            <p className="text-gray-500 mt-1">Enter your info to continue</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Your Location
              </label>
              <select value={tempLocation} onChange={e => setTempLocation(e.target.value)}
                className="w-full p-3 border-2 rounded-xl text-lg focus:border-blue-400 outline-none">
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" /> Your Name
              </label>
              <input type="text" value={tempName} onChange={e => setTempName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full p-3 border-2 rounded-xl text-lg focus:border-blue-400 outline-none"
                placeholder="Enter your name" />
            </div>
            <button onClick={handleLogin} disabled={!tempName.trim()}
              className="w-full py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 disabled:opacity-50 mt-4">
              Continue →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-gray-800">{user.location}</h1>
            <p className="text-xs text-gray-500">Logged in as {user.name}</p>
          </div>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-gray-600">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex gap-1 bg-gray-200 p-1 rounded-xl">
          {[{id:'input',label:'Entry',icon:DollarSign},{id:'history',label:'History',icon:Clock},
            {id:'report',label:'Report',icon:TrendingUp},{id:'ai',label:'AI Help',icon:Bot}].map(tab => (
            <button key={tab.id} onClick={() => setView(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                view === tab.id ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>
      </div>

      {message && <div className="max-w-2xl mx-auto px-4"><div className="p-3 bg-green-100 text-green-700 rounded-xl text-center font-medium">{message}</div></div>}

      <div className="max-w-2xl mx-auto px-4 pb-8">
        {view === 'input' && (
          <div className="space-y-4 mt-4">
            <div className="bg-white rounded-2xl shadow-sm p-5 border">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" /> Daily Cash Can
              </h2>
              <div className="mb-4">
                <label className="text-xs text-gray-500 mb-1 block">Date</label>
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full p-2.5 border-2 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Cash" field="cash" />
                <InputField label="Credit Card (OTC)" field="creditCard" />
                <InputField label="Checks (OTC)" field="checksOTC" />
                <InputField label="Insurance Checks" field="insuranceChecks" />
                <InputField label="Care Credit" field="careCredit" />
                <InputField label="VCC" field="vcc" />
                <InputField label="EFTs" field="efts" />
              </div>
              <div className="mt-4 pt-3 border-t flex justify-between items-center">
                <span className="text-gray-600">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${['cash','creditCard','checksOTC','insuranceChecks','careCredit','vcc','efts']
                    .reduce((s,f) => s + (parseFloat(formData[f])||0), 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5 border">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" /> Bank Deposit
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Cash" field="depositCash" />
                <InputField label="Credit Card" field="depositCreditCard" />
                <InputField label="Checks (OTC)" field="depositChecks" />
                <InputField label="Insurance Checks" field="depositInsurance" />
                <InputField label="Care Credit" field="depositCareCredit" />
                <InputField label="VCC" field="depositVCC" />
              </div>
              <div className="mt-3">
                <label className="text-xs text-gray-500 mb-1 block">Notes (optional)</label>
                <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full p-2.5 border-2 rounded-xl" placeholder="Any notes..." />
              </div>
              <div className="mt-4 pt-3 border-t flex justify-between items-center">
                <span className="text-gray-600">Deposit Total:</span>
                <span className="text-2xl font-bold text-green-600">
                  ${['depositCash','depositCreditCard','depositChecks','depositInsurance','depositCareCredit','depositVCC']
                    .reduce((s,f) => s + (parseFloat(formData[f])||0), 0).toFixed(2)}
                </span>
              </div>
              <button onClick={saveEntry} disabled={saving}
                className="w-full py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 disabled:opacity-50 mt-4">
                {saving ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="bg-white rounded-2xl shadow-sm p-5 border mt-4">
            <h2 className="font-semibold text-gray-800 mb-4">Recent Entries</h2>
            {locationEntries.length === 0 ? <p className="text-gray-500">No entries yet</p> : (
              <div className="space-y-2">
                {locationEntries.slice(0,20).map(e => (
                  <div key={e.id} className="p-3 bg-gray-50 rounded-xl flex justify-between items-start">
                    <div><p className="font-medium">{e.date}</p><p className="text-xs text-gray-500">By {e.enteredBy}</p></div>
                    <div className="text-right">
                      <p className="text-sm">Collected: <strong>${(e.total||0).toFixed(2)}</strong></p>
                      <p className="text-sm">Deposited: <strong>${(e.depositTotal||0).toFixed(2)}</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'report' && (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-500 text-white rounded-2xl p-4 text-center">
                <p className="text-xs opacity-80">Collections</p><p className="text-xl font-bold">${weeklyTotal.toFixed(0)}</p>
              </div>
              <div className="bg-green-500 text-white rounded-2xl p-4 text-center">
                <p className="text-xs opacity-80">Deposits</p><p className="text-xl font-bold">${weeklyDeposit.toFixed(0)}</p>
              </div>
              <div className={`${Math.abs(weeklyTotal-weeklyDeposit)>0.01?'bg-red-500':'bg-gray-500'} text-white rounded-2xl p-4 text-center`}>
                <p className="text-xs opacity-80">Variance</p><p className="text-xl font-bold">${(weeklyTotal-weeklyDeposit).toFixed(0)}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5 border">
              <h3 className="font-semibold mb-3">This Week - {user.location}</h3>
              {weeklyData.length === 0 ? <p className="text-gray-500">No data this week</p> : (
                <div className="space-y-2">
                  {weeklyData.map(e => (
                    <div key={e.id} className="flex justify-between p-2 bg-gray-50 rounded-lg text-sm">
                      <span>{e.date}</span><span>${(e.total||0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'ai' && (
          <div className="bg-white rounded-2xl shadow-sm border mt-4 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
              <h2 className="font-semibold flex items-center gap-2"><Bot className="w-5 h-5" /> AI Assistant</h2>
            </div>
            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role==='user'?'justify-end':'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role==='user'?'bg-blue-600 text-white':'bg-gray-100'}`}>
                    <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                  </div>
                </div>
              ))}
              {aiLoading && <div className="flex justify-start"><div className="bg-gray-100 p-3 rounded-2xl"><Loader2 className="w-5 h-5 animate-spin" /></div></div>}
            </div>
            <div className="p-3 border-t flex gap-2">
              <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key==='Enter' && askAI()} placeholder="Ask a question..." 
                className="flex-1 p-3 border rounded-xl outline-none" />
              <button onClick={askAI} disabled={aiLoading} className="px-4 bg-blue-600 text-white rounded-xl">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
