'use client';
import { useState, useEffect } from 'react';
import { DollarSign, FileText, Building2, TrendingUp, Clock, Bot, Send, Loader2, LogOut, User, MapPin, Upload, X, File, Shield, Receipt, CreditCard, Package, RefreshCw, Monitor, Menu, Eye, FolderOpen, Edit3, Check } from 'lucide-react';

const LOCATIONS = ['Pearl City', 'OS', 'Ortho', 'Lihue', 'Kapolei', 'Kailua', 'Honolulu', 'HHDS'];
const ADMIN_PASSWORD = 'admin123';

const MODULES = [
  { id: 'daily-recon', name: 'Daily Recon', icon: DollarSign, color: 'blue' },
  { id: 'billing-inquiry', name: 'Billing Inquiry', icon: Receipt, color: 'purple' },
  { id: 'bills-payment', name: 'Bills Payment', icon: CreditCard, color: 'green' },
  { id: 'order-requests', name: 'Order Requests', icon: Package, color: 'orange' },
  { id: 'refund-requests', name: 'Refund Requests', icon: RefreshCw, color: 'pink' },
  { id: 'it-requests', name: 'IT Requests', icon: Monitor, color: 'cyan' },
];

const IT_STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];

function InputField({ label, value, onChange, type = 'text', placeholder = '', prefix, options, large }) {
  if (options) {
    return (
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">{label}</label>
        <select value={value} onChange={onChange} className="w-full p-2.5 border-2 rounded-lg outline-none focus:border-blue-400">
          <option value="">Select...</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }
  if (large) {
    return (
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">{label}</label>
        <textarea value={value} onChange={onChange} rows={4}
          className="w-full p-2.5 border-2 rounded-lg outline-none focus:border-blue-400 resize-none" placeholder={placeholder} />
      </div>
    );
  }
  return (
    <div className="flex flex-col">
      <label className="text-xs text-gray-500 mb-1">{label}</label>
      <div className="flex items-center border-2 rounded-lg bg-white focus-within:border-blue-400">
        {prefix && <span className="px-2 text-gray-400">{prefix}</span>}
        <input type={type} value={value} onChange={onChange}
          className="w-full p-2.5 rounded-lg outline-none" placeholder={placeholder} />
      </div>
    </div>
  );
}

function FileUpload({ label, files, onFilesChange, onViewFile }) {
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files).map(f => ({
      name: f.name, size: f.size, type: f.type,
      url: URL.createObjectURL(f), file: f
    }));
    onFilesChange([...files, ...newFiles]);
  };
  return (
    <div className="flex flex-col">
      <label className="text-xs text-gray-500 mb-1">{label}</label>
      <div className="border-2 border-dashed rounded-lg p-3 bg-gray-50">
        <label className="flex items-center justify-center gap-2 cursor-pointer text-gray-500 hover:text-blue-600">
          <Upload className="w-4 h-4" /><span className="text-sm">Click to upload</span>
          <input type="file" multiple onChange={handleFileChange} className="hidden" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" />
        </label>
        {files.length > 0 && (
          <div className="mt-2 space-y-1">
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between bg-white p-2 rounded text-sm">
                <div className="flex items-center gap-2 truncate flex-1">
                  <File className="w-4 h-4 text-blue-500" />
                  <span className="truncate">{file.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {file.url && (
                    <button onClick={() => onViewFile(file)} className="p-1 text-blue-500 hover:text-blue-700">
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => onFilesChange(files.filter((_, idx) => idx !== i))} className="p-1 text-red-500 hover:text-red-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FileViewer({ file, onClose }) {
  if (!file) return null;
  const isImage = file.type?.startsWith('image/') || file.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] w-full overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
          <h3 className="font-semibold truncate">{file.name}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4">
          {isImage ? (
            <img src={file.url} alt={file.name} className="max-w-full rounded-lg mx-auto" />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <File className="w-16 h-16 mx-auto mb-4" />
              <p>Preview not available for this file type</p>
              <a href={file.url} download={file.name} className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg">Download</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    'Open': 'bg-red-100 text-red-700',
    'In Progress': 'bg-yellow-100 text-yellow-700',
    'Resolved': 'bg-green-100 text-green-700',
    'Closed': 'bg-gray-100 text-gray-700',
    'Pending': 'bg-yellow-100 text-yellow-700',
    'Approved': 'bg-blue-100 text-blue-700',
    'Completed': 'bg-green-100 text-green-700',
    'Paid': 'bg-green-100 text-green-700',
    'Denied': 'bg-red-100 text-red-700',
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-700'}`}>{status || 'No Status'}</span>;
}

export default function ClinicSystem() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempLocation, setTempLocation] = useState('Kailua');
  const [tempPassword, setTempPassword] = useState('');
  const [loginMode, setLoginMode] = useState('staff');
  const [activeModule, setActiveModule] = useState('daily-recon');
  const [view, setView] = useState('entry');
  const [allData, setAllData] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [viewingFile, setViewingFile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminLocation, setAdminLocation] = useState('all');
  const [editingStatus, setEditingStatus] = useState(null);
  const [itCounter, setItCounter] = useState(1000);
  
  const [chatMessages, setChatMessages] = useState([{ role: 'assistant', content: "Hi! I can help with data summaries across all modules and locations. Try:\n• \"Show weekly summary\"\n• \"Any billing inquiries pending?\"\n• \"IT requests status\"" }]);
  const [chatInput, setChatInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const [forms, setForms] = useState({
    'daily-recon': { date: today, cash: '', creditCard: '', checksOTC: '', insuranceChecks: '', careCredit: '', vcc: '', efts: '', depositCash: '', depositCreditCard: '', depositChecks: '', depositInsurance: '', depositCareCredit: '', depositVCC: '', notes: '' },
    'billing-inquiry': { patientName: '', chartNumber: '', dateOfService: '', amountInQuestion: '', bestContactMethod: '', bestContactTime: '', reviewedBy: '', initials: '', status: '', result: '' },
    'bills-payment': { billStatus: '', date: today, vendor: '', description: '', amount: '', dueDate: '', managerInitials: '', apReviewed: '', dateReviewed: '', paid: '' },
    'order-requests': { dateEntered: today, vendor: '', invoiceNumber: '', invoiceDate: '', dueDate: '', amount: '', enteredBy: '', notes: '' },
    'refund-requests': { patientName: '', chartNumber: '', parentName: '', rpAddress: '', dateOfRequest: today, typeTransaction: '', description: '', amountRequested: '', bestContactMethod: '', eassistAudited: '', status: '' },
    'it-requests': { dateReported: today, urgencyLevel: '', requesterName: '', deviceSystem: '', descriptionOfIssue: '', bestContactMethod: '', bestContactTime: '', assignedTo: '' }
  });
  const [files, setFiles] = useState({
    'daily-recon': { eodDaySheets: [], eodBankReceipts: [], otherFiles: [] },
    'billing-inquiry': { documentation: [] },
    'bills-payment': { documentation: [] },
    'order-requests': { orderInvoices: [] },
    'refund-requests': { documentation: [] },
    'it-requests': { documentation: [] }
  });

  useEffect(() => { 
    loadAllData(); 
    const counter = localStorage.getItem('it-counter');
    if (counter) setItCounter(parseInt(counter));
  }, []);

  const loadAllData = () => {
    const data = {};
    MODULES.forEach(m => {
      const stored = localStorage.getItem(`clinic-${m.id}`);
      if (stored) data[m.id] = JSON.parse(stored);
    });
    setAllData(data);
  };

  const handleLogin = () => {
    if (loginMode === 'admin') {
      if (tempPassword === ADMIN_PASSWORD) {
        setIsAdmin(true);
        setUser({ name: 'Admin', location: 'all' });
      } else {
        setMessage('Invalid password');
        setTimeout(() => setMessage(''), 3000);
      }
    } else {
      if (!tempName.trim()) return;
      setUser({ name: tempName.trim(), location: tempLocation });
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
    setTempName('');
    setTempPassword('');
    setView('entry');
  };

  const updateForm = (module, field, value) => {
    setForms(prev => ({ ...prev, [module]: { ...prev[module], [field]: value } }));
  };

  const updateFiles = (module, field, newFiles) => {
    setFiles(prev => ({ ...prev, [module]: { ...prev[module], [field]: newFiles } }));
  };

  const saveEntry = async (module) => {
    setSaving(true);
    const form = forms[module];
    const fileData = files[module];
    
    const entry = {
      ...form,
      files: Object.fromEntries(Object.entries(fileData).map(([k, v]) => [k, v.map(f => ({ name: f.name, type: f.type, url: f.url }))])),
      location: user.location,
      enteredBy: user.name,
      timestamp: new Date().toISOString(),
      id: `${Date.now()}`
    };

    if (module === 'daily-recon') {
      entry.total = ['cash', 'creditCard', 'checksOTC', 'insuranceChecks', 'careCredit', 'vcc', 'efts']
        .reduce((s, f) => s + (parseFloat(form[f]) || 0), 0);
      entry.depositTotal = ['depositCash', 'depositCreditCard', 'depositChecks', 'depositInsurance', 'depositCareCredit', 'depositVCC']
        .reduce((s, f) => s + (parseFloat(form[f]) || 0), 0);
    }

    if (module === 'it-requests') {
      entry.requestNumber = `IT-${itCounter}`;
      entry.status = 'Open';
      const newCounter = itCounter + 1;
      setItCounter(newCounter);
      localStorage.setItem('it-counter', newCounter.toString());
    }

    const current = allData[module] || [];
    const updated = [entry, ...current].slice(0, 500);

    localStorage.setItem(`clinic-${module}`, JSON.stringify(updated));
    setAllData(prev => ({ ...prev, [module]: updated }));
    setMessage('✓ Entry saved!');
    setTimeout(() => setMessage(''), 3000);

    const resetForm = { ...forms[module] };
    Object.keys(resetForm).forEach(k => { if (!k.includes('date') && !k.includes('Date')) resetForm[k] = ''; });
    setForms(prev => ({ ...prev, [module]: resetForm }));
    setFiles(prev => ({ ...prev, [module]: Object.fromEntries(Object.entries(files[module]).map(([k]) => [k, []])) }));
    setSaving(false);
  };

  const updateITStatus = (entryId, newStatus, resolutionNotes = '', completedBy = '') => {
    const current = allData['it-requests'] || [];
    const updated = current.map(e => {
      if (e.id === entryId) {
        return { ...e, status: newStatus, resolutionNotes, completedBy, statusUpdatedAt: new Date().toISOString() };
      }
      return e;
    });
    localStorage.setItem('clinic-it-requests', JSON.stringify(updated));
    setAllData(prev => ({ ...prev, 'it-requests': updated }));
    setEditingStatus(null);
    setMessage('✓ Status updated!');
    setTimeout(() => setMessage(''), 3000);
  };

  const askAI = async () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { role: 'user', content: chatInput }]);
    setChatInput('');
    setAiLoading(true);

    let dataSummary = '';
    MODULES.forEach(m => {
      const entries = allData[m.id] || [];
      const recent = entries.slice(0, 10);
      dataSummary += `\n\n${m.name} (${entries.length} total):\n`;
      dataSummary += recent.map(e => `  ${e.timestamp?.split('T')[0]} - ${e.location} - ${e.enteredBy} ${e.status ? '- ' + e.status : ''}`).join('\n') || 'No entries';
    });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: chatInput }], dataSummary })
      });
      const data = await response.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.content?.[0]?.text || 'Sorry, I had trouble with that.' }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Error connecting to AI.' }]);
    }
    setAiLoading(false);
  };

  const getModuleEntries = (moduleId) => {
    const entries = allData[moduleId] || [];
    if (isAdmin && adminLocation !== 'all') return entries.filter(e => e.location === adminLocation);
    if (!isAdmin) return entries.filter(e => e.location === user?.location);
    return entries;
  };

  const getFileCount = (entry) => {
    if (!entry.files) return 0;
    return Object.values(entry.files).reduce((sum, arr) => sum + (arr?.length || 0), 0);
  };

  // LOGIN SCREEN
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Clinic System</h1>
          </div>

          <div className="flex gap-2 mb-6">
            <button onClick={() => setLoginMode('staff')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${loginMode === 'staff' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
              Staff
            </button>
            <button onClick={() => setLoginMode('admin')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${loginMode === 'admin' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
              <Shield className="w-4 h-4 inline mr-1" />Admin
            </button>
          </div>

          {message && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{message}</div>}

          {loginMode === 'staff' ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Location</label>
                <select value={tempLocation} onChange={e => setTempLocation(e.target.value)}
                  className="w-full p-3 border-2 rounded-xl focus:border-blue-400 outline-none">
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Your Name</label>
                <input type="text" value={tempName} onChange={e => setTempName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  className="w-full p-3 border-2 rounded-xl focus:border-blue-400 outline-none" placeholder="Enter your name" />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Admin Password</label>
              <input type="password" value={tempPassword} onChange={e => setTempPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full p-3 border-2 rounded-xl focus:border-purple-400 outline-none" placeholder="Enter password" />
            </div>
          )}

          <button onClick={handleLogin}
            className={`w-full py-4 text-white rounded-xl text-lg font-semibold mt-6 ${loginMode === 'admin' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
            Continue →
          </button>
        </div>
      </div>
    );
  }

  const currentModule = MODULES.find(m => m.id === activeModule);
  const entries = getModuleEntries(activeModule);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <FileViewer file={viewingFile} onClose={() => setViewingFile(null)} />

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${isAdmin ? 'bg-purple-100' : 'bg-blue-100'} rounded-xl flex items-center justify-center`}>
              {isAdmin ? <Shield className="w-5 h-5 text-purple-600" /> : <Building2 className="w-5 h-5 text-blue-600" />}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500">{isAdmin ? 'Administrator' : user.location}</p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="p-4 border-b">
            <label className="text-xs text-gray-500">Filter Location</label>
            <select value={adminLocation} onChange={e => setAdminLocation(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg text-sm">
              <option value="all">All Locations</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        )}

        <nav className="p-4 space-y-1">
          {MODULES.map(m => (
            <button key={m.id} onClick={() => { setActiveModule(m.id); setView('entry'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${activeModule === m.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <m.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{m.name}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 text-gray-500 hover:text-gray-700">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm border-b sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2">
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-bold text-gray-800">{currentModule?.name}</h1>
                <p className="text-xs text-gray-500">{isAdmin ? `Viewing: ${adminLocation === 'all' ? 'All Locations' : adminLocation}` : user.location}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-1 px-4 pb-3 overflow-x-auto">
            {(isAdmin ? [{ id: 'history', label: 'Records' }, { id: 'documents', label: 'Documents' }, { id: 'ai', label: 'AI Help' }] : [{ id: 'entry', label: 'New Entry' }, { id: 'history', label: 'History' }, { id: 'ai', label: 'AI Help' }]).map(tab => (
              <button key={tab.id} onClick={() => setView(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${view === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {message && <div className="mx-4 mt-4 p-3 bg-green-100 text-green-700 rounded-xl text-center font-medium">{message}</div>}

        <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
          {/* ENTRY VIEW - Staff Only */}
          {view === 'entry' && !isAdmin && (
            <div className="space-y-4">
              {activeModule === 'daily-recon' && (
                <>
                  <div className="bg-white rounded-2xl shadow-sm p-5 border">
                    <h2 className="font-semibold mb-4">Daily Cash Can</h2>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField label="Date" type="date" value={forms['daily-recon'].date} onChange={e => updateForm('daily-recon', 'date', e.target.value)} />
                      <InputField label="Cash" prefix="$" value={forms['daily-recon'].cash} onChange={e => updateForm('daily-recon', 'cash', e.target.value)} />
                      <InputField label="Credit Card (OTC)" prefix="$" value={forms['daily-recon'].creditCard} onChange={e => updateForm('daily-recon', 'creditCard', e.target.value)} />
                      <InputField label="Checks (OTC)" prefix="$" value={forms['daily-recon'].checksOTC} onChange={e => updateForm('daily-recon', 'checksOTC', e.target.value)} />
                      <InputField label="Insurance Checks" prefix="$" value={forms['daily-recon'].insuranceChecks} onChange={e => updateForm('daily-recon', 'insuranceChecks', e.target.value)} />
                      <InputField label="Care Credit" prefix="$" value={forms['daily-recon'].careCredit} onChange={e => updateForm('daily-recon', 'careCredit', e.target.value)} />
                      <InputField label="VCC" prefix="$" value={forms['daily-recon'].vcc} onChange={e => updateForm('daily-recon', 'vcc', e.target.value)} />
                      <InputField label="EFTs" prefix="$" value={forms['daily-recon'].efts} onChange={e => updateForm('daily-recon', 'efts', e.target.value)} />
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm p-5 border">
                    <h2 className="font-semibold mb-4">Bank Deposit</h2>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField label="Cash" prefix="$" value={forms['daily-recon'].depositCash} onChange={e => updateForm('daily-recon', 'depositCash', e.target.value)} />
                      <InputField label="Credit Card" prefix="$" value={forms['daily-recon'].depositCreditCard} onChange={e => updateForm('daily-recon', 'depositCreditCard', e.target.value)} />
                      <InputField label="Checks" prefix="$" value={forms['daily-recon'].depositChecks} onChange={e => updateForm('daily-recon', 'depositChecks', e.target.value)} />
                      <InputField label="Insurance" prefix="$" value={forms['daily-recon'].depositInsurance} onChange={e => updateForm('daily-recon', 'depositInsurance', e.target.value)} />
                      <InputField label="Care Credit" prefix="$" value={forms['daily-recon'].depositCareCredit} onChange={e => updateForm('daily-recon', 'depositCareCredit', e.target.value)} />
                      <InputField label="VCC" prefix="$" value={forms['daily-recon'].depositVCC} onChange={e => updateForm('daily-recon', 'depositVCC', e.target.value)} />
                    </div>
                    <div className="mt-3">
                      <InputField label="Notes" value={forms['daily-recon'].notes} onChange={e => updateForm('daily-recon', 'notes', e.target.value)} placeholder="Any notes..." />
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm p-5 border">
                    <h2 className="font-semibold mb-4">Documents</h2>
                    <div className="space-y-4">
                      <FileUpload label="EOD Day Sheets" files={files['daily-recon'].eodDaySheets} onFilesChange={f => updateFiles('daily-recon', 'eodDaySheets', f)} onViewFile={setViewingFile} />
                      <FileUpload label="EOD Bank Receipts" files={files['daily-recon'].eodBankReceipts} onFilesChange={f => updateFiles('daily-recon', 'eodBankReceipts', f)} onViewFile={setViewingFile} />
                      <FileUpload label="Other Files" files={files['daily-recon'].otherFiles} onFilesChange={f => updateFiles('daily-recon', 'otherFiles', f)} onViewFile={setViewingFile} />
                    </div>
                  </div>
                </>
              )}

              {activeModule === 'billing-inquiry' && (
                <>
                  <div className="bg-white rounded-2xl shadow-sm p-5 border">
                    <h2 className="font-semibold mb-4">Billing Inquiry</h2>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField label="Patient Name" value={forms['billing-inquiry'].patientName} onChange={e => updateForm('billing-inquiry', 'patientName', e.target.value)} />
                      <InputField label="Chart Number" value={forms['billing-inquiry'].chartNumber} onChange={e => updateForm('billing-inquiry', 'chartNumber', e.target.value)} />
                      <InputField label="Date of Service" type="date" value={forms['billing-inquiry'].dateOfService} onChange={e => updateForm('billing-inquiry', 'dateOfService', e.target.value)} />
                      <InputField label="Amount in Question" prefix="$" value={forms['billing-inquiry'].amountInQuestion} onChange={e => updateForm('billing-inquiry', 'amountInQuestion', e.target.value)} />
                      <InputField label="Best Contact Method" value={forms['billing-inquiry'].bestContactMethod} onChange={e => updateForm('billing-inquiry', 'bestContactMethod', e.target.value)} options={['Phone', 'Email', 'Text']} />
                      <InputField label="Best Contact Time" value={forms['billing-inquiry'].bestContactTime} onChange={e => updateForm('billing-inquiry', 'bestContactTime', e.target.value)} />
                      <InputField label="Reviewed By" value={forms['billing-inquiry'].reviewedBy} onChange={e => updateForm('billing-inquiry', 'reviewedBy', e.target.value)} />
                      <InputField label="Initials" value={forms['billing-inquiry'].initials} onChange={e => updateForm('billing-inquiry', 'initials', e.target.value)} />
                      <InputField label="Status" value={forms['billing-inquiry'].status} onChange={e => updateForm('billing-inquiry', 'status', e.target.value)} options={['Pending', 'In Progress', 'Resolved']} />
                      <InputField label="Result / Patient Contacted By" value={forms['billing-inquiry'].result} onChange={e => updateForm('billing-inquiry', 'result', e.target.value)} />
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm p-5 border">
                    <FileUpload label="Documentation Billing Inquiry" files={files['billing-inquiry'].documentation} onFilesChange={f => updateFiles('billing-inquiry', 'documentation', f)} onViewFile={setViewingFile} />
                  </div>
                </>
              )}

              {activeModule === 'bills-payment' && (
                <>
                  <div className="bg-white rounded-2xl shadow-sm p-5 border">
                    <h2 className="font-semibold mb-4">Bills Payment</h2>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField label="Bill Status" value={forms['bills-payment'].billStatus} onChange={e => updateForm('bills-payment', 'billStatus', e.target.value)} options={['Pending', 'Approved', 'Paid']} />
                      <InputField label="Date" type="date" value={forms['bills-payment'].date} onChange={e => updateForm('bills-payment', 'date', e.target.value)} />
                      <InputField label="Vendor" value={forms['bills-payment'].vendor} onChange={e => updateForm('bills-payment', 'vendor', e.target.value)} />
                      <InputField label="Description (Bill Details)" value={forms['bills-payment'].description} onChange={e => updateForm('bills-payment', 'description', e.target.value)} />
                      <InputField label="Amount" prefix="$" value={forms['bills-payment'].amount} onChange={e => updateForm('bills-payment', 'amount', e.target.value)} />
                      <InputField label="Due Date" type="date" value={forms['bills-payment'].dueDate} onChange={e => updateForm('bills-payment', 'dueDate', e.target.value)} />
                      <InputField label="Manager Initials" value={forms['bills-payment'].managerInitials} onChange={e => updateForm('bills-payment', 'managerInitials', e.target.value)} />
                      <InputField label="Accounts Payable Reviewed" value={forms['bills-payment'].apReviewed} onChange={e => updateForm('bills-payment', 'apReviewed', e.target.value)} options={['Yes', 'No']} />
                      <InputField label="Date Reviewed" type="date" value={forms['bills-payment'].dateReviewed} onChange={e => updateForm('bills-payment', 'dateReviewed', e.target.value)} />
                      <InputField label="Paid (Y/N)" value={forms['bills-payment'].paid} onChange={e => updateForm('bills-payment', 'paid', e.target.value)} options={['Yes', 'No']} />
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm p-5 border">
                    <FileUpload label="Bills Documentation" files={files['bills-payment'].documentation} onFilesChange={f => updateFiles('bills-payment', 'documentation', f)} onViewFile={setViewingFile} />
                  </div>
                </>
              )}

              {activeModule === 'order-requests' && (
                <>
                  <div className="bg-white rounded-2xl shadow-sm p-5 border">
                    <h2 className="font-semibold mb-4">Order Request</h2>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField label="Date Entered" type="date" value={forms['order-requests'].dateEntered} onChange={e => updateForm('order-requests', 'dateEntered', e.target.value)} />
                      <InputField label="Vendor" value={forms['order-requests'].vendor} onChange={e => updateForm('order-requests', 'vendor', e.target.value)} />
                      <InputField label="Invoice Number" value={forms['order-requests'].invoiceNumber} onChange={e => updateForm('order-requests', 'invoiceNumber', e.target.value)} />
                      <InputField label="Invoice Date" type="date" value={forms['order-requests'].invoiceDate} onChange={e => updateForm('order-requests', 'invoiceDate', e.target.value)} />
                      <InputField label="Due Date" type="date" value={forms['order-requests'].dueDate} onChange={e => updateForm('order-requests', 'dueDate', e.target.value)} />
                      <InputField label="Amount" prefix="$" value={forms['order-requests'].amount} onChange={e => updateForm('order-requests', 'amount', e.target.value)} />
                      <InputField label="Entered By" value={forms['order-requests'].enteredBy} onChange={e => updateForm('order-requests', 'enteredBy', e.target.value)} />
                      <div className="col-span-2">
                        <InputField label="Notes" value={forms['order-requests'].notes} onChange={e => updateForm('order-requests', 'notes', e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm p-5 border">
                    <FileUpload label="Order Invoices" files={files['order-requests'].orderInvoices} onFilesChange={f => updateFiles('order-requests', 'orderInvoices', f)} onViewFile={setViewingFile} />
                  </div>
                </>
              )}

              {activeModule === 'refund-requests' && (
                <>
                  <div className="bg-white rounded-2xl shadow-sm p-5 border">
                    <h2 className="font-semibold mb-4">Refund Request</h2>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField label="Patient Name" value={forms['refund-requests'].patientName} onChange={e => updateForm('refund-requests', 'patientName', e.target.value)} />
                      <InputField label="Chart Number" value={forms['refund-requests'].chartNumber} onChange={e => updateForm('refund-requests', 'chartNumber', e.target.value)} />
                      <InputField label="Parent Name" value={forms['refund-requests'].parentName} onChange={e => updateForm('refund-requests', 'parentName', e.target.value)} />
                      <InputField label="RP Address" value={forms['refund-requests'].rpAddress} onChange={e => updateForm('refund-requests', 'rpAddress', e.target.value)} />
                      <InputField label="Date of Request" type="date" value={forms['refund-requests'].dateOfRequest} onChange={e => updateForm('refund-requests', 'dateOfRequest', e.target.value)} />
                      <InputField label="Type Transaction" value={forms['refund-requests'].typeTransaction} onChange={e => updateForm('refund-requests', 'typeTransaction', e.target.value)} options={['Refund', 'Credit', 'Adjustment']} />
                      <div className="col-span-2">
                        <InputField label="Description" value={forms['refund-requests'].description} onChange={e => updateForm('refund-requests', 'description', e.target.value)} />
                      </div>
                      <InputField label="Amount Requested" prefix="$" value={forms['refund-requests'].amountRequested} onChange={e => updateForm('refund-requests', 'amountRequested', e.target.value)} />
                      <InputField label="Best Method of Contact" value={forms['refund-requests'].bestContactMethod} onChange={e => updateForm('refund-requests', 'bestContactMethod', e.target.value)} options={['Phone', 'Email', 'Text']} />
                      <InputField label="Eassist Audited" value={forms['refund-requests'].eassistAudited} onChange={e => updateForm('refund-requests', 'eassistAudited', e.target.value)} options={['Yes', 'No', 'N/A']} />
                      <InputField label="Status" value={forms['refund-requests'].status} onChange={e => updateForm('refund-requests', 'status', e.target.value)} options={['Pending', 'Approved', 'Completed', 'Denied']} />
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm p-5 border">
                    <FileUpload label="Documentation Refund Request" files={files['refund-requests'].documentation} onFilesChange={f => updateFiles('refund-requests', 'documentation', f)} onViewFile={setViewingFile} />
                  </div>
                </>
              )}

              {activeModule === 'it-requests' && (
                <>
                  <div className="bg-white rounded-2xl shadow-sm p-5 border">
                    <h2 className="font-semibold mb-4">IT Request</h2>
                    <p className="text-sm text-gray-500 mb-4">Request # will be auto-generated</p>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField label="Date Reported" type="date" value={forms['it-requests'].dateReported} onChange={e => updateForm('it-requests', 'dateReported', e.target.value)} />
                      <InputField label="Urgency Level" value={forms['it-requests'].urgencyLevel} onChange={e => updateForm('it-requests', 'urgencyLevel', e.target.value)} options={['Low', 'Medium', 'High', 'Critical']} />
                      <InputField label="Requester Name" value={forms['it-requests'].requesterName} onChange={e => updateForm('it-requests', 'requesterName', e.target.value)} />
                      <InputField label="Device / System Affected" value={forms['it-requests'].deviceSystem} onChange={e => updateForm('it-requests', 'deviceSystem', e.target.value)} />
                      <InputField label="Best Contact Method" value={forms['it-requests'].bestContactMethod} onChange={e => updateForm('it-requests', 'bestContactMethod', e.target.value)} options={['Phone', 'Email', 'Text']} />
                      <InputField label="Best Contact Time" value={forms['it-requests'].bestContactTime} onChange={e => updateForm('it-requests', 'bestContactTime', e.target.value)} />
                    </div>
                    <div className="mt-3">
                      <InputField label="Description of Issue" large value={forms['it-requests'].descriptionOfIssue} onChange={e => updateForm('it-requests', 'descriptionOfIssue', e.target.value)} placeholder="Please describe the issue in detail..." />
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm p-5 border">
                    <FileUpload label="Documentation IT Requests" files={files['it-requests'].documentation} onFilesChange={f => updateFiles('it-requests', 'documentation', f)} onViewFile={setViewingFile} />
                  </div>
                </>
              )}

              <button onClick={() => saveEntry(activeModule)} disabled={saving}
                className="w-full py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          )}

          {/* HISTORY/RECORDS VIEW */}
          {view === 'history' && (
            <div className="bg-white rounded-2xl shadow-sm p-5 border">
              <h2 className="font-semibold mb-4">
                {isAdmin ? 'All Records' : 'Recent Entries'} ({entries.length})
              </h2>
              {entries.length === 0 ? <p className="text-gray-500">No entries yet</p> : (
                <div className="space-y-3">
                  {entries.slice(0, 50).map(e => (
                    <div key={e.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{e.requestNumber || e.timestamp?.split('T')[0]}</p>
                            <StatusBadge status={e.status || e.billStatus} />
                            {e.urgencyLevel && <span className={`px-2 py-0.5 rounded text-xs ${e.urgencyLevel === 'Critical' ? 'bg-red-500 text-white' : e.urgencyLevel === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100'}`}>{e.urgencyLevel}</span>}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{e.location} • {e.enteredBy}</p>
                          {e.patientName && <p className="text-sm mt-1">Patient: {e.patientName}</p>}
                          {e.vendor && <p className="text-sm mt-1">Vendor: {e.vendor}</p>}
                          {e.descriptionOfIssue && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{e.descriptionOfIssue}</p>}
                          {e.resolutionNotes && <p className="text-sm text-green-600 mt-1">Resolution: {e.resolutionNotes}</p>}
                          {getFileCount(e) > 0 && (
                            <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                              <File className="w-3 h-3" /> {getFileCount(e)} file(s) attached
                            </p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          {e.total !== undefined && <p className="font-semibold">${e.total?.toFixed(2)}</p>}
                          {e.amount && <p className="font-semibold">${e.amount}</p>}
                          {e.amountRequested && <p className="font-semibold">${e.amountRequested}</p>}
                          
                          {/* Admin Status Update for IT Requests */}
                          {isAdmin && activeModule === 'it-requests' && (
                            <div className="mt-2">
                              {editingStatus === e.id ? (
                                <div className="space-y-2">
                                  <select 
                                    className="w-full p-2 border rounded text-sm"
                                    defaultValue={e.status}
                                    onChange={(ev) => {
                                      const select = ev.target;
                                      const notesInput = select.parentElement.querySelector('input');
                                      if (ev.target.value) {
                                        updateITStatus(e.id, ev.target.value, notesInput?.value || '', user.name);
                                      }
                                    }}
                                  >
                                    {IT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                  <input type="text" placeholder="Resolution notes..." className="w-full p-2 border rounded text-sm" />
                                  <button onClick={() => setEditingStatus(null)} className="text-xs text-gray-500">Cancel</button>
                                </div>
                              ) : (
                                <button onClick={() => setEditingStatus(e.id)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
                                  <Edit3 className="w-3 h-3" /> Update Status
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DOCUMENTS VIEW - Admin Only */}
          {view === 'documents' && isAdmin && (
            <div className="bg-white rounded-2xl shadow-sm p-5 border">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <FolderOpen className="w-5 h-5" /> All Documents
              </h2>
              {entries.length === 0 ? <p className="text-gray-500">No entries with documents</p> : (
                <div className="space-y-4">
                  {entries.filter(e => getFileCount(e) > 0).map(e => (
                    <div key={e.id} className="p-4 border rounded-xl">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium">{e.requestNumber || e.timestamp?.split('T')[0]}</p>
                          <p className="text-sm text-gray-500">{e.location} • {e.enteredBy}</p>
                        </div>
                        <StatusBadge status={e.status || e.billStatus} />
                      </div>
                      <div className="space-y-2">
                        {e.files && Object.entries(e.files).map(([category, fileList]) => (
                          fileList && fileList.length > 0 && (
                            <div key={category}>
                              <p className="text-xs text-gray-500 mb-1">{category.replace(/([A-Z])/g, ' $1').trim()}</p>
                              <div className="flex flex-wrap gap-2">
                                {fileList.map((file, i) => (
                                  <button key={i} onClick={() => setViewingFile(file)}
                                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-blue-50 hover:text-blue-600">
                                    <Eye className="w-4 h-4" />
                                    <span className="truncate max-w-[150px]">{file.name}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AI VIEW */}
          {view === 'ai' && (
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
                <h2 className="font-semibold flex items-center gap-2"><Bot className="w-5 h-5" /> AI Assistant</h2>
              </div>
              <div className="h-72 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                      <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                    </div>
                  </div>
                ))}
                {aiLoading && <div className="flex justify-start"><div className="bg-gray-100 p-3 rounded-2xl"><Loader2 className="w-5 h-5 animate-spin" /></div></div>}
              </div>
              <div className="p-3 border-t flex gap-2">
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && askAI()} placeholder="Ask a question..."
                  className="flex-1 p-3 border rounded-xl outline-none" />
                <button onClick={askAI} disabled={aiLoading} className="px-4 bg-blue-600 text-white rounded-xl">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
