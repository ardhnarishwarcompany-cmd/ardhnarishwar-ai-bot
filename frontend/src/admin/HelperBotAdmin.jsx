import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import { Bot, ThumbsUp, ThumbsDown, MessageSquare, Compass, Sparkles, CheckCircle, RefreshCw, Plus, ExternalLink } from 'lucide-react';
import { usePageContext } from '../context/PageContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function HelperBotAdmin() {
  const { startTour, toursList, setIsBotOpen } = usePageContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [knowledgeList, setKnowledgeList] = useState([]);
  const [activeTab, setActiveTab] = useState('feedback');

  const fetchStatsAndData = () => {
    setLoading(true);
    Promise.all([
      axios.get(`${API_BASE}/helper-bot/admin/stats`),
      axios.get(`${API_BASE}/helper-bot/knowledge`)
    ])
      .then(([statsRes, knowRes]) => {
        setStats(statsRes.data?.stats || null);
        setKnowledgeList(knowRes.data?.customKnowledge || []);
      })
      .catch((err) => {
        console.error('Failed to load bot admin data:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStatsAndData();
  }, []);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="admin-page-title flex items-center gap-2">
            <Bot className="w-7 h-7 text-violet-600" /> Website Helper Bot Management
          </h1>
          <p className="admin-page-sub">
            Monitor AI guide interactions, feedback satisfaction, knowledge base, and guided tours.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsBotOpen(true);
            }}
            className="px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-4 h-4" /> Open Live Bot
          </button>
          <button
            onClick={fetchStatsAndData}
            className="p-2 border border-slate-700 hover:bg-slate-800 rounded-lg text-slate-300 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Satisfaction Rate</p>
          <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {stats ? `${stats.helpfulPercentage}%` : '100%'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Based on user ratings</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Helpful Ratings</p>
          <h3 className="text-2xl font-bold text-violet-600 dark:text-violet-400 mt-1 flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-emerald-500" />
            {stats ? stats.helpfulCount : 0}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Users confirmed answer helped</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unhelpful Ratings</p>
          <h3 className="text-2xl font-bold text-rose-500 mt-1 flex items-center gap-2">
            <ThumbsDown className="w-5 h-5 text-rose-500" />
            {stats ? stats.unhelpfulCount : 0}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Areas for knowledge improvement</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Tours</p>
          <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-2">
            <Compass className="w-5 h-5" />
            {toursList.length}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Interactive walkthroughs</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('feedback')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'feedback'
              ? 'border-violet-600 text-violet-600 dark:text-violet-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          User Feedback & Query Logs
        </button>
        <button
          onClick={() => setActiveTab('tours')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'tours'
              ? 'border-violet-600 text-violet-600 dark:text-violet-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Guided Tours ({toursList.length})
        </button>
      </div>

      {/* TAB 1: FEEDBACK LOGS */}
      {activeTab === 'feedback' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              Recent User Responses & Ratings
            </h3>
            <span className="text-xs text-slate-500">
              Live feedback logged across all visitor sessions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">User Query</th>
                  <th className="py-3 px-4">Page Context</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {stats?.recentFeedback?.length > 0 ? (
                  stats.recentFeedback.map((fb) => (
                    <tr key={fb.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        {fb.isHelpful ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                            <ThumbsUp className="w-3 h-3" /> Helpful
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
                            <ThumbsDown className="w-3 h-3" /> Not Helpful
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-xs font-medium">
                        {fb.userQuery}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono">
                        {fb.pageTitle || fb.pagePath || '/'}
                      </td>
                      <td className="py-3 px-4 capitalize">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {fb.userRole || 'guest'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(fb.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">
                      No feedback recorded yet. Visit the public site or portals, ask the helper bot questions, and click Helpful/Not Helpful to test!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: GUIDED TOURS */}
      {activeTab === 'tours' && (
        <div className="space-y-4">
          {toursList.map((tour) => (
            <div
              key={tour.id}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base text-slate-800 dark:text-slate-100">{tour.title}</h4>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-semibold">
                    {tour.steps.length} Steps
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">{tour.description}</p>
              </div>

              <button
                onClick={() => startTour(tour.id)}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm shrink-0 transition"
              >
                <Compass className="w-4 h-4" /> Test Tour Live
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
