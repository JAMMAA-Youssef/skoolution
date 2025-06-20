import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, BookOpen, Users, Award } from 'lucide-react';
import authService from "@/app/services/auth.service";
import useAuthGuard from "@/app/hooks/useAuthGuard";

// Mock data generation functions
const generateChartData = () => {
  const data = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  for (const month of months) {
    data.push({
      name: month,
      Teacher: Math.floor(Math.random() * 50) + 10,
      Student: Math.floor(Math.random() * 80) + 20,
      Girls: Math.floor(Math.random() * 400) + 100,
      Boys: Math.floor(Math.random() * 400) + 100,
    });
  }
  return data;
};

const generateStarStudents = (users) => {
  if (!users || users.length === 0) return [];
  return users
    .slice(0, 3)
    .map((user, index) => ({
      id: user._id.slice(-6).toUpperCase(),
      name: user.username,
      marks: Math.floor(Math.random() * 200) + 1000,
      percentage: `${Math.floor(Math.random() * 10) + 90}%`,
      year: new Date().getFullYear() - index,
    }));
};

const generateStudentActivity = (users) => {
    if (!users || users.length === 0) return [];
    const activities = ["Chess", "Drawing", "Science", "Math Contest", "Spelling Bee"];
    return users.slice(0, 3).map((user, index) => ({
        time: `${index + 1} Day ago`,
        text: `1st place in "${activities[index % activities.length]}"`,
        details: `${user.username} won 1st place in "${activities[index % activities.length]}"`,
    }));
};

const StatCard = ({ title, value, icon, iconBgColor }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
    <div className={`p-3 rounded-full ${iconBgColor}`}>
      {icon}
    </div>
  </div>
);

export default function AdminDashboard() {
  useAuthGuard();

  const [userCount, setUserCount] = useState(null);
  const [subjectCount, setSubjectCount] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [starStudents, setStarStudents] = useState([]);
  const [studentActivity, setStudentActivity] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
    try {
      const users = await authService.getAllUsers();
        const userArray = Array.isArray(users) ? users : [];
        setUserCount(userArray.length);

      const subjects = await authService.getAllSubjects();
      setSubjectCount(Array.isArray(subjects) ? subjects.length : 0);

        const stats = await authService.getRegistrationStats();
        setChartData(stats);

        const starStudentsData = await authService.getStarStudents();
        setStarStudents(starStudentsData);

        setStudentActivity(generateStudentActivity(userArray));
        
    } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setUserCount(0);
        setSubjectCount(0);
        setChartData(generateChartData());
        setStarStudents([]);
        setStudentActivity([]);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome Admin!</h1>
        <p className="text-sm text-gray-500">Home / Admin</p>
                </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="Students" value={userCount !== null ? userCount : '...'} icon={<Users className="text-orange-500" />} iconBgColor="bg-orange-100" />
        <StatCard title="Awards" value="50+" icon={<Award className="text-yellow-500" />} iconBgColor="bg-yellow-100" />
        <StatCard title="Department" value={subjectCount !== null ? subjectCount : '...'} icon={<BookOpen className="text-blue-500" />} iconBgColor="bg-blue-100" />
        <StatCard title="Revenue" value="$505" icon={<DollarSign className="text-green-500" />} iconBgColor="bg-green-100" />
                </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Overview Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Teacher" stroke="#8884d8" />
              <Line type="monotone" dataKey="Student" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
              </div>

        {/* Number of Students Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Number of Students</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Boys" fill="#8884d8" />
              <Bar dataKey="Girls" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
              </div>
            </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Star Students Table */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Star Students</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  </tr>
                </thead>
                <tbody>
                {starStudents.map((student) => (
                  <tr key={student.id} className="border-b">
                    <td className="py-2 px-4 whitespace-nowrap text-sm text-gray-900">{student.id}</td>
                    <td className="py-2 px-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                    <td className="py-2 px-4 whitespace-nowrap text-sm text-gray-900">{student.marks}</td>
                    <td className="py-2 px-4 whitespace-nowrap text-sm text-gray-900">{student.percentage}</td>
                    <td className="py-2 px-4 whitespace-nowrap text-sm text-gray-900">{student.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        </div>

        {/* Student Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Student Activity</h2>
          <ul>
            {studentActivity.map((activity, index) => (
              <li key={index} className="flex items-start mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center mr-4">
                  <Award className="text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold">{activity.text}</p>
                  <p className="text-sm text-gray-500">{activity.details}</p>
                </div>
                <p className="text-xs text-gray-400 ml-auto whitespace-nowrap">{activity.time}</p>
              </li>
            ))}
          </ul>
              </div>
            </div>
    </div>
  );
} 