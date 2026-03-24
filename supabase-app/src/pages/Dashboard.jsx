import React, { useState, useEffect, useCallback } from 'react'
import {
  RiTaskLine, RiCheckboxCircleLine, RiLoader4Line, RiAlertLine,
  RiAddLine, RiUserAddLine, RiCalendarEventLine
} from 'react-icons/ri'
import { useAuth } from '../context/AuthContext'
import { useRole } from '../hooks/useRole'
import { useRealtime } from '../hooks/useRealtime'
import { getDashboardStats } from '../lib/analyticsService'
import { fetchUpcomingMeetings } from '../lib/teamService'
import { fetchMembers } from '../lib/memberService'
import StatCard from '../components/ui/StatCard'
import DailyProgressChart from '../components/charts/DailyProgressChart'
import TaskVelocityBar from '../components/charts/TaskVelocityBar'
import EmptyState from '../components/ui/EmptyState'
import Avatar from '../components/ui/Avatar'
import { StatusBadge } from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import '../styles/dashboard.css'

function fmtMeetingDate(d) {
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export default function Dashboard() {
  const { profile } = useAuth()
  const { isAdmin } = useRole()

  const [stats, setStats] = useState({ total: 0, completedToday: 0, inProgress: 0, blocked: 0, progressData: [], velocityData: [] })
  const [meetings, setMeetings] = useState([])
  const [members, setMembers] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const data = await getDashboardStats()
      setStats(data)
    } catch (e) {
      console.error('Dashboard stats error', e)
    } finally {
      setLoadingStats(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    fetchUpcomingMeetings(3).then(setMeetings).catch(console.error)
    if (isAdmin) fetchMembers().then(data => setMembers(data.slice(0, 5))).catch(console.error)
  }, [fetchStats, isAdmin])

  // Real-time updates
  useRealtime('dashboard-tasks', 'tasks', null, fetchStats)
  useRealtime('dashboard-activity', 'daily_activity', null, fetchStats)

  return (
    <>
      {isAdmin && (
        <div className="dashboard-actions">
          <button className="btn-outline">
            <RiUserAddLine size={15} /> Add Member
          </button>
          <button className="btn-primary">
            <RiAddLine size={15} /> New Task
          </button>
        </div>
      )}

      {loadingStats ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Spinner size={28} />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="dashboard-stat-row">
            <StatCard label="Total Tasks" value={stats.total} delta="+0 today" deltaPositive icon={RiTaskLine} />
            <StatCard label="Completed Today" value={stats.completedToday} delta="" deltaPositive icon={RiCheckboxCircleLine} accentColor="var(--success)" />
            <StatCard label="In Progress" value={stats.inProgress} icon={RiLoader4Line} accentColor="var(--blue)" />
            <StatCard label="Blocked" value={stats.blocked} icon={RiAlertLine} accentColor="var(--danger)" />
          </div>

          {/* Charts row */}
          <div className="dashboard-charts-row">
            <div className="card">
              <div className="dashboard-section-title">Team Daily Progress — Last 14 Days</div>
              <DailyProgressChart data={stats.progressData} />
            </div>

            <div className="card">
              <div className="dashboard-section-title">Task Velocity — Last 7 Days</div>
              <TaskVelocityBar data={stats.velocityData} />
            </div>
          </div>

          {/* Bottom row */}
          <div className="dashboard-bottom-row">
            {/* Active Members */}
            {isAdmin && (
              <div className="card">
                <div className="dashboard-section-title">Active Members</div>
                {members.length === 0 ? (
                  <EmptyState title="No members yet" icon={RiUserAddLine} />
                ) : (
                  members.map(m => (
                    <div key={m.id} className="active-member-row">
                      <Avatar name={m.full_name} team={m.team} size={30} />
                      <span className="active-member-name">{m.full_name}</span>
                      <span className="badge badge-member" style={{ marginRight: 6 }}>{m.role}</span>
                      <span className="active-member-task-count">{m.taskCount ?? 0} tasks</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Upcoming Meetings */}
            <div className="card">
              <div className="dashboard-section-title">Upcoming Meetings</div>
              {meetings.length === 0 ? (
                <EmptyState title="No upcoming meetings" icon={RiCalendarEventLine} />
              ) : (
                meetings.map(m => (
                  <div key={m.id} className="meeting-row">
                    <div className="meeting-row-icon">
                      <RiCalendarEventLine size={16} color="var(--blue)" />
                    </div>
                    <div>
                      <div className="meeting-title">{m.title}</div>
                      <div className="meeting-time">{fmtMeetingDate(m.scheduled_at)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
