'use client';

import { useEffect, useState } from 'react';
import { getFirebaseIdToken } from '@/lib/firebaseAuth';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, CartesianGrid
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00c49f'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [contactsByCompany, setContactsByCompany] = useState([]);
  const [activityTimeline, setActivityTimeline] = useState([]);
  const [tagDistribution, setTagDistribution] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = await getFirebaseIdToken();
        const fetchWithAuth = async (url) => {
          const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
          if (!res.ok) throw new Error(`Failed to fetch ${url}`);
          return await res.json();
        };

        const [summaryRes, companyRes, timelineRes, tagRes] = await Promise.all([
          fetchWithAuth('http://localhost:5000/api/dashboard/summary'),
          fetchWithAuth('http://localhost:5000/api/dashboard/contacts-by-company'),
          fetchWithAuth('http://localhost:5000/api/dashboard/activities-timeline'),
          fetchWithAuth('http://localhost:5000/api/dashboard/tag-distribution'),
        ]);

        setSummary(summaryRes);
        setContactsByCompany(companyRes.map(item => ({ company: item._id || 'Unknown', count: item.count })));
        setActivityTimeline(timelineRes.map(item => ({ date: item._id, count: item.count })));
        setTagDistribution(tagRes.map(item => ({ tag: item._id, count: item.count })));
        setError(null);
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Failed to load dashboard data.');
      }
    };
    if (user) fetchAll();
  }, [user]);

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-indigo-50 via-white to-blue-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-indigo-700 mb-2 tracking-tight drop-shadow-sm">Dashboard</h1>

      {error && <p className="text-red-500 font-semibold bg-red-50 border border-red-200 rounded-lg px-4 py-2 w-fit">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="transition-shadow hover:shadow-xl shadow-md rounded-2xl border-0 bg-white/90">
          <CardContent className="p-6 flex flex-col items-center">
            <p className="text-sm text-gray-500">Total Contacts</p>
            <p className="text-3xl font-extrabold text-indigo-600 mt-1">{summary?.totalContacts ?? '0'}</p>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-xl shadow-md rounded-2xl border-0 bg-white/90">
          <CardContent className="p-6 flex flex-col items-center">
            <p className="text-sm text-gray-500">New This Week</p>
            <p className="text-3xl font-extrabold text-blue-500 mt-1">{summary?.newThisWeek ?? '0'}</p>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-xl shadow-md rounded-2xl border-0 bg-white/90">
          <CardContent className="p-6 flex flex-col items-center">
            <p className="text-sm text-gray-500">Total Activities</p>
            <p className="text-3xl font-extrabold text-green-500 mt-1">{summary?.totalActivities ?? '0'}</p>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-xl shadow-md rounded-2xl border-0 bg-white/90">
          <CardContent className="p-6 flex flex-col items-center">
            <p className="text-sm text-gray-500">Active Tags</p>
            <p className="text-3xl font-extrabold text-yellow-500 mt-1">{summary?.activeTags ?? '0'}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="rounded-2xl shadow-md border-0 bg-white/95 transition-shadow hover:shadow-xl">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-4 text-indigo-700 flex items-center gap-2"><span className="inline-block w-2 h-2 bg-indigo-400 rounded-full"></span>Contacts by Company</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={contactsByCompany} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="company" type="category" width={100} />
                <Tooltip wrapperClassName="!rounded-lg !shadow-lg !bg-white/90"/>
                <Bar dataKey="count" fill="#8884d8" radius={[8, 8, 8, 8]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md border-0 bg-white/95 transition-shadow hover:shadow-xl">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-4 text-green-700 flex items-center gap-2"><span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>Activity Timeline</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip wrapperClassName="!rounded-lg !shadow-lg !bg-white/90"/>
                <Line type="monotone" dataKey="count" stroke="#82ca9d" strokeWidth={3} dot={{ r: 4, fill: '#82ca9d' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md border-0 bg-white/95 transition-shadow hover:shadow-xl">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-4 text-yellow-700 flex items-center gap-2"><span className="inline-block w-2 h-2 bg-yellow-400 rounded-full"></span>Tag Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={tagDistribution} dataKey="count" nameKey="tag" outerRadius={100} label>
                  {tagDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip wrapperClassName="!rounded-lg !shadow-lg !bg-white/90"/>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
