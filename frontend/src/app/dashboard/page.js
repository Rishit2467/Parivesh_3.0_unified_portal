"use client";

// ── Dashboard Page ───────────────────────────────────────────────────
// Role-aware dashboard — routes each role to their relevant view

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import api from "@/lib/api";

function DashboardContent() {
  const { user, isAdmin, isProponent, isScrutiny, isMom } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        if (isAdmin || isScrutiny || isMom) {
          const { data } = await api.get("/dashboard/overview");
          setStats(data);
        } else if (isProponent) {
          const { data } = await api.get("/applications/my?limit=1");
          setStats({ total_applications: data.total });
        }
      } catch {
        // Stats not critical — silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [isAdmin, isProponent, isScrutiny, isMom]);

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <>
      <PageHeader
        title={`Welcome, ${user?.name}`}
        subtitle={`${user?.role?.name?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} Dashboard`}
      />

      {/* Admin / Team stats */}
      {(isAdmin || isScrutiny || isMom) && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Applications"
            value={stats.total_applications}
            icon="📋"
            color="primary"
          />
          <StatCard
            label="Under Scrutiny"
            value={stats.by_status?.under_scrutiny || 0}
            icon="🔍"
            color="yellow"
          />
          <StatCard
            label="Approved"
            value={stats.by_status?.approved_for_meeting || 0}
            icon="✅"
            color="green"
          />
          <StatCard
            label="Published"
            value={stats.by_status?.final_publication || 0}
            icon="📢"
            color="purple"
          />
        </div>
      )}

      {/* Additional admin stats */}
      {isAdmin && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Total Users"
            value={stats.total_users}
            icon="👥"
            color="primary"
          />
          <StatCard
            label="Completed Payments"
            value={stats.completed_payments}
            icon="💰"
            color="green"
          />
          <StatCard
            label="Total Revenue (₹)"
            value={stats.total_revenue?.toLocaleString("en-IN") || "0"}
            icon="📈"
            color="purple"
          />
        </div>
      )}

      {/* Proponent view */}
      {isProponent && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <StatCard
            label="My Applications"
            value={stats.total_applications}
            icon="📋"
            color="primary"
          />
        </div>
      )}

      {/* Status overview for admin */}
      {isAdmin && stats?.by_status && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {Object.entries(stats.by_status).map(([status, count]) => (
              <div key={status} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-xs text-gray-500 mt-1 capitalize">
                  {status.replace(/_/g, " ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
