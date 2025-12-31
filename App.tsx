
import React, { useState, useEffect, useCallback } from 'react';
import { QuizHeader } from './components/QuizHeader';
import { Timer } from './components/Timer';
import { QUIZ_QUESTIONS, TIME_PER_QUESTION, DEFAULT_WEBHOOK_URL } from './constants';
import { QuizState, AssessmentResult, StoredResult } from './types';
import { getMentorFeedback } from './services/geminiService';

const DB_KEY = 'izyshow_assessment_db';
const CONFIG_KEY = 'izyshow_admin_config';
const ADMIN_PASSWORD = 'IZY';

const App: React.FC = () => {
  const [step, setStep] = useState<'welcome' | 'email' | 'quiz' | 'results' | 'admin'>('welcome');
  const [email, setEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [resultsList, setResultsList] = useState<StoredResult[]>([]);
  const [webhookUrl, setWebhookUrl] = useState(DEFAULT_WEBHOOK_URL);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'sent'>('idle');
  const [showHelp, setShowHelp] = useState(false);
  
  const [quizState, setQuizState] = useState<QuizState>({
    userEmail: '',
    currentQuestionIndex: 0,
    answers: [],
    timeLeft: TIME_PER_QUESTION,
    isFinished: false,
    startTime: null,
  });
  
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  useEffect(() => {
    const savedResults = localStorage.getItem(DB_KEY);
    if (savedResults) {
      try {
        setResultsList(JSON.parse(savedResults));
      } catch (e) {
        console.error("Error loading local DB", e);
      }
    }
    
    const savedConfig = localStorage.getItem(CONFIG_KEY);
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.webhookUrl) {
          setWebhookUrl(config.webhookUrl);
        }
      } catch (e) {
        console.error("Error loading config", e);
      }
    }
  }, []);

  const resetQuiz = () => {
    setStep('welcome');
    setEmail('');
    setAssessmentResult(null);
    setQuizState({
      userEmail: '',
      currentQuestionIndex: 0,
      answers: [],
      timeLeft: TIME_PER_QUESTION,
      isFinished: false,
      startTime: null,
    });
    setSyncStatus('idle');
  };

  const handleSaveConfig = () => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ webhookUrl: webhookUrl }));
    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 3000);
  };

  const syncToRemote = async (result: AssessmentResult | any, isTest = false) => {
    if (!webhookUrl) {
      if (isTest) alert("Aucune URL Webhook n'est configurée.");
      return;
    }
    
    if (isTest) setTestStatus('testing');
    else setSyncStatus('syncing');

    try {
      // Note: Google Apps Script require a simple text/plain POST to avoid complex CORS issues with no-cors
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          ...result,
          timestamp: new Date().toISOString(),
          platform: 'IZYSHOW-Assessment',
          type: isTest ? 'TEST_CONNECTION' : 'REAL_DATA'
        })
      });
      
      if (isTest) {
        setTestStatus('sent');
        setTimeout(() => setTestStatus('idle'), 3000);
      } else {
        setSyncStatus('success');
      }
    } catch (error) {
      console.error("Sync error:", error);
      if (isTest) setTestStatus('idle');
      else setSyncStatus('error');
    }
  };

  const sendEmailReport = () => {
    if (!assessmentResult) return;
    
    const subject = `Rapport de Test Comptable IZYSHOW - ${assessmentResult.email}`;
    const body = `
Bonjour l'équipe IZYSHOW,

Voici les résultats du test technique de ${assessmentResult.email} :

SCORE GLOBAL : ${assessmentResult.score} / 20 (${Math.round((assessmentResult.score/20)*100)}%)

AVIS DU RESPONSABLE COMPTABLE (IA) :
"${assessmentResult.feedback}"

Cordialement,
Plateforme Assessment IZYSHOW
    `.trim();

    window.location.href = `mailto:contact@izyshow.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const saveToDatabase = (result: AssessmentResult) => {
    const newEntry: StoredResult = {
      ...result,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      date: new Date().toLocaleString('fr-FR')
    };
    const updated = [newEntry, ...resultsList];
    setResultsList(updated);
    localStorage.setItem(DB_KEY, JSON.stringify(updated));
    return newEntry;
  };

  const startQuiz = () => {
    if (!email || !email.includes('@')) {
      alert("Veuillez entrer une adresse email valide.");
      return;
    }
    setQuizState({
      userEmail: email,
      currentQuestionIndex: 0,
      answers: [],
      timeLeft: TIME_PER_QUESTION,
      isFinished: false,
      startTime: Date.now(),
    });
    setStep('quiz');
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...quizState.answers, answerIndex];
    if (quizState.currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setQuizState({
        ...quizState,
        answers: newAnswers,
        currentQuestionIndex: quizState.currentQuestionIndex + 1,
      });
    } else {
      finishQuiz(newAnswers);
    }
  };

  const handleTimeUp = useCallback(() => {
    handleAnswer(-1);
  }, [quizState.currentQuestionIndex]);

  const finishQuiz = async (finalAnswers: number[]) => {
    let score = 0;
    const categoryStats: Record<string, { correct: number; total: number }> = {};

    finalAnswers.forEach((answer, index) => {
      const question = QUIZ_QUESTIONS[index];
      if (!categoryStats[question.category]) {
        categoryStats[question.category] = { correct: 0, total: 0 };
      }
      categoryStats[question.category].total++;
      if (answer === question.correctAnswer) {
        score++;
        categoryStats[question.category].correct++;
      }
    });

    const categoryBreakdown: Record<string, number> = {};
    Object.keys(categoryStats).forEach(cat => {
      categoryBreakdown[cat] = Math.round((categoryStats[cat].correct / categoryStats[cat].total) * 100);
    });

    const result: AssessmentResult = {
      email: quizState.userEmail,
      score,
      totalQuestions: QUIZ_QUESTIONS.length,
      categoryBreakdown,
      feedback: "Analyse en cours par le Responsable Comptable...",
    };

    setAssessmentResult(result);
    setStep('results');
    setIsGeneratingFeedback(true);
    
    const mentorFeedback = await getMentorFeedback(result);
    const finalResult = { ...result, feedback: mentorFeedback };
    setAssessmentResult(finalResult);
    setIsGeneratingFeedback(false);
    
    saveToDatabase(finalResult);
    syncToRemote(finalResult);
  };

  const deleteResult = (id: string) => {
    if (window.confirm("Supprimer ce résultat ?")) {
      const updated = resultsList.filter(r => r.id !== id);
      setResultsList(updated);
      localStorage.setItem(DB_KEY, JSON.stringify(updated));
    }
  };

  const handleAdminAuth = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const input = adminPass.trim().toUpperCase();
    if (input === 'IZY') {
      setIsAdminAuth(true);
    } else {
      alert("Code d'accès incorrect.");
    }
  };

  const appScriptCode = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Créer les en-têtes si la feuille est vide
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Date", "Email", "Score", "Feedback", "Type"]);
    }

    if (data.type === "TEST_CONNECTION") {
      sheet.appendRow([new Date(), "SIGNAL TEST", "N/A", "Connexion Réussie", "TEST"]);
    } else {
      sheet.appendRow([
        new Date(),
        data.email,
        data.score + " / 20",
        data.feedback,
        "CANDIDATURE"
      ]);
    }
    return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
  } catch(err) {
    return ContentService.createTextOutput("Erreur: " + err.message).setMimeType(ContentService.MimeType.TEXT);
  }
}`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <QuizHeader />

      <main className="flex-grow flex items-center justify-center p-4">
        {step === 'welcome' && (
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100 text-center text-balance">
            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
              Recrutement IZYSHOW
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4 text-balance">Test Technique Comptable</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Évaluation des connaissances sur la gestion d'une marketplace : flux financiers, TVA sur locations, et fondamentaux de clôture d'exercice.
            </p>
            <button 
              onClick={() => setStep('email')} 
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transform transition active:scale-95"
            >
              Démarrer l'évaluation
            </button>
          </div>
        )}

        {step === 'email' && (
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Identification</h2>
            <p className="text-slate-500 mb-6 text-sm">Entrez votre email pour enregistrer vos résultats.</p>
            <form onSubmit={(e) => { e.preventDefault(); startQuiz(); }} className="space-y-4">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.nom@email.com"
                autoFocus
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button 
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all"
              >
                Lancer le Test
              </button>
              <button type="button" onClick={() => setStep('welcome')} className="w-full text-slate-400 text-sm font-medium">Retour</button>
            </form>
          </div>
        )}

        {step === 'quiz' && (
          <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            <div className="h-1.5 bg-slate-100 w-full">
              <div 
                className="h-full bg-indigo-600 transition-all duration-300" 
                style={{ width: `${((quizState.currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }} 
              />
            </div>
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <span className="text-xs font-black text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-full">
                  {QUIZ_QUESTIONS[quizState.currentQuestionIndex].category}
                </span>
                <Timer 
                  initialSeconds={TIME_PER_QUESTION} 
                  onTimeUp={handleTimeUp} 
                  isActive={step === 'quiz'} 
                  questionIndex={quizState.currentQuestionIndex} 
                />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 leading-snug">
                {QUIZ_QUESTIONS[quizState.currentQuestionIndex].text}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {QUIZ_QUESTIONS[quizState.currentQuestionIndex].options.map((option, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleAnswer(idx)} 
                    className="w-full p-5 text-left border-2 border-slate-100 rounded-2xl hover:border-indigo-600 hover:bg-indigo-50 transition-all group flex items-start"
                  >
                    <span className="w-8 h-8 flex-shrink-0 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-bold mr-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-slate-700 font-semibold mt-1">{option}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 'results' && assessmentResult && (
          <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mb-4">
                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-2">{assessmentResult.score} / 20</h2>
              <p className="text-slate-500 font-medium italic">Merci {assessmentResult.email}, vos réponses ont été analysées.</p>
              
              <div className="mt-4 h-6">
                {syncStatus === 'syncing' && <span className="text-indigo-500 text-xs animate-pulse">Synchronisation automatique...</span>}
                {syncStatus === 'success' && <span className="text-emerald-500 text-xs font-bold uppercase tracking-tighter">✓ Score enregistré dans le Google Sheet</span>}
                {syncStatus === 'error' && <button onClick={() => syncToRemote(assessmentResult)} className="text-red-500 text-xs font-bold underline">⚠ Échec synchro. Réessayer ?</button>}
              </div>
            </div>
            
            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 mb-8 relative">
              <div className="absolute -top-3 left-6 px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full">AVIS EXPERT</div>
              <h4 className="text-lg font-bold text-indigo-900 mb-2">Feedback du Responsable Comptable :</h4>
              {isGeneratingFeedback ? (
                <div className="flex items-center space-x-2 text-indigo-400 italic">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.15s]"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                  <span>Génération du rapport personnalisé...</span>
                </div>
              ) : (
                <p className="text-indigo-800 leading-relaxed italic">"{assessmentResult.feedback}"</p>
              )}
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={sendEmailReport} 
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                Envoyer mon rapport à contact@izyshow.com
              </button>
              <button onClick={resetQuiz} className="w-full py-3 text-slate-400 text-sm font-bold hover:text-slate-600">Quitter le test</button>
            </div>
          </div>
        )}

        {step === 'admin' && (
          <div className="max-w-6xl w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            {!isAdminAuth ? (
              <div className="max-w-md mx-auto py-10">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Accès Administration</h2>
                </div>
                <form onSubmit={handleAdminAuth} className="space-y-4">
                  <input 
                    type="password" 
                    value={adminPass} 
                    onChange={(e) => setAdminPass(e.target.value)} 
                    placeholder="Tapez IZY ici" 
                    autoFocus
                    className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-center text-2xl tracking-[0.5em] font-mono"
                  />
                  <div className="flex gap-3">
                     <button type="button" onClick={() => setStep('welcome')} className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-xl font-bold">Retour</button>
                     <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all">Connexion</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                <div className="flex justify-between items-center mb-8 pb-4 border-b">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Espace Recrutement</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1">Dashboard des candidatures</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setIsAdminAuth(false)} className="px-4 py-2 text-slate-400 hover:text-slate-600 text-sm font-bold uppercase tracking-widest">Déconnexion</button>
                    <button onClick={() => setStep('welcome')} className="px-5 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-black uppercase tracking-widest">Fermer</button>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Liaison Google Sheet</h4>
                    </div>
                    <button onClick={() => setShowHelp(!showHelp)} className="text-xs font-bold text-indigo-600 hover:underline">
                      {showHelp ? "Cacher l'aide" : "Comment configurer mon Google Sheet ?"}
                    </button>
                  </div>

                  {showHelp && (
                    <div className="bg-white border border-indigo-100 rounded-xl p-6 mb-6 shadow-sm">
                      <h5 className="font-bold text-slate-800 mb-2">🚀 Guide Rapide (Éviter l'erreur postData)</h5>
                      <ol className="text-sm text-slate-600 space-y-2 list-decimal ml-4 mb-4">
                        <li>Ouvrez votre Google Sheet.</li>
                        <li>Allez dans <b>Extensions > Apps Script</b>.</li>
                        <li>Effacez tout et collez le code ci-dessous.</li>
                        <li>Cliquez sur <b>Déployer > Nouveau déploiement</b>.</li>
                        <li>Type : <b>Application Web</b>. Exécuter en tant que : <b>Moi</b>. Qui a accès : <b>Tout le monde</b>.</li>
                        <li>Copiez l'URL obtenue et collez-la ci-dessous.</li>
                        <li className="text-red-500 font-bold">⚠️ Ne cliquez PAS sur "Exécuter" dans Google Script, cliquez sur "Envoyer un test" ICI.</li>
                      </ol>
                      <div className="relative group">
                        <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto font-mono max-h-48">
                          {appScriptCode}
                        </pre>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(appScriptCode); alert("Code copié !"); }}
                          className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded text-[10px] font-bold transition-all"
                        >
                          COPIER LE CODE
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 items-end">
                    <div className="flex-grow">
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">URL Google Apps Script (Webhook)</label>
                      <input 
                        type="text" 
                        value={webhookUrl} 
                        onChange={(e) => setWebhookUrl(e.target.value)} 
                        placeholder="https://script.google.com/macros/s/.../exec" 
                        className="w-full p-3 text-sm border border-slate-200 rounded-xl bg-white shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={handleSaveConfig}
                        className="bg-slate-900 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-black transition-all"
                      >
                        Enregistrer
                      </button>
                      <button 
                        onClick={() => syncToRemote({ test: "IZYSHOW_VERIFICATION", date: new Date().toLocaleString() }, true)}
                        className={`px-5 py-3 rounded-xl text-sm font-bold shadow-md transition-all border-2 ${testStatus === 'sent' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-indigo-600 border-indigo-600 hover:bg-indigo-50'}`}
                      >
                        {testStatus === 'idle' && "Envoyer un test"}
                        {testStatus === 'testing' && "Envoi..."}
                        {testStatus === 'sent' && "Signal OK !"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b">
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-6">Email</th>
                        <th className="py-4 px-6 text-center">Score</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {resultsList.length === 0 ? (
                        <tr><td colSpan={4} className="py-20 text-center text-slate-300 italic">Aucun résultat enregistré localement.</td></tr>
                      ) : (
                        resultsList.map((res) => (
                          <tr key={res.id} className="text-sm hover:bg-slate-50 transition-colors group">
                            <td className="py-5 px-6 text-slate-400 tabular-nums">{res.date}</td>
                            <td className="py-5 px-6 font-bold text-slate-800">{res.email}</td>
                            <td className="py-5 px-6 text-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-black ${res.score >= 12 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {res.score} / 20
                              </span>
                            </td>
                            <td className="py-5 px-6 text-right flex gap-2 justify-end">
                              <button onClick={() => syncToRemote(res)} className="p-2 text-indigo-400 hover:text-indigo-600" title="Synchroniser vers Sheet">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                              </button>
                              <button onClick={() => deleteResult(res.id)} className="text-red-300 hover:text-red-500 p-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="py-8 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          <span>IZYSHOW Assessment Hub — 2024</span>
          <button onClick={() => setStep('admin')} className="hover:text-indigo-600 transition-colors">Portail Admin</button>
        </div>
      </footer>
    </div>
  );
};

export default App;
